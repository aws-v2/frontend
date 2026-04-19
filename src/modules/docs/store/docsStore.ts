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
    // sagemaker: '/sagemaker',

};

// ── JWT helpers ───────────────────────────────────────────────────────────────

function decodeJWTPayload(token: string): Record<string, any> | null {
    try {
        const parts = token.split('.');
        if (parts.length < 2 || !parts[1]) {
            return null;
        }

        const base64 = parts[1];
        const padded = base64.padEnd(
            base64.length + (4 - (base64.length % 4)) % 4,
            '='
        );

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

function isPrivileged(role: UserRole): boolean {
    return role === 'ADMIN' || role === 'ENGINEER';
}

// ─────────────────────────────────────────────────────────────────────────────

export const useDocsStore = defineStore('docs', {
    state: () => ({
        // public manifests — no auth required
        manifests: {} as Record<string, DocManifest>,
        manifestErrors: {} as Record<string, string>,

        // internal manifests — ADMIN/ENGINEER only
        internalManifests: {} as Record<string, DocManifest>,
        internalManifestErrors: {} as Record<string, string>,

        currentDoc: null as DocResponse | null,
        activeService: null as string | null,
        loading: false,
        error: null as string | null,

        // resolved once on fetch, used by sidebar
        userRole: null as UserRole,

        // sidebar collapse state — public starts collapsed for privileged users
        publicCollapsed: false,

        drawer: {
            isOpen: false,
            service: null as string | null,
            slug: null as string | null,
        },
    }),

    getters: {
        isPrivilegedUser: (state) => isPrivileged(state.userRole),
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

        togglePublicCollapsed() {
            this.publicCollapsed = !this.publicCollapsed;
        },

        // ── Fetch all manifests based on role ─────────────────────────────────
        async fetchAllManifests() {
            this.loading = true;
            this.error = null;
            this.manifestErrors = {};
            this.internalManifestErrors = {};

            // resolve role once
            this.userRole = getRoleFromToken();

            // public docs — no auth, fetch for everyone
            const publicFetches = Object.entries(SERVICE_REGISTRY).map(async ([service, basePath]) => {
                try {
                    const response = await apiClient.get(`${basePath}/docs`);
                    if (response.data?.data) {
                        this.manifests[service] = response.data.data;
                    } else {
                        this.manifestErrors[service] = 'Service returned an empty response.';
                    }
                } catch (err: any) {
                    const status = err?.response?.status;
                    this.manifestErrors[service] = status
                        ? `Failed to load — server returned ${status}.`
                        : 'Service is unreachable. Check that it is running.';
                }
            });

            await Promise.allSettled(publicFetches);

            console.log(`isPrivileged(this.userRole):`, isPrivileged(this.userRole));


            // internal docs — ADMIN/ENGINEER only
            if (isPrivileged(this.userRole)) {
                // public section starts collapsed for privileged users
                this.publicCollapsed = true;

                const token = getToken();
                const internalFetches = Object.entries(SERVICE_REGISTRY).map(async ([service, basePath]) => {
                    try {
                        const response = await apiClient.get(`${basePath}/internal/docs`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (response.data?.data) {
                            this.internalManifests[service] = response.data.data;
                        } else {
                            this.internalManifestErrors[service] = 'Service returned an empty response.';
                        }
                    } catch (err: any) {
                        const status = err?.response?.status;
                        this.internalManifestErrors[service] = status
                            ? `Failed to load — server returned ${status}.`
                            : 'Service is unreachable.';
                    }
                });

                await Promise.allSettled(internalFetches);
            }

            this.loading = false;
        },

        // ── Fetch doc content — checks internal first for privileged users ────
        async fetchDocContent(service: string, slug: string, internal = false) {
            this.loading = true;
            this.error = null;
            this.currentDoc = null;
            this.activeService = service;

            const basePath = SERVICE_REGISTRY[service];
            if (!basePath) {
                this.error = `Unknown service "${service}". It is not registered.`;
                this.loading = false;
                return;
            }

            const path = internal ? `${basePath}/internal/docs/${slug}` : `${basePath}/docs/${slug}`;
            const headers = internal ? { Authorization: `Bearer ${getToken()}` } : {};

            try {
                const response = await apiClient.get(path, { headers });
                if (response.data?.data) {
                    this.currentDoc = response.data.data;
                } else {
                    this.error = `"${slug}" was found but the server returned no content.`;
                }
            } catch (err: any) {
                const status = err?.response?.status;
                if (status === 404) {
                    this.error = `No documentation found for "${slug}" in the ${service} service.`;
                } else if (status === 401 || status === 403) {
                    this.error = `You do not have permission to view this document.`;
                } else if (status) {
                    this.error = `Could not load this page — the ${service} service returned ${status}.`;
                } else {
                    this.error = `The ${service} service is unreachable. Check that it is running.`;
                }
            } finally {
                this.loading = false;
            }
        },

        getAssetUrl(service: string, filename: string) {
            const basePath = SERVICE_REGISTRY[service] ?? `/${service}`;
            return `${basePath}/docs/assets/${filename}`;
        },
    },
});