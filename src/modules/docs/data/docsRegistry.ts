import { defineAsyncComponent } from 'vue'

export interface DocItem {
    id: string;
    label: string;
    active: boolean;
    component: any;
}

export interface DocCategory {
    title: string;
    items: DocItem[];
}

export const docsRegistry: DocCategory[] = [
    {
        title: 'GETTING STARTED',
        items: [
            { id: 'intro', label: 'Introduction', active: true, component: defineAsyncComponent(() => import('../content/overview/Intro.vue')) },
            { id: 'architecture', label: 'Architecture Overview', active: true, component: defineAsyncComponent(() => import('../content/overview/Architecture.vue')) },
            { id: 'quickstart', label: 'Quickstart Guide', active: true, component: defineAsyncComponent(() => import('../content/overview/Quickstart.vue')) },
            { id: 'billing', label: 'Billing & Payments', active: true, component: defineAsyncComponent(() => import('../content/overview/Billing.vue')) },
            { id: 'account', label: 'Account Setup', active: true, component: defineAsyncComponent(() => import('../content/overview/Account.vue')) }
        ]
    },
    {
        title: 'COMPUTE',
        items: [
            { id: 'compute-overview', label: 'Compute Overview', active: true, component: defineAsyncComponent(() => import('../content/compute/ComputeOverview.vue')) },
            { id: 'ec2-overview', label: 'EC2 Instances', active: true, component: defineAsyncComponent(() => import('../content/compute/EC2.vue')) },
            { id: 'lambda', label: 'Lambda Functions', active: false, component: null }
        ]
    },
    {
        title: 'HYPER STORAGE (S3)',
        items: [
            { id: 'storage-overview', label: 'S3 Overview', active: true, component: defineAsyncComponent(() => import('../content/storage/StorageOverview.vue')) },
            { id: 'buckets', label: 'Bucket Management', active: true, component: defineAsyncComponent(() => import('../content/storage/Buckets.vue')) },
            { id: 'objects', label: 'Object Operations', active: true, component: defineAsyncComponent(() => import('../content/storage/Objects.vue')) }
        ]
    },
    {
        title: 'AI SERVICES',
        items: [
            { id: 'ai-overview', label: 'AI Overview', active: true, component: defineAsyncComponent(() => import('../content/ai/AIOverview.vue')) }
        ]
    },
    {
        title: 'GAMING',
        items: [
            { id: 'gaming-overview', label: 'Gaming Overview', active: true, component: defineAsyncComponent(() => import('../content/gaming/GamingOverview.vue')) },
            { id: 'gamelift', label: 'GameLift Integration', active: false, component: null }
        ]
    }
]
