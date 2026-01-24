<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DatabaseEngineCard from '../components/DatabaseEngineCard.vue'
import type { EngineType, InstanceSize, CredentialManagement } from '../types/database'

const router = useRouter()

// Form state
const creationMethod = ref<'easy' | 'full'>('easy')
const selectedEngine = ref<EngineType>('Aurora (PostgreSQL Compatible)')
const instanceSize = ref<InstanceSize>('Dev/Test')
const dbIdentifier = ref('database-1')
const masterUsername = ref('postgres')
const credentialManagement = ref<CredentialManagement>('aws-secrets-manager')
const encryptionKey = ref('aws/secretsmanager (default)')
const showEc2Connection = ref(false)
const showDefaultSettings = ref(false)

const engines: { type: EngineType; description?: string }[] = [
    { type: 'Aurora (MySQL-SQL Compatible)' },
    { type: 'Aurora (PostgreSQL Compatible)' },
    { type: 'MySQL' },
    { type: 'PostgreSQL' },
    { type: 'MariaDB' },
    { type: 'Oracle' },
    { type: 'Microsoft SQL Server' },
    { type: 'IBM Db2' },
]

const defaultSettings = [
    { config: 'Encryption', value: 'Enabled', editable: 'No' },
    { config: 'VPC', value: 'Default VPC (vpc-0c6a5c9e1b17d1)', editable: 'No' },
    { config: 'Option group', value: 'default:aurora-postgresql-17', editable: 'No' },
    { config: 'Multi-AZ', value: 'No', editable: 'Yes' },
    { config: 'Subnet group', value: 'Create new DB Subnet Group', editable: 'Yes' },
    { config: 'Automatic backups', value: 'Enabled', editable: 'Yes' },
    { config: 'VPC security group', value: 'default', editable: 'Yes' },
    { config: 'Publicly accessible', value: 'No', editable: 'Yes' },
    { config: 'Database port', value: '5432', editable: 'Yes' },
    { config: 'DB cluster identifier', value: 'database-1', editable: 'Yes' },
    { config: 'DB instance identifier', value: 'database-1', editable: 'Yes' },
    { config: 'DB engine version', value: '17.4', editable: 'Yes' },
    { config: 'DB parameter group', value: 'default.aurora-postgresql17', editable: 'Yes' },
    { config: 'DB cluster parameter group', value: 'default.aurora-postgresql17', editable: 'Yes' },
    { config: 'Monitoring type', value: 'Database Insights - Standard', editable: 'Yes' },
    { config: 'Performance Insights', value: 'Enabled', editable: 'Yes' },
    { config: 'Monitoring', value: 'Enabled', editable: 'Yes' },
    { config: 'Maintenance', value: 'Auto minor version upgrade enabled', editable: 'Yes' },
    { config: 'Delete protection', value: 'Not enabled', editable: 'Yes' },
]

const createDatabase = () => {
    console.log('Creating database with:', {
        creationMethod: creationMethod.value,
        engine: selectedEngine.value,
        instanceSize: instanceSize.value,
        dbIdentifier: dbIdentifier.value,
        masterUsername: masterUsername.value,
        credentialManagement: credentialManagement.value,
    })
    // Navigate back to databases list
    router.push('/rds/databases')
}

const cancel = () => {
    router.push('/rds/databases')
}
</script>

