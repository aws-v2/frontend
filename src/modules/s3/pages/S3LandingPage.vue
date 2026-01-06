<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useS3Store } from '../store/s3Store'
import { onMounted } from 'vue'

const router = useRouter()
const s3Store = useS3Store()

onMounted(() => {
    if (s3Store.buckets.length > 0) {
        router.push('/s3/buckets')
    }
})

const createBucket = () => {
    router.push('/s3/create-bucket')
}
</script>

<template>
    <div class="min-h-screen bg-white">
        <!-- Hero Section -->
        <div class="bg-[#16191f] text-white py-12 px-16 flex justify-between items-start">
            <div class="max-w-2xl">
                <p class="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Storage</p>
                <h1 class="text-3xl font-bold mb-4">Amazon S3</h1>
                <p class="text-xl font-medium mb-6">Store and retrieve any amount of data from anywhere</p>
                <p class="text-sm text-gray-400 leading-relaxed max-w-xl">
                    Amazon S3 is an object storage service that offers industry-leading scalability, data availability,
                    security, and performance.
                </p>
            </div>

            <!-- Create Bucket Card -->
            <div class="w-80 bg-white rounded-lg p-6 shadow-xl border border-gray-200">
                <h2 class="text-lg font-bold text-gray-900 mb-4">Create a bucket</h2>
                <p class="text-xs text-gray-600 mb-6 leading-relaxed">
                    Every object in S3 is stored in a bucket. To upload files and folders to S3, you'll need to create a
                    bucket where the objects will be stored.
                </p>
                <button @click="createBucket"
                    class="w-full py-2 bg-[var(--aws-orange)] text-white font-bold rounded-full hover:opacity-90 transition-opacity">
                    Create bucket
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div class="px-16 py-12 flex gap-12">
            <!-- Left: Video/How it works -->
            <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 mb-6">How it works</h3>
                <div
                    class="aspect-video bg-gray-100 border border-gray-200 flex flex-col items-center justify-center p-8 text-center grayscale opacity-60">
                    <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-sm text-gray-500 italic">Video: Introduction to Amazon S3</p>
                </div>

                <div class="mt-8 grid grid-cols-2 gap-8">
                    <div>
                        <h4 class="text-sm font-bold text-gray-900 mb-4">Data performance and durability</h4>
                        <p class="text-xs text-gray-600 leading-relaxed mb-4">
                            S3 is designed for 99.999999999% (11 9's) of durability, and stores data for millions of
                            applications for companies all around the world.
                        </p>
                        <span class="text-xs text-[var(--aws-blue)] font-bold hover:underline cursor-pointer">Learn
                            more</span>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-gray-900 mb-4">Security, compliance, and auditing</h4>
                        <p class="text-xs text-gray-600 leading-relaxed mb-4">
                            S3 supports security, compliance, and auditing with features like Amazon S3 Object Lock and
                            account-level Block Public Access.
                        </p>
                        <span class="text-xs text-[var(--aws-blue)] font-bold hover:underline cursor-pointer">Learn
                            more</span>
                    </div>
                </div>
            </div>

            <!-- Right Sidebars -->
            <div class="w-80 space-y-6">
                <!-- Pricing -->
                <div class="border border-gray-200 rounded-sm p-6 overflow-hidden">
                    <h3 class="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        Pricing <svg class="w-3.5 h-3.5 opacity-40 hover:opacity-100 cursor-pointer" fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                                d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        </svg>
                    </h3>
                    <p class="text-xs text-gray-600 leading-relaxed mb-6">
                        With S3, there are no minimum fees. You only pay for what you use. Prices are based on the
                        location of your S3 bucket.
                    </p>
                    <div class="space-y-3">
                        <span class="block text-xs text-[var(--aws-blue)] font-bold hover:underline cursor-pointer">View
                            pricing details</span>
                    </div>
                </div>

                <!-- Resources -->
                <div class="border border-gray-200 rounded-sm p-6">
                    <h3 class="text-sm font-bold text-gray-900 mb-4 flex items-center justify-between">
                        Resources <svg class="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </h3>
                    <div class="space-y-3">
                        <span v-for="res in ['User guide', 'API reference', 'FAQs', 'Discussion forums']" :key="res"
                            class="block text-xs text-[var(--aws-blue)] font-bold hover:underline cursor-pointer flex items-center justify-between group">
                            {{ res }}
                            <svg class="w-3 h-3 opacity-0 group-hover:opacity-40" fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                    d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            </svg>
                        </span>
                    </div>
                </div>

                <!-- Common Tasks -->
                <div class="border border-gray-200 rounded-sm p-6">
                    <h3 class="text-sm font-bold text-gray-900 mb-4 flex items-center justify-between">
                        Common tasks <svg class="w-4 h-4 opacity-40" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </h3>
                    <div class="space-y-3">
                        <span
                            v-for="task in ['Get started with S3', 'Create a bucket', 'Upload an object', 'Download an object', 'Host a static website']"
                            :key="task"
                            class="block text-xs text-[var(--aws-blue)] font-bold hover:underline cursor-pointer flex items-center justify-between group">
                            {{ task }}
                            <svg class="w-3 h-3 opacity-0 group-hover:opacity-40" fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                    d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
