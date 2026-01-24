<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useS3Store } from '../store/s3Store'
import { onMounted } from 'vue'

const router = useRouter()
const s3Store = useS3Store()

onMounted(async () => {
    await s3Store.fetchBuckets()
    if (s3Store.buckets.length > 0) {
        router.push('/s3/buckets')
    }
})

const createBucket = () => {
    router.push('/s3/create-bucket')
}
</script>

<template>
    <div class="min-h-screen bg-white font-sans selection:bg-emerald-100 relative overflow-hidden">
        <!-- Premium Ambient Background -->
        <div class="absolute inset-0 pointer-events-none">
            <div
                class="absolute top-[10%] left-[-10%] w-[45rem] h-[45rem] bg-indigo-50/60 rounded-full blur-[120px] animate-pulse">
            </div>
            <div
                class="absolute bottom-[20%] right-[-5%] w-[35rem] h-[35rem] bg-emerald-50/50 rounded-full blur-[100px]">
            </div>
        </div>

        <div class="relative z-10">
            <!-- Hero Section: Storage Portfolio -->
            <header class="max-w-7xl mx-auto px-8 md:px-16 pt-32 pb-24">
                <div class="flex flex-col lg:flex-row gap-20 items-start">
                    <div class="flex-1">
                        <div
                            class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-[0.3em] mb-10">
                            Unified Storage Layer
                        </div>
                        <h1
                            class="text-7xl md:text-9xl font-black text-gray-900 mb-10 leading-[0.85] tracking-tighter uppercase italic">
                            Flux.<span class="text-emerald-500">Storage</span>
                        </h1>
                        <p class="text-2xl text-gray-500 font-bold max-w-2xl leading-tight mb-12">
                            A dual-engine storage architecture. Precision object buffers meeting robust relational state
                            management.
                        </p>
                        <div class="flex flex-wrap gap-6 items-center">
                            <router-link to="/s3/create-bucket"
                                class="px-10 py-5 bg-gray-900 text-white font-black text-lg hover:bg-emerald-600 transition-all duration-300 rounded-none uppercase tracking-tighter active:scale-95">
                                Initialize S3
                            </router-link>
                            <router-link to="/rds/create"
                                class="px-10 py-5 border-4 border-gray-900 text-gray-900 font-black text-lg hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-none uppercase tracking-tighter active:scale-95">
                                Provision RDS
                            </router-link>
                        </div>
                    </div>

                    <!-- Bento Stats: Storage Ecosystem -->
                    <div class="w-full lg:w-[480px] grid grid-cols-2 gap-4">
                        <div
                            class="col-span-2 p-12 bg-gray-900 text-white flex flex-col justify-between aspect-video border-b-8 border-emerald-500">
                            <div class="flex justify-between items-start">
                                <span class="text-5xl font-black italic tracking-tighter uppercase">99.99%</span>
                                <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="square" stroke-width="2.5"
                                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">
                                    Relational Durability</p>
                                <p class="text-xs font-bold text-gray-400 leading-relaxed uppercase">Multi-AZ automated
                                    failover with synchronous replication for zero data loss in SQL workflows.</p>
                            </div>
                        </div>
                        <div class="p-8 bg-white border border-gray-100 flex flex-col justify-center gap-2">
                            <span class="text-4xl font-black text-gray-900 tracking-tighter">Unlimited</span>
                            <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">S3 Scalar
                                Limit</span>
                        </div>
                        <div class="p-8 bg-emerald-50 border border-emerald-100 flex flex-col justify-center gap-2">
                            <span class="text-3xl font-black text-emerald-700 tracking-tighter italic">Low-ms</span>
                            <span
                                class="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">RDS
                                PROVISIONED IOPS</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Storage Architecture Options -->
            <section
                class="max-w-7xl mx-auto px-8 md:px-16 py-32 border-t border-gray-50 bg-gray-50/20 backdrop-blur-sm">
                <div class="grid lg:grid-cols-2 gap-24">
                    <!-- Object Storage Section (Flux.S3) -->
                    <div class="space-y-12">
                        <div class="flex items-center gap-4">
                            <h2 class="text-3xl font-black text-gray-900 uppercase tracking-tighter">Flux.S3 Object</h2>
                            <div class="flex-1 h-[2px] bg-emerald-600"></div>
                        </div>
                        <p class="text-lg text-gray-500 font-medium leading-relaxed">
                            Static asset delivery and massive data lakes. Engineered for 11 nines of durability with
                            global edge caching protocol.
                        </p>
                        <div class="grid gap-4">
                            <div v-for="feat in ['Quantum Encryption', 'Object Versioning', 'Life-cycle Management']"
                                :key="feat"
                                class="p-6 bg-white border border-gray-100 flex items-center gap-6 group hover:border-emerald-600 transition-all">
                                <div class="w-2 h-2 bg-emerald-500"></div>
                                <span class="text-sm font-black text-gray-900 uppercase tracking-widest">{{ feat
                                    }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Relational Storage Section (Flux.RDS) -->
                    <div class="space-y-12">
                        <div class="flex items-center gap-4">
                            <h2 class="text-3xl font-black text-gray-900 uppercase tracking-tighter">Flux.RDS Relational
                            </h2>
                            <div class="flex-1 h-[2px] bg-gray-900"></div>
                        </div>
                        <p class="text-lg text-gray-500 font-medium leading-relaxed">
                            Managed SQL engines for transaction-heavy logic. Automated patching, scaling, and backups so
                            you can focus on the schema.
                        </p>
                        <div class="grid gap-4">
                            <div v-for="feat in ['Postgres & MySQL Engines', 'Read Replica Scaling', 'Transparent Encryption']"
                                :key="feat"
                                class="p-6 bg-white border border-gray-100 flex items-center gap-6 group hover:border-gray-900 transition-all">
                                <div class="w-2 h-2 bg-gray-900"></div>
                                <span class="text-sm font-black text-gray-900 uppercase tracking-widest">{{ feat
                                    }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Bottom Tactical Area -->
            <section class="max-w-7xl mx-auto px-8 md:px-16 py-24">
                <div
                    class="bg-gray-900 p-16 text-white flex flex-col lg:flex-row justify-between items-center gap-12 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full"></div>
                    <div class="max-w-xl relative z-10">
                        <h3 class="text-5xl font-black uppercase tracking-tighter mb-6">Ready to Scale?</h3>
                        <p class="text-gray-400 font-bold uppercase tracking-widest text-sm">Provision your first node
                            in less than 60 seconds with Zero configuration overhead.</p>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-4 relative z-10">
                        <router-link to="/s3/create-bucket"
                            class="px-10 py-5 bg-emerald-600 text-white font-black uppercase tracking-widest hover:bg-emerald-500 transition-colors text-center">Open
                            S3 Console</router-link>
                        <router-link to="/rds/databases"
                            class="px-10 py-5 bg-white text-gray-900 font-black uppercase tracking-widest hover:bg-gray-100 transition-colors text-center">Open
                            RDS Console</router-link>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