<template>
    <div class="min-h-screen bg-[var(--bg-console)] pb-20">
        <!-- Breadcrumbs -->
        <nav
            class="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-2 text-xs font-medium text-gray-500">
            <a href="#" @click.prevent="router.push('/dashboard')"
                class="hover:text-[var(--aws-blue)] hover:underline uppercase tracking-wider text-[10px]">AWS</a>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <a href="#" @click.prevent="cancel" class="hover:text-[var(--aws-blue)] hover:underline">Amazon RDS</a>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <a href="#" @click.prevent="cancel" class="hover:text-[var(--aws-blue)] hover:underline">Databases</a>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="text-gray-900">Create database</span>
        </nav>

        <div class="px-8 py-6">
            <div class="flex items-center gap-2 mb-6">
                <h1 class="text-2xl font-bold text-gray-900 leading-tight">Create database</h1>
                <span class="text-[var(--aws-blue)] cursor-help">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </span>
            </div>

            <!-- Choose database creation method -->
            <div class="aws-card p-6 rounded-sm mb-6">
                <h3 class="text-base font-bold text-gray-900 mb-4">Choose a database creation method</h3>
                <div class="grid grid-cols-2 gap-4 max-w-4xl">
                    <div @click="creationMethod = 'full'"
                        class="aws-card p-4 rounded-sm cursor-pointer transition-all border-2"
                        :class="creationMethod === 'full' ? 'border-[var(--aws-blue)] bg-blue-50/20' : 'border-gray-200 hover:border-gray-400'">
                        <div class="flex items-start gap-3">
                            <div class="flex-shrink-0 mt-0.5">
                                <div class="w-4 h-4 rounded-full border flex items-center justify-center"
                                    :class="creationMethod === 'full' ? 'border-[var(--aws-blue)]' : 'border-gray-400'">
                                    <div v-if="creationMethod === 'full'"
                                        class="w-2 h-2 rounded-full bg-[var(--aws-blue)]"></div>
                                </div>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-gray-800">Full configuration</h4>
                                <p class="text-[10px] text-gray-500 leading-tight mt-1">Use all of the configuration
                                    options, including ones for availability, security, backups, and maintenance.</p>
                            </div>
                        </div>
                    </div>

                    <div @click="creationMethod = 'easy'"
                        class="aws-card p-4 rounded-sm cursor-pointer transition-all border-2"
                        :class="creationMethod === 'easy' ? 'border-[var(--aws-blue)] bg-blue-50/20' : 'border-gray-200 hover:border-gray-400'">
                        <div class="flex items-start gap-3">
                            <div class="flex-shrink-0 mt-0.5">
                                <div class="w-4 h-4 rounded-full border flex items-center justify-center"
                                    :class="creationMethod === 'easy' ? 'border-[var(--aws-blue)]' : 'border-gray-400'">
                                    <div v-if="creationMethod === 'easy'"
                                        class="w-2 h-2 rounded-full bg-[var(--aws-blue)]"></div>
                                </div>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-gray-800">Easy create</h4>
                                <p class="text-[10px] text-gray-500 leading-tight mt-1">Use recommended best practice
                                    configurations. Some configuration can be changed after the database is created.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Configuration -->
            <div class="aws-card p-6 rounded-sm mb-6">
                <h3 class="text-base font-bold text-gray-900 mb-4">Configuration</h3>

                <!-- Engine type -->
                <div class="mb-6">
                    <label class="aws-label">Engine type <span
                            class="text-[var(--aws-blue)] text-[10px]">Info</span></label>
                    <div class="grid grid-cols-2 gap-4 max-w-4xl">
                        <DatabaseEngineCard v-for="engine in engines" :key="engine.type" :engine="engine.type"
                            :selected="selectedEngine === engine.type" :description="engine.description"
                            @select="selectedEngine = engine.type" />
                    </div>
                </div>

                <!-- DB instance size -->
                <div class="mb-6 max-w-4xl">
                    <label class="aws-label">DB instance size <span
                            class="text-[var(--aws-blue)] text-[10px]">Info</span></label>
                    <div class="grid grid-cols-2 gap-4">
                        <div @click="instanceSize = 'Production'"
                            class="aws-card p-4 rounded-sm cursor-pointer transition-all border-2"
                            :class="instanceSize === 'Production' ? 'border-[var(--aws-blue)] bg-blue-50/20' : 'border-gray-200 hover:border-gray-400'">
                            <div class="flex items-start gap-3">
                                <div class="flex-shrink-0 mt-0.5">
                                    <div class="w-4 h-4 rounded-full border flex items-center justify-center"
                                        :class="instanceSize === 'Production' ? 'border-[var(--aws-blue)]' : 'border-gray-400'">
                                        <div v-if="instanceSize === 'Production'"
                                            class="w-2 h-2 rounded-full bg-[var(--aws-blue)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 class="text-xs font-bold text-gray-800">Production</h4>
                                    <p class="text-[10px] text-gray-500 leading-tight mt-1">8 vCPUs, 32 GiB RAM</p>
                                </div>
                            </div>
                        </div>

                        <div @click="instanceSize = 'Dev/Test'"
                            class="aws-card p-4 rounded-sm cursor-pointer transition-all border-2"
                            :class="instanceSize === 'Dev/Test' ? 'border-[var(--aws-blue)] bg-blue-50/20' : 'border-gray-200 hover:border-gray-400'">
                            <div class="flex items-start gap-3">
                                <div class="flex-shrink-0 mt-0.5">
                                    <div class="w-4 h-4 rounded-full border flex items-center justify-center"
                                        :class="instanceSize === 'Dev/Test' ? 'border-[var(--aws-blue)]' : 'border-gray-400'">
                                        <div v-if="instanceSize === 'Dev/Test'"
                                            class="w-2 h-2 rounded-full bg-[var(--aws-blue)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 class="text-xs font-bold text-gray-800">Dev/Test</h4>
                                    <p class="text-[10px] text-gray-500 leading-tight mt-1">2 vCPUs, 4 GiB memory</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- DB cluster identifier -->
                <div class="mb-6 max-w-2xl">
                    <label class="aws-label">DB cluster identifier <span
                            class="text-[var(--aws-blue)] text-[10px]">Info</span></label>
                    <p class="text-[11px] text-gray-500 mb-2">Type a name for your DB cluster. The name must be unique
                        to your account in the current AWS Region.</p>
                    <input v-model="dbIdentifier" type="text" class="aws-input" />
                    <p class="text-[10px] text-gray-500 mt-1">The DB cluster identifier is case-insensitive, but is
                        stored as all lowercase (as in "mydbcluster"). Constraints: 1 to 63 alphanumeric characters or
                        hyphens. First character must be a letter. Can't contain two consecutive hyphens. Can't end with
                        a hyphen.</p>
                </div>

                <!-- Master username -->
                <div class="mb-6 max-w-2xl">
                    <label class="aws-label">Master username <span
                            class="text-[var(--aws-blue)] text-[10px]">Info</span></label>
                    <p class="text-[11px] text-gray-500 mb-2">Type a login ID for the master user of your DB instance.
                    </p>
                    <input v-model="masterUsername" type="text" class="aws-input" />
                    <p class="text-[10px] text-gray-500 mt-1">1 to 16 alphanumeric characters. First character must be a
                        letter.</p>
                </div>

                <!-- Credential management -->
                <div class="max-w-4xl">
                    <label class="aws-label">Credential management</label>
                    <p class="text-[11px] text-gray-500 mb-3">Choose how to manage your master user credentials.</p>
                    <div class="grid grid-cols-2 gap-4">
                        <div @click="credentialManagement = 'aws-secrets-manager'"
                            class="aws-card p-4 rounded-sm cursor-pointer transition-all border-2"
                            :class="credentialManagement === 'aws-secrets-manager' ? 'border-[var(--aws-blue)] bg-blue-50/20' : 'border-gray-200 hover:border-gray-400'">
                            <div class="flex items-start gap-3">
                                <div class="flex-shrink-0 mt-0.5">
                                    <div class="w-4 h-4 rounded-full border flex items-center justify-center"
                                        :class="credentialManagement === 'aws-secrets-manager' ? 'border-[var(--aws-blue)]' : 'border-gray-400'">
                                        <div v-if="credentialManagement === 'aws-secrets-manager'"
                                            class="w-2 h-2 rounded-full bg-[var(--aws-blue)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 class="text-xs font-bold text-gray-800">AWS Secrets Manager - most secure</h4>
                                    <p class="text-[10px] text-gray-500 leading-tight mt-1">RDS generates a password for
                                        you and manages it throughout its lifecycle using AWS Secrets Manager.</p>
                                </div>
                            </div>
                        </div>

                        <div @click="credentialManagement = 'self-managed'"
                            class="aws-card p-4 rounded-sm cursor-pointer transition-all border-2"
                            :class="credentialManagement === 'self-managed' ? 'border-[var(--aws-blue)] bg-blue-50/20' : 'border-gray-200 hover:border-gray-400'">
                            <div class="flex items-start gap-3">
                                <div class="flex-shrink-0 mt-0.5">
                                    <div class="w-4 h-4 rounded-full border flex items-center justify-center"
                                        :class="credentialManagement === 'self-managed' ? 'border-[var(--aws-blue)]' : 'border-gray-400'">
                                        <div v-if="credentialManagement === 'self-managed'"
                                            class="w-2 h-2 rounded-full bg-[var(--aws-blue)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <h4 class="text-xs font-bold text-gray-800">Self managed</h4>
                                    <p class="text-[10px] text-gray-500 leading-tight mt-1">Create your own password or
                                        have RDS create a password that you manage.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Encryption key selector (only for AWS Secrets Manager) -->
                    <div v-if="credentialManagement === 'aws-secrets-manager'"
                        class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-sm">
                        <p class="text-[11px] text-gray-700 mb-2">
                            <svg class="inline-block w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clip-rule="evenodd" />
                            </svg>
                            If you change the master user credentials for AWS Secrets Manager, additional charges flow.
                            See <a href="#" class="text-[var(--aws-blue)] hover:underline">AWS Secrets Manager
                                pricing</a>. Additionally, some RDS features aren't supported. See <a href="#"
                                class="text-[var(--aws-blue)] hover:underline">limitations here</a>.
                        </p>
                        <div class="mt-3">
                            <label class="text-xs font-bold text-gray-700 block mb-2">Select the encryption key</label>
                            <select v-model="encryptionKey" class="aws-input text-xs">
                                <option>aws/secretsmanager (default)</option>
                            </select>
                            <p class="text-[10px] text-gray-500 mt-1">
                                <a href="#" class="text-[var(--aws-blue)] hover:underline">Add new key</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Set up EC2 connection (expandable) -->
            <div class="aws-card rounded-sm mb-6">
                <div @click="showEc2Connection = !showEc2Connection"
                    class="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3">
                    <svg class="w-4 h-4 transition-transform" :class="showEc2Connection ? 'rotate-90' : ''" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="flex-grow">
                        <h3 class="font-bold text-gray-900 text-sm">Set up EC2 connection - <span
                                class="text-xs italic">optional</span></h3>
                    </div>
                </div>
                <div v-if="showEc2Connection" class="px-6 pb-6">
                    <p class="text-xs text-gray-600">You can also set up a connection to an EC2 instance after creating
                        the database. Go to the RDS page or the database details page, choose Actions, and then choose
                        Set up EC2 connection.</p>
                </div>
            </div>

            <!-- View default settings for Easy create (expandable) -->
            <div class="aws-card rounded-sm mb-6">
                <div @click="showDefaultSettings = !showDefaultSettings"
                    class="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3">
                    <svg class="w-4 h-4 transition-transform" :class="showDefaultSettings ? 'rotate-90' : ''"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="flex-grow">
                        <h3 class="font-bold text-gray-900 text-sm">View default settings for Easy create</h3>
                        <p class="text-[11px] text-gray-500 mt-0.5">Easy create uses the following configurations in
                            their default values, some of which can be changed after the database is created. If you
                            want to change any of these settings now, use Standard create.</p>
                    </div>
                </div>
                <div v-if="showDefaultSettings" class="px-6 pb-6">
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs">
                            <thead class="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th class="text-left py-2 px-3 font-bold text-gray-700">Configuration</th>
                                    <th class="text-left py-2 px-3 font-bold text-gray-700">Value</th>
                                    <th class="text-left py-2 px-3 font-bold text-gray-700">Editable after database is
                                        created</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(setting, idx) in defaultSettings" :key="idx"
                                    class="border-b border-gray-100">
                                    <td class="py-2 px-3 text-gray-700">{{ setting.config }}</td>
                                    <td class="py-2 px-3 text-gray-600">{{ setting.value }}</td>
                                    <td class="py-2 px-3 text-gray-600">{{ setting.editable }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer Actions (Sticky) -->
        <div
            class="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex items-center justify-end px-8 gap-4 z-50">
            <button @click="cancel" class="text-xs font-bold text-[var(--aws-blue)] hover:underline">Cancel</button>
            <button @click="createDatabase" class="btn-aws-primary px-8">Create database</button>
        </div>
    </div>
</template>
