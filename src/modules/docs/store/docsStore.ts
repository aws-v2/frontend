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

const SERVICE_REGISTRY: Record<string, string> = {
    s3: '/s3',
    compute: '/compute',
    lambda: '/lambda',
    rds: '/rds',
    identity: '/identity',
    gamelift: '/gamelift',
    auth: '/auth',
};

export const useDocsStore = defineStore('docs', {
    state: () => ({
        manifests: {} as Record<string, DocManifest>,
        manifestErrors: {} as Record<string, string>,   // per-service fetch errors
        currentDoc: null as DocResponse | null,
        activeService: null as string | null,
        loading: false,
        error: null as string | null,

        drawer: {
            isOpen: false,
            service: null as string | null,
            slug: null as string | null,
        },
    }),

    actions: {
        openHelp(service: string, slug: string) {
            this.drawer.service = service;
            this.drawer.slug = slug;
            this.drawer.isOpen = true;
        },

        closeHelp() {
            this.drawer.isOpen = false;
        },

        async fetchAllManifests() {
            this.loading = true;
            this.error = null;
            this.manifestErrors = {};

            const fetchPromises = Object.entries(SERVICE_REGISTRY).map(async ([service, basePath]) => {
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

            await Promise.allSettled(fetchPromises);
            this.loading = false;
        },

        async fetchDocContent(service: string, slug: string) {
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

            try {
                const response = await apiClient.get(`${basePath}/docs/${slug}`);
                if (response.data?.data) {
                    this.currentDoc = response.data.data;
                } else {
                    this.error = `"${slug}" was found but the server returned no content.`;
                }
            } catch (err: any) {
                const status = err?.response?.status;
                if (status === 404) {
                    this.error = `No documentation found for "${slug}" in the ${service} service.`;
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