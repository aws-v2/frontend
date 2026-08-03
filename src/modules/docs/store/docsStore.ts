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



export interface CategoriesMapped {
    categories_mapped: DocCategory[];
    scope: 'public' | 'internal';
}

// "service":    chooseString(publicData, internalData),
// "apiVersion": chooseVersion(publicData, internalData),
// "scope":      "internal",
// "internal":   safeCategories(internalData),
// "public":     safeCategories(publicData),
export interface DocManifest {
    service: string;
    version?: string;
    apiVersion?: string;
    scope?: string;
    internal?: DocCategory[];
    public?: DocCategory;
}

export interface ScopedCategories {
    scope: string;
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

type UserRole = 'ADMIN' | 'ENGINEER' | 'USER' | null;

const SERVICE_REGISTRY: Record<string, string> = {
    s3: '/s3',
    // rds: '/rds',
    // metrics: '/metrics',
    // lambda: '/lambda',
    // gamelift: '/gamelift',
    ec2: '/compute',
    gateway: '/gateway',
    // identity: '/identity',
    // config: '/config',
    auth: '/auth',
    // sagemaker: '/llm',
};

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

function getToken(): string | null {
    return localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
}
// export interface DocManifest {
//     service: string;
//     version?: string;
//     apiVersion?:string;
//     scope?:string;
//     internal?:string[];
//     public?:string;
//     categories: DocCategory[];
//     categories_mapped: CategoriesMapped;
// }

// export interface ScopedCategories {
//     scope: 'public' | 'internal';
//     publicCategories: DocCategory[];
//     internalCategories: DocCategory[];
// }


// ── categories_mapped splitting helper ────────────────────────────────────────
// Shared by the store getter below and safe to unit test in isolation.
function splitScopedCategories(manifest: DocManifest | undefined): ScopedCategories {
    const mapped = manifest?.apiVersion;



    if (!manifest || !Array.isArray(manifest.public)) {
        return { scope: manifest?.scope, publicCategories: [], internalCategories: [] };
    }

    if (manifest.scope === 'internal') {
        return {
            scope: 'internal',
            publicCategories: manifest.public,
            internalCategories: manifest.internal,
        };
    }

    // scope === 'public' (or an unexpected/degraded shape) -> everything is public.
    return {
        scope: 'public',
        publicCategories: manifest.public,
        internalCategories: [],
    };
}

// ─────────────────────────────────────────────────────────────────────────────

export const useDocsStore = defineStore('docs', {
    state: () => ({
        // Stores one manifest per service: { s3: { service, categories, categories_mapped, ... } }
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
        // Splits a service's categories_mapped into { publicCategories, internalCategories, scope }.
        // Use this everywhere instead of reading `categories_mapped` directly so the
        // positional assumption above only lives in one place.
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

        // ── Unified Fetch: Automatically handles role-based filtering backend ────
        async fetchAllManifests() {
            this.loading = true;
            this.userRole = getRoleFromToken();

            const fetches = Object.entries(SERVICE_REGISTRY).map(async ([service, basePath]) => {
                try {
                    // One call to get the role-filtered manifest for this service.
                    // The backend returns { data: { service, internal,public, scope, service //categories, categories_mapped, ... } }
                    // apiClient interceptor handles Authorization header
                    const response = await apiClient.get(`${basePath}/docs`);
                    if (response.data?.data) {
                        this.manifests[service] = response.data.data;
                        console.log(`loging the base path forthe docs## url ${this.manifests[service]?.service}`)

                    }
                } catch (err: any) {
                    const status = err?.response?.status;
                    this.manifestErrors[service] = status === 404 ? 'No documentation found.' : 'Unreachable.';
                }
            });

            await Promise.allSettled(fetches);
            this.loading = false;
        },

        // ── Unified Doc Fetching: Access is handled by the backend ────
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
                // The backend checks both public and internal folders based on your JWT role
                // apiClient interceptor handles Authorization header
                const response = await apiClient.get(`${basePath}/docs/${slug}`);
                if (response.data?.data) {
                    this.currentDoc = response.data.data;
                }
            } catch (err: any) {
                const status = err?.response?.status;
                if (status === 401 || status === 403) {
                    this.error = "Unauthorized: Access denied.";
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