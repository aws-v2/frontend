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

// Service registry mapping service IDs to their API base paths
const SERVICE_REGISTRY: Record<string, string> = {
    s3: '/s3',
    compute: '/compute',
    lambda: '/lambda',
    rds: '/rds',
    auth: '/auth',
};

// Services that have live backend docs endpoints
const LIVE_SERVICES = new Set(['s3', 'compute']);

// Mock data for services that don't have backend docs yet
const MOCK_DATA: Record<string, { manifest: DocManifest; docs: Record<string, DocResponse> }> = {
    compute: {
        manifest: {
            service: 'Compute',
            version: 'V2',
            categories: [
                {
                    title: 'General',
                    items: [
                        { title: 'EC2 Instances', slug: 'ec2-overview' },
                        { title: 'Auto Scaling', slug: 'auto-scaling' }
                    ]
                }
            ]
        },
        docs: {
            'ec2-overview': {
                metadata: { title: 'EC2 Instances', description: 'Elastic Compute Cloud instances for scalable processing.', icon: 'cpu', lastUpdated: '2026-02-18', tags: ['Compute', 'Core'] },
                content: '# EC2 Overview\n\nWelcome to the Amazon Elastic Compute Cloud (Amazon EC2) documentation. Amazon EC2 provides scalable computing capacity in the AWS Cloud.\n\n### Key Features\n- **Instances**: Virtual computing environments.\n- **Amazon Machine Images (AMIs)**: Preconfigured templates for your instances.\n- **Instance Types**: Various configurations of CPU, memory, storage, and networking capacity.'
            }
        }
    },
    lambda: {
        manifest: {
            service: 'Lambda',
            version: 'V1',
            categories: [
                {
                    title: 'Serverless',
                    items: [{ title: 'Lambda Functions', slug: 'lambda-functions' }]
                }
            ]
        },
        docs: {
            'lambda-functions': {
                metadata: { title: 'Lambda Functions', description: 'Run code without thinking about servers.', icon: 'cpu', lastUpdated: '2026-02-18', tags: ['Serverless', 'Compute'] },
                content: '# AWS Lambda\n\nAWS Lambda is a serverless, event-driven compute service that lets you run code for virtually any type of application or backend service without provisioning or managing servers.'
            }
        }
    },
    rds: {
        manifest: {
            service: 'RDS',
            version: 'V3',
            categories: [
                {
                    title: 'Relational Database',
                    items: [{ title: 'RDS Clusters', slug: 'rds-clusters' }]
                }
            ]
        },
        docs: {
            'rds-clusters': {
                metadata: { title: 'RDS Clusters', description: 'Managed relational database service.', icon: 'database', lastUpdated: '2026-02-18', tags: ['Database', 'RDS'] },
                content: '# Amazon RDS\n\nAmazon Relational Database Service (Amazon RDS) makes it easy to set up, operate, and scale a relational database in the cloud.'
            }
        }
    },
    auth: {
        manifest: {
            service: 'Identity',
            version: 'V1',
            categories: [
                {
                    title: 'Access Management',
                    items: [{ title: 'IAM Overview', slug: 'iam-overview' }]
                }
            ]
        },
        docs: {
            'iam-overview': {
                metadata: { title: 'IAM Overview', description: 'Manage access to AWS resources.', icon: 'shield', lastUpdated: '2026-02-18', tags: ['Security', 'Identity'] },
                content: '# AWS IAM\n\nAWS Identity and Access Management (IAM) is a web service that helps you securely control access to AWS resources.'
            }
        }
    },
    s3: {
        manifest: {
            service: 'S3',
            version: 'V2',
            categories: [
                {
                    title: 'Storage',
                    items: [
                        { title: 'S3 Overview', slug: 's3-overview' },
                        { title: 'Buckets', slug: 's3-buckets-overview' },
                        { title: 'Storage Lens', slug: 's3-storage-lens-overview' }
                    ]
                }
            ]
        },
        docs: {
            's3-overview': {
                metadata: { title: 'S3 Overview', description: 'Scalable cloud storage.', icon: 'layers', lastUpdated: '2026-02-18', tags: ['Storage', 'Core'] },
                content: '# Amazon S3\n\nAmazon Simple Storage Service (Amazon S3) is an object storage service that offers industry-leading scalability, data availability, security, and performance.'
            },
            's3-buckets-overview': {
                metadata: { title: 'Buckets', description: 'Managing S3 buckets.', icon: 'layers', lastUpdated: '2026-02-18', tags: ['Storage', 'Management'] },
                content: '# S3 Buckets\n\nA bucket is a container for objects stored in Amazon S3. You can store any number of objects in a bucket and can have up to 100 buckets in your account.'
            },
            's3-storage-lens-overview': {
                metadata: { title: 'Storage Lens', description: 'Storage analytics and insights.', icon: 'layers', lastUpdated: '2026-02-18', tags: ['Analytics', 'Storage'] },
                content: '# S3 Storage Lens\n\nAmazon S3 Storage Lens provides visibility into object storage usage and activity trends across your entire organization.'
            }
        }
    }
};

// Map aliases (like ec2 -> compute)
const MOCK_MAPPING: Record<string, string> = {
    ec2: 'compute'
};

export const useDocsStore = defineStore('docs', {
    state: () => ({
        manifests: {} as Record<string, DocManifest>,
        currentDoc: null as DocResponse | null,
        activeService: null as string | null,
        loading: false,
        error: null as string | null,

        // Contextual Drawer State (Global)
        drawer: {
            isOpen: false,
            service: null as string | null,
            slug: null as string | null,
        }
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

            const services = Object.keys(SERVICE_REGISTRY);
            const fetchPromises = services.map(async (service) => {
                // Fetch from live API for services with backend doc support
                if (LIVE_SERVICES.has(service)) {
                    try {
                        const apiBase = SERVICE_REGISTRY[service];
                        const response = await apiClient.get(`${apiBase}/docs`);
                        if (response.data?.data) {
                            this.manifests[service] = response.data.data;
                            return;
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch manifest for ${service}. Using fallback.`);
                    }
                }
                // Fallback to mock data
                const mockKey = MOCK_MAPPING[service] || service;
                if (MOCK_DATA[mockKey]) {
                    this.manifests[service] = MOCK_DATA[mockKey].manifest;
                }
            });

            await Promise.allSettled(fetchPromises);
            this.loading = false;
        },

        async fetchDocContent(service: string, slug: string) {
            this.loading = true;
            this.error = null;
            this.activeService = service;

            // Use live API for supported services, mock data for others
            if (LIVE_SERVICES.has(service)) {
                try {
                    const apiBase = SERVICE_REGISTRY[service] || `/${service}`;
                    const response = await apiClient.get(`${apiBase}/docs/${slug}`);
                    this.currentDoc = response.data.data;
                    this.loading = false;
                    return;
                } catch (err: any) {
                    console.warn(`Live doc fetch failed for ${service}/${slug}, using fallback.`);
                    // Fall through to mock data below
                }
            }

            // Fallback: mock/static data
            const mockKey = MOCK_MAPPING[service] || service;
            if (MOCK_DATA[mockKey]?.docs[slug]) {
                this.currentDoc = MOCK_DATA[mockKey].docs[slug];
            } else {
                this.error = `Documentation not found: ${service}/${slug}`;
            }
        },

        getAssetUrl(service: string, filename: string) {
            const apiBase = SERVICE_REGISTRY[service] || `/api/v1/${service}`;
            return `${apiBase}/docs/assets/${filename}`;
        }
    }
});
