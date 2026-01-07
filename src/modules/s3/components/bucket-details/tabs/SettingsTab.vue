<script setup lang="ts">
import SectionHeader from '../shared/SectionHeader.vue'
import EmptyState from '../shared/EmptyState.vue'
</script>

<template>
    <div class="space-y-12">
        <!-- Header -->
        <div class="bg-gray-50 border-b border-t border-gray-200 p-4 mb-4 flex justify-between items-center">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Settings & Compliance</h2>
                <p class="text-gray-600 text-sm">Configure lifecycle, protection, and billing.</p>
            </div>
            <button
                class="bg-green-600 text-white px-4 py-2 rounded-sm font-bold shadow-sm hover:bg-green-700 flex items-center gap-2 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pay Bill (M-PESA)
            </button>
        </div>

        <!-- Data Protection Section -->
        <div class="space-y-6">
            <h3 class="text-lg font-bold text-gray-800 px-1 border-b border-gray-200 pb-2">Data Protection</h3>

            <!-- Bucket Versioning -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Bucket Versioning" :showEdit="true" />
                <div class="p-4">
                    <p class="text-xs text-gray-600 mb-4">Versioning is a means of keeping multiple variants of an
                        object in the same bucket. <a href="#" class="text-[var(--aws-blue)] underline">Learn more
                            ↗</a></p>
                    <h3 class="text-sm font-bold text-gray-900">Bucket Versioning</h3>
                    <p class="text-xs text-gray-900">Suspended</p>
                </div>
            </div>

            <!-- Default Encryption -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Default encryption" :showEdit="true" />
                <div class="p-4">
                    <p class="text-xs text-gray-600 mb-4">Server-side encryption is automatically applied to new objects
                        stored in this bucket.</p>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <h3 class="text-sm font-bold text-gray-900">Encryption type</h3>
                            <p class="text-xs text-gray-900">Server-side encryption with Amazon S3 managed keys (SSE-S3)
                            </p>
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-gray-900">Bucket Key</h3>
                            <p class="text-xs text-gray-900">Enable</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Object Lock -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Object Lock" :showEdit="true" />
                <div class="p-4">
                    <p class="text-xs text-gray-600 mb-4">Store objects using a write-once-read-many (WORM) model. <a
                            href="#" class="text-[var(--aws-blue)] underline">Learn more ↗</a></p>
                    <h3 class="text-sm font-bold text-gray-900">Object Lock</h3>
                    <p class="text-xs text-gray-900">Disabled</p>
                </div>
            </div>

            <!-- Replication Rules -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Replication rules" :showCreate="true" createLabel="Create replication rule" />
                <EmptyState title="No replication rules"
                    message="Use replication rules to define options you want Amazon S3 to apply during replication." />
            </div>
        </div>

        <!-- Cost Optimization Section -->
        <div class="space-y-6">
            <h3 class="text-lg font-bold text-gray-800 px-1 border-b border-gray-200 pb-2">Cost Optimization</h3>

            <!-- Lifecycle Configuration -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Lifecycle configuration" :showCreate="true" createLabel="Create lifecycle rule" />
                <div class="p-4">
                    <p class="text-xs text-gray-600 mb-4">Manage your objects so that they are stored cost effectively
                        throughout their lifecycle.</p>
                    <div class="p-8 text-center text-gray-600 border border-gray-300 rounded-sm bg-gray-50">
                        <p class="text-sm font-bold mb-1">No lifecycle rules</p>
                        <p class="text-xs">There are no lifecycle rules for this bucket.</p>
                    </div>
                </div>
            </div>

            <!-- Intelligent-Tiering -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Intelligent-Tiering Archive configurations" :showCreate="true"
                    createLabel="Create configuration" />
                <EmptyState title="No configurations" message="There are no Intelligent-Tiering configurations." />
            </div>

            <!-- Requester Pays -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Requester pays" :showEdit="true" />
                <div class="p-4">
                    <p class="text-xs text-gray-600 mb-4">When enabled, the requester pays for requests and data
                        transfer
                        costs.</p>
                    <h3 class="text-sm font-bold text-gray-900">Requester pays</h3>
                    <p class="text-xs text-gray-900">Disabled</p>
                </div>
            </div>
        </div>

        <!-- Events & Integration Section -->
        <div class="space-y-6">
            <h3 class="text-lg font-bold text-gray-800 px-1 border-b border-gray-200 pb-2">Events & Integration</h3>

            <!-- Server Access Logging -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Server access logging" :showEdit="true" />
                <div class="p-4">
                    <p class="text-xs text-gray-600 mb-4">Log requests for access to your bucket.</p>
                    <h3 class="text-sm font-bold text-gray-900">Server access logging</h3>
                    <p class="text-xs text-gray-900">Disabled</p>
                </div>
            </div>

            <!-- CloudTrail -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="AWS CloudTrail data events" />
                <div class="p-4">
                    <p class="text-xs text-gray-600 mb-4">Configure CloudTrail to log data events.</p>
                    <div class="p-8 text-center text-gray-600 border border-gray-300 rounded-sm bg-gray-50">
                        <p class="text-sm font-bold mb-1">No data events configured</p>
                    </div>
                </div>
            </div>

            <!-- Event Notifications -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Event notifications" :showCreate="true" createLabel="Create event notification" />
                <EmptyState title="No event notifications" message="" />
            </div>

            <!-- EventBridge -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Amazon EventBridge" :showEdit="true" />
                <div class="p-4">
                    <h3 class="text-sm font-bold text-gray-900">Send notifications to Amazon EventBridge for all events
                        in
                        this bucket</h3>
                    <p class="text-xs text-gray-900">On</p>
                </div>
            </div>

            <!-- Inventory Configurations -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <SectionHeader title="Inventory configurations" :showCreate="true"
                    createLabel="Create inventory configuration" />
                <EmptyState title="No configurations" message="" />
            </div>

            <!-- Tags -->
            <div class="border border-gray-200 rounded-sm bg-white">
                <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-gray-900">Tags</h2>
                    <div class="flex gap-2">
                        <button
                            class="px-3 py-1 text-xs font-bold border border-gray-300 rounded-sm text-gray-400 cursor-not-allowed bg-white">Edit</button>
                        <button
                            class="px-3 py-1 text-xs font-bold border border-[var(--aws-blue)] text-[var(--aws-blue)] bg-white rounded-sm hover:bg-blue-50">Manage
                            tags</button>
                    </div>
                </div>
                <EmptyState title="No tags" message="" />
            </div>
        </div>
    </div>
</template>
