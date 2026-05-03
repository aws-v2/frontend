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

export interface DocManifest {
    service: string;
    version?: string;
    categories: DocCategory[];
    isInternal: boolean;
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

type UserRole = 'ADMIN' | 'ENGINEER' | 'USER' | null;

const SERVICE_REGISTRY: Record<string, string> = {
    s3: '/s3',
    rds: '/rds',
    networking: '/network',
    metrics: '/metrics',
    lambda: '/lambda',
    gamelift: '/gamelift',
    fargate: '/fargate',
    compute: '/ec2',
    gateway: '/gateway',
    billing: '/billing',
    identity: '/identity',
    config: '/config',
    auth: '/auth',
    sagemaker: '/llm',
};

// ── JWT helpers ───────────────────────────────────────────────────────────────

function decodeJWTPayload(token: string): Record<string, any> | null {
    try {
        const parts = token.split('.');
        if (parts.length < 2 || !parts[1]) return null;
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/'); // Ensure valid base64
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

function getToken(): string | null {
    return localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
}

// ─────────────────────────────────────────────────────────────────────────────

export const useDocsStore = defineStore('docs', {
    state: () => ({
        // Unified Manifest Store: Contains processed categories (Public + Internal if Admin)
        manifests: {} as Record<string, DocManifest>,
        manifestErrors: {} as Record<string, string>,

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
        isPrivilegedUser: (state) => state.userRole === 'ADMIN' || state.userRole === 'ENGINEER',
    },

    actions: {
        openHelp(service: string, slug: string) {
            this.drawer.service = service;
            this.drawer.slug = slug;
            this.drawer.isOpen = true;
        },

        closeHelp() {
            this.drawer.isOpen = false;
        },

        // ── Unified Fetch: Automatically handles role-based filtering backend ────
        async fetchAllManifests() {
            this.loading = true;
            this.userRole = getRoleFromToken();
            const token = getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const fetches = Object.entries(SERVICE_REGISTRY).map(async ([service, basePath]) => {
                try {
                    // Unified endpoint: one call, returns what you are allowed to see
                    const response = await apiClient.get(`${basePath}/docs`, { headers });
                    if (response.data?.data) {
                        this.manifests[service] = response.data.data;
                    }
                } catch (err: any) {
                    const status = err?.response?.status;
                    this.manifestErrors[service] = status === 404 ? 'Service has no docs.' : 'Unreachable.';
                }
            });

            await Promise.allSettled(fetches);
            this.loading = false;
        },

        // ── Unified Doc Fetching: No more "internal" flag needed in local calls ────
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

            const token = getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            try {
                // Single unified path: /api/v1/[service]/docs/[slug]
                const response = await apiClient.get(`${basePath}/docs/${slug}`, { headers });
                if (response.data?.data) {
                    this.currentDoc = response.data.data;
                }
            } catch (err: any) {
                const status = err?.response?.status;
                if (status === 401 || status === 403) {
                    this.error = "Unauthorized: Admin privileges required.";
                } else if (status === 404) {
                    this.error = "Document not found.";
                } else {
                    this.error = "Could not load documentation.";
                }
            } finally {
                this.loading = false;
            }
        }
    },
});
