import { defineStore } from 'pinia';
import apiClient from '@/shared/api/apiClient';

export interface DocItem {
    title: string;
    slug: string;
}

export interface DocCategory {
    title: string;
    items: DocItem[];
}

// Shape returned by the gateway's aggregate manifest endpoint
// (GET /api/v1/gateway/docs/all-manifest), one entry per service:
// { ec2: { service, apiVersion, scope, internal, public }, s3: {...}, ... }
//
// `internal` and `public` are already role-filtered server-side — for a
// non-privileged caller, `internal` comes back as an empty array, not
// omitted and not the full list. The frontend never needs to re-derive
// access from `scope` or a decoded role; it can just render whatever
// arrays are present.
export interface DocManifest {
    service: string;
    apiVersion?: string;
    scope?: string;
    internal?: DocCategory[];
    public?: DocCategory[];
}

export interface ScopedCategories {
    scope?: string;
    publicCategories: DocCategory[];
    internalCategories: DocCategory[];
}

export interface DocResponse {
    metadata: {
        title: string;
        description: string;
        icon: string;
        lastUpdated: string;
        tags: string[];
    };
    content: string;
}

type UserRole = 'ADMIN' | 'SYSTEM' | 'STAFF' | 'USER' | null;

// Base paths used only for fetching a single doc's content, per service —
// the manifest itself no longer needs this map, since the gateway's
// aggregate endpoint already returns every service that has docs.
const SERVICE_REGISTRY: Record<string, string> = {
    s3: '/s3',
    rds: '/rds',
    lambda: '/lambda',
    ec2: '/ec2',
    gateway: '/gateway',
    auth: '/auth',
    sagemaker: '/llm',
};

// Roles the gateway treats as privileged (must match ELEVATED_ROLES on the
// gateway side) — used here only for UI treatment (the "Admin Access
// Active" badge), never to decide what data to show. What to show is
// already decided by the backend and reflected in which arrays are
// populated.
const PRIVILEGED_ROLES: UserRole[] = ['ADMIN', 'SYSTEM', 'STAFF'];

// ── JWT helpers ───────────────────────────────────────────────────────────────

function decodeJWTPayload(token: string): Record<string, any> | null {
    try {
        const parts = token.split('.');
        if (parts.length < 2 || !parts[1]) return null;
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
}

function getRoleFromToken(): UserRole {
    const token = localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
    if (!token) return null;
    const payload = decodeJWTPayload(token);
    return (payload?.role as UserRole) ?? null;
}

// ── categories splitting helper ────────────────────────────────────────────────
// Shared by the store getter below and safe to unit test in isolation.
// Purely reads whatever the backend already sent — no role logic here,
// since the backend has already filtered `internal` down to an empty
// array for anyone who shouldn't see it.
function splitScopedCategories(manifest: DocManifest | undefined): ScopedCategories {
    return {
        scope: manifest?.scope,
        publicCategories: manifest?.public ?? [],
        internalCategories: manifest?.internal ?? [],
    };
}

// ─────────────────────────────────────────────────────────────────────────────

export const useDocsStore = defineStore('docs', {
    state: () => ({
        // One manifest per service, keyed exactly as the gateway returns it:
        // { ec2: {...}, s3: {...} }
        manifests: {} as Record<string, DocManifest>,

        currentDoc: null as DocResponse | null,
        activeService: null as string | null,
        loading: false,
        error: null as string | null,

        userRole: null as UserRole,
        drawer: {
            isOpen: false,
            service: null as string | null,
            slug: null as string | null,
        },
    }),

    getters: {
        isPrivilegedUser: (state) => PRIVILEGED_ROLES.includes(state.userRole),
    },

    actions: {
        // Splits a service's manifest into { publicCategories, internalCategories, scope }.
        // Use this everywhere instead of reading manifest.public/.internal directly.
        scopedCategories(serviceId: string): ScopedCategories {
            return splitScopedCategories(this.manifests[serviceId]);
        },

        openHelp(service: string, slug: string) {
            this.drawer.service = service;
            this.drawer.slug = slug;
            this.drawer.isOpen = true;
        },

        closeHelp() {
            this.drawer.isOpen = false;
        },

        // ── Unified fetch: one call to the gateway, already role-filtered ────
        async fetchAllManifests() {
            this.loading = true;
            this.error = null;
            this.userRole = getRoleFromToken();

            try {
                // The gateway resolves the caller's role itself and returns the
                // manifest map directly — no envelope, no per-service calls.
                const response = await apiClient.get(`${SERVICE_REGISTRY.gateway}/docs/all-manifest`);
                this.manifests = response.data ?? {};
            } catch (err: any) {
                this.error = 'Could not load documentation manifests.';
            } finally {
                this.loading = false;
            }
        },

        // ── Unified doc fetching: access is still checked by the owning service ──
        async fetchDocContent(service: string, slug: string) {
            this.loading = true;
            this.error = null;
            this.currentDoc = null;
            this.activeService = service;

            const basePath = SERVICE_REGISTRY[service];
            if (!basePath) {
                this.error = `Unknown service "${service}".`;
                this.loading = false;
                return;
            }

            try {
                // The owning service checks the caller's role (via the standard
                // auth headers) before returning internal vs. public content.
                const response = await apiClient.get(`${basePath}/docs/${slug}`);
                if (response.data?.data) {
                    this.currentDoc = response.data.data;
                }
            } catch (err: any) {
                const status = err?.response?.status;
                if (status === 401 || status === 403) {
                    this.error = 'Unauthorized: Access denied.';
                } else if (status === 404) {
                    this.error = 'Document not found.';
                } else {
                    this.error = 'Could not load documentation.';
                }
            } finally {
                this.loading = false;
            }
        },
    },
});