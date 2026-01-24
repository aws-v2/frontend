<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const dbId = route.params.id as string || 'database-1'

// Form State
const engineVersion = ref('Aurora PostgreSQL (Compatible with PostgreSQL 17.4) - default for major version 17')
const dbIdentifier = ref(dbId)
const credentialManagement = ref('aws-secrets-manager')
const rotateSecret = ref(false)
const iamAuth = ref(false)
const kerberosAuth = ref(false)

const storageConfig = ref('aurora-standard')
const minCapacity = ref(0.5)
const maxCapacity = ref(128)
const pauseAfterInactivity = ref(false)

const vpcSecurityGroups = ref(['default'])
const dbPort = ref('5432')
const writeForwarding = ref(false)

const monitoringType = ref('standard')
const performanceInsights = ref(true)
const retentionPeriod = ref('7 days')
const enhancedMonitoring = ref(true)
const osMetricsGranularity = ref('60 seconds')
const monitoringRole = ref('rds-monitoring-role')

const dbParameterGroup = ref('default.aurora-postgresql17')
const backupRetention = ref(7)
const backupStartTime = ref('01:46')
const backupDuration = ref(0.5)
const copyTagsToSnapshots = ref(true)
const autoMinorVersionUpgrade = ref(true)
const maintenanceStartDay = ref('Tuesday')
const maintenanceStartTime = ref('06:24')
const maintenanceDuration = ref(0.5)
const deletionProtection = ref(false)

// Expandable Sections
const showAdditionalCredentials = ref(false)
const showAdditionalMonitoring = ref(false)
const showAdditionalConfig = ref(false)

const cancel = () => {
    router.push('/rds/databases')
}

const handleContinue = () => {
    console.log('Modifying database:', dbId, 'with data:', {
        engineVersion: engineVersion.value,
        dbIdentifier: dbIdentifier.value,
        // ... rest of the data
    })
    router.push('/rds/databases')
}
</script>

<template>
    <div class="min-h-screen bg-[var(--bg-console)] pb-24">
        <!-- Breadcrumbs -->
        <nav
            class="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-2 text-xs font-medium text-gray-500">
            <a href="#" @click.prevent="router.push('/dashboard')"
                class="hover:text-[var(--aws-blue)] hover:underline uppercase tracking-wider text-[10px]">AWS</a>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <a href="#" @click.prevent="cancel" class="hover:text-[var(--aws-blue)] hover:underline">Aurora and RDS</a>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <a href="#" @click.prevent="cancel" class="hover:text-[var(--aws-blue)] hover:underline">Databases</a>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="text-gray-900">Modify DB cluster: {{ dbIdentifier }}</span>
        </nav>

        <div class="px-8 py-6 max-w-7xl mx-auto">
            <h1 class="text-2xl font-bold text-gray-900 mb-6">Modify DB cluster: {{ dbIdentifier }}</h1>

            <!-- Settings -->
            <div class="aws-card p-6 rounded-sm mb-6">
                <h3 class="text-base font-bold text-gray-900 mb-4">Settings</h3>

                <div class="mb-6">
                    <label class="aws-label">DB engine version</label>
                    <p class="text-[11px] text-gray-500 mb-2">Version number of the database engine to be used for this
                        database</p>
                    <select v-model="engineVersion" class="aws-input">
                        <option>{{ engineVersion }}</option>
                    </select>
                </div>

                <div class="mb-6">
                    <label class="aws-label">DB cluster identifier <span
                            class="text-[var(--aws-blue)] text-[10px]">Info</span></label>
                    <p class="text-[11px] text-gray-500 mb-2">Type a name for your DB cluster. The name must be unique
                        across all DB clusters owned by your AWS account in the current AWS Region.</p>
                    <input v-model="dbIdentifier" type="text" class="aws-input" />
                    <p class="text-[10px] text-gray-500 mt-1 italic">The DB cluster identifier is case-insensitive, but
                        is stored as all lowercase (as in "mydbcluster"). Constraints: 1 to 63 alphanumeric characters
                        or hyphens. First character must be a letter. Can't contain two consecutive hyphens. Can't end
                        with a hyphen.</p>
                </div>

                <div class="mb-6">
                    <label class="aws-label">Credentials management</label>
                    <p class="text-[11px] text-gray-500 mb-3">You can use AWS Secrets Manager or manage your master user
                        credentials.</p>
                    <div class="grid grid-cols-2 gap-4">
                        <div @click="credentialManagement = 'aws-secrets-manager'"
                            class="aws-card p-4 rounded-sm cursor-pointer border-2"
                            :class="credentialManagement === 'aws-secrets-manager' ? 'border-[var(--aws-blue)] bg-blue-50/20' : 'border-gray-200 hover:border-gray-400'">
                            <div class="flex items-start gap-3">
                                <input type="radio" :checked="credentialManagement === 'aws-secrets-manager'"
                                    class="mt-1" />
                                <div>
                                    <h4 class="text-xs font-bold text-gray-800">Managed in AWS Secrets Manager - most
                                        secure</h4>
                                    <p class="text-[10px] text-gray-500 mt-1">RDS generates a password for you and
                                        manages it throughout its lifecycle using AWS Secrets Manager.</p>
                                </div>
                            </div>
                        </div>
                        <div @click="credentialManagement = 'self-managed'"
                            class="aws-card p-4 rounded-sm cursor-pointer border-2"
                            :class="credentialManagement === 'self-managed' ? 'border-[var(--aws-blue)] bg-blue-50/20' : 'border-gray-200 hover:border-gray-400'">
                            <div class="flex items-start gap-3">
                                <input type="radio" :checked="credentialManagement === 'self-managed'" class="mt-1" />
                                <div>
                                    <h4 class="text-xs font-bold text-gray-800">Self managed</h4>
                                    <p class="text-[10px] text-gray-500 mt-1">Create your own password or have RDS
                                        create a password that you manage.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="credentialManagement === 'aws-secrets-manager'"
                    class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-sm">
                    <p class="text-[11px] text-gray-700">
                        <svg class="inline-block w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clip-rule="evenodd" />
                        </svg>
                        If you manage the master user credentials in AWS Secrets Manager, additional charges apply. See
                        <a href="#" class="text-[var(--aws-blue)] hover:underline">AWS Secrets Manager pricing</a>.
                        Additionally, some RDS features aren't supported. See limitations <a href="#"
                            class="text-[var(--aws-blue)] hover:underline">here</a>.
                    </p>
                </div>

                <label class="flex items-center gap-2 cursor-pointer mb-6">
                    <input type="checkbox" v-model="rotateSecret"
                        class="w-4 h-4 rounded-sm border-gray-300 text-[var(--aws-blue)]" />
                    <span class="text-xs font-bold text-gray-700">Rotate secret immediately</span>
                </label>

                <!-- Additional credentials settings expandable -->
                <div class="border-t border-gray-100 pt-4">
                    <button @click="showAdditionalCredentials = !showAdditionalCredentials"
                        class="flex items-center gap-2 text-[var(--aws-blue)] font-bold text-xs">
                        <svg class="w-3.5 h-3.5 transition-transform"
                            :class="showAdditionalCredentials ? 'rotate-180' : 'rotate-90'" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 15l7-7 7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        Additional credentials settings
                    </button>
                    <div v-if="showAdditionalCredentials" class="mt-4 space-y-4">
                        <label class="flex items-start gap-2 cursor-pointer">
                            <input type="checkbox" v-model="iamAuth" class="w-4 h-4 mt-0.5 rounded-sm" />
                            <div>
                                <span class="text-xs font-bold text-gray-700 block">IAM database authentication</span>
                                <span class="text-[10px] text-gray-500">Authenticate using IAM database
                                    authentication.</span>
                            </div>
                        </label>
                        <label class="flex items-start gap-2 cursor-pointer">
                            <input type="checkbox" v-model="kerberosAuth" class="w-4 h-4 mt-0.5 rounded-sm" />
                            <div>
                                <span class="text-xs font-bold text-gray-700 block">Kerberos authentication</span>
                                <span class="text-[10px] text-gray-500">Authenticate using Kerberos authentication
                                    through an AWS Directory Service for Microsoft Active Directory.</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Cluster storage configuration -->
            <div class="aws-card p-6 rounded-sm mb-6">
                <div class="flex items-center gap-1 mb-2">
                    <h3 class="text-base font-bold text-gray-900">Cluster storage configuration</h3>
                    <span class="text-[var(--aws-blue)] text-xs cursor-help">Info</span>
                </div>
                <p class="text-[11px] text-gray-500 mb-4">Choose the storage configuration for the Aurora DB cluster
                    that best fits your application's price predictability and price performance needs.</p>

                <h4 class="text-xs font-bold text-gray-700 mb-3">Configuration options</h4>
                <div class="grid grid-cols-2 gap-4">
                    <div @click="storageConfig = 'aurora-io-optimized'"
                        class="aws-card p-4 rounded-sm cursor-pointer border-2"
                        :class="storageConfig === 'aurora-io-optimized' ? 'border-[var(--aws-blue)] bg-blue-50/20' : 'border-gray-200 hover:border-gray-400'">
                        <div class="flex items-start gap-3">
                            <input type="radio" :checked="storageConfig === 'aurora-io-optimized'" class="mt-1" />
                            <div>
                                <h4 class="text-xs font-bold text-gray-800">Aurora I/O-Optimized</h4>
                                <ul class="text-[10px] text-gray-500 mt-1 list-disc ml-4 space-y-1">
                                    <li>Predictable pricing for all applications. Improved price performance for
                                        I/O-intensive applications (I/O costs >25% of total database costs).</li>
                                    <li>No additional charges for read/write I/O operations. DB instance and storage
                                        prices include I/O usage.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div @click="storageConfig = 'aurora-standard'"
                        class="aws-card p-4 rounded-sm cursor-pointer border-2"
                        :class="storageConfig === 'aurora-standard' ? 'border-[var(--aws-blue)] bg-blue-50/20' : 'border-gray-200 hover:border-gray-400'">
                        <div class="flex items-start gap-3">
                            <input type="radio" :checked="storageConfig === 'aurora-standard'" class="mt-1" />
                            <div>
                                <h4 class="text-xs font-bold text-gray-800">Aurora Standard</h4>
                                <ul class="text-[10px] text-gray-500 mt-1 list-disc ml-4 space-y-1">
                                    <li>Cost-effective pricing for many applications with moderate I/O usage (I/O costs
                                        <25% of total database costs).</li>
                                    <li>Pay-per-request I/O charges apply. DB instance and storage prices don't include
                                        I/O usage.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Serverless v2 capacity settings -->
            <div class="aws-card p-6 rounded-sm mb-6">
                <h3 class="text-base font-bold text-gray-900 mb-4">Serverless v2 capacity settings</h3>

                <div class="mb-6">
                    <h4 class="text-xs font-bold text-gray-700 mb-1">Capacity range <span
                            class="text-[var(--aws-blue)] text-[10px]">Info</span></h4>
                    <p class="text-[11px] text-gray-500 mb-4">Database capacity is measured in Aurora Capacity Units
                        (ACUs). 1 ACU provides 2 GB of memory and corresponding compute and networking.</p>

                    <div class="grid grid-cols-2 gap-8">
                        <div>
                            <label class="text-[11px] font-bold text-gray-700 mb-1 block">Minimum capacity
                                (ACUs)</label>
                            <div class="flex items-center gap-3">
                                <input v-model="minCapacity" type="number" step="0.5" class="aws-input w-32" />
                                <span class="text-xs text-gray-500">(1 GiB)</span>
                            </div>
                            <p class="text-[10px] text-gray-500 mt-1">0 to 256 in increments of 0.5</p>
                        </div>
                        <div>
                            <label class="text-[11px] font-bold text-gray-700 mb-1 block">Maximum capacity
                                (ACUs)</label>
                            <div class="flex items-center gap-3">
                                <input v-model="maxCapacity" type="number" step="0.5" class="aws-input w-32" />
                                <span class="text-xs text-gray-500">(256 GiB)</span>
                            </div>
                            <p class="text-[10px] text-gray-500 mt-1">1 to 256 in increments of 0.5</p>
                        </div>
                    </div>
                </div>

                <div class="mb-6">
                    <h4 class="text-xs font-bold text-gray-700 mb-1">Pause after inactivity <span
                            class="text-[var(--aws-blue)] text-[10px]">Info</span></h4>
                    <p class="text-[11px] text-gray-500 mb-2">Clusters with a minimum capacity setting of 0.5 ACUs can
                        be paused during inactivity. Specify the amount of time the DB instance can be idle before
                        pausing.</p>
                    <div class="flex items-center gap-3 mb-2">
                        <input disabled type="text" value="00:05:00" class="aws-input w-48 bg-gray-50" />
                    </div>
                    <p class="text-[10px] text-gray-500">Enter a time from 5 minutes to 24 hours</p>
                </div>

                <div class="space-y-3">
                    <div class="bg-blue-50 border border-blue-200 rounded-sm p-3 flex items-start gap-2">
                        <svg class="w-4 h-4 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clip-rule="evenodd" />
                        </svg>
                        <p class="text-[11px] text-gray-700">Clusters with a minimum capacity setting of 0.5 ACUs or
                            greater don't support pausing after inactivity.</p>
                    </div>
                    <div class="bg-blue-50 border border-blue-200 rounded-sm p-3 flex items-start gap-2">
                        <svg class="w-4 h-4 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clip-rule="evenodd" />
                        </svg>
                        <p class="text-[11px] text-gray-700">The capacity range applies to all Serverless v2 instances
                            in your cluster. Any changes affect 1 instance: database-1-instance-1.</p>
                    </div>
                </div>
            </div>

            <!-- Connectivity -->
            <div class="aws-card p-6 rounded-sm mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-base font-bold text-gray-900">Connectivity</h3>
                    <button class="text-[var(--aws-blue)]">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>

                <div class="mb-6">
                    <label class="aws-label">VPC security group (firewall)</label>
                    <p class="text-[11px] text-gray-500 mb-2">Choose one or more VPC security groups to allow access to
                        your database. Make sure that the security group rules allow the appropriate incoming traffic.
                    </p>
                    <div class="relative">
                        <div class="aws-input flex flex-wrap items-center gap-2 min-h-[34px]">
                            <div v-for="sg in vpcSecurityGroups" :key="sg"
                                class="bg-gray-100 px-2 py-0.5 rounded-sm flex items-center gap-1 border border-gray-300">
                                <span class="text-xs">{{ sg }}</span>
                                <button @click="vpcSecurityGroups = vpcSecurityGroups.filter(s => s !== sg)"
                                    class="text-gray-500 hover:text-gray-700">×</button>
                            </div>
                            <input type="text" placeholder="Choose VPC security groups"
                                class="outline-none text-xs flex-1 bg-transparent" />
                        </div>
                    </div>
                </div>

                <div class="mb-6 max-w-sm">
                    <label class="aws-label">Database port</label>
                    <p class="text-[11px] text-gray-500 mb-2">TCP/IP port that the database will use for application
                        connections.</p>
                    <input v-model="dbPort" type="text" class="aws-input" />
                </div>
            </div>

            <!-- Read replica write forwarding -->
            <div class="aws-card p-6 rounded-sm mb-6">
                <h3 class="text-base font-bold text-gray-900 mb-4">Read replica write forwarding</h3>
                <label class="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" v-model="writeForwarding" class="w-4 h-4 mt-0.5 rounded-sm" />
                    <div>
                        <span class="text-xs font-bold text-gray-700 block">Turn on local write forwarding <span
                                class="text-[var(--aws-blue)] font-normal ml-1">Info</span></span>
                        <span class="text-[10px] text-gray-500">Allows write operations from reader DB instances within
                            the same DB cluster.</span>
                    </div>
                </label>
            </div>

            <!-- Monitoring -->
            <div class="aws-card p-6 rounded-sm mb-6">
                <h3 class="text-base font-bold text-gray-900 mb-2">Monitoring</h3>
                <p class="text-[11px] text-gray-500 mb-4">Choose monitoring tools for this database. Database Insights
                    provides a combined view of Performance Insights and Enhanced Monitoring for your fleet of
                    databases. Database Insights pricing is separate from RDS monthly estimates. <a href="#"
                        class="text-[var(--aws-blue)] hover:underline">See Amazon CloudWatch pricing</a>.</p>

                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div @click="monitoringType = 'advanced'" class="aws-card p-4 rounded-sm cursor-pointer border-2"
                        :class="monitoringType === 'advanced' ? 'border-[var(--aws-blue)] bg-blue-50/20' : 'border-gray-200 hover:border-gray-400'">
                        <div class="flex items-start gap-3">
                            <input type="radio" :checked="monitoringType === 'advanced'" class="mt-1" />
                            <div>
                                <h4 class="text-xs font-bold text-gray-800">Database Insights - Advanced</h4>
                                <ul class="text-[10px] text-gray-500 mt-1 list-disc ml-4 space-y-1">
                                    <li>Retains 15 months of performance history</li>
                                    <li>Fleet-level monitoring</li>
                                    <li>Integration with CloudWatch Application Signals</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div @click="monitoringType = 'standard'" class="aws-card p-4 rounded-sm cursor-pointer border-2"
                        :class="monitoringType === 'standard' ? 'border-[var(--aws-blue)] bg-blue-50/20' : 'border-gray-200 hover:border-gray-400'">
                        <div class="flex items-start gap-3">
                            <input type="radio" :checked="monitoringType === 'standard'" class="mt-1" />
                            <div>
                                <h4 class="text-xs font-bold text-gray-800">Database Insights - Standard</h4>
                                <ul class="text-[10px] text-gray-500 mt-1 list-disc ml-4 space-y-1">
                                    <li>Retains 7 days of performance history, with the option to pay for the retention
                                        of up to 24 months of performance history</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Performance Insights -->
                <div class="mb-6">
                    <h4 class="text-xs font-bold text-gray-700 mb-3">Performance Insights</h4>
                    <label class="flex items-start gap-2 cursor-pointer mb-4">
                        <input type="checkbox" v-model="performanceInsights" class="w-4 h-4 mt-0.5 rounded-sm" />
                        <div>
                            <span class="text-xs font-bold text-gray-700 block">Enable Performance Insights</span>
                            <span class="text-[10px] text-gray-500">With Performance Insights dashboard, you can
                                visualize the database load on your Amazon RDS DB instance load and filter the load by
                                waits, SQL statements, hosts, or users.</span>
                        </div>
                    </label>

                    <div v-if="performanceInsights" class="space-y-4 max-w-2xl ml-6">
                        <div>
                            <label class="text-[11px] font-bold text-gray-700 block mb-1">Retention period</label>
                            <select v-model="retentionPeriod" class="aws-input text-xs">
                                <option>7 days</option>
                                <option>15 months</option>
                                <option>2 years</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[11px] font-bold text-gray-700 block mb-1">AWS KMS key <span
                                    class="text-[var(--aws-blue)] font-normal ml-1">Info</span></label>
                            <select disabled class="aws-input text-xs bg-gray-50">
                                <option>(default) aws/rds</option>
                            </select>
                        </div>
                        <div class="mt-4">
                            <p class="text-[11px] font-bold text-gray-700">Account</p>
                            <p class="text-xs text-gray-600">280360033441</p>
                        </div>
                        <div class="mt-2">
                            <p class="text-[11px] font-bold text-gray-700">KMS key ID</p>
                            <p class="text-xs text-gray-600">51368ebc-b1ce-49ec-9c97-f787707d885d</p>
                        </div>
                        <div class="bg-yellow-50 border border-yellow-200 rounded-sm p-3 flex items-start gap-2 mt-4">
                            <svg class="w-4 h-4 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clip-rule="evenodd" />
                            </svg>
                            <p class="text-[11px] text-gray-700 font-bold uppercase">You can't change the KMS key after
                                you create your database.</p>
                        </div>
                    </div>
                </div>

                <!-- Additional monitoring settings -->
                <div class="border-t border-gray-100 pt-4">
                    <button @click="showAdditionalMonitoring = !showAdditionalMonitoring"
                        class="flex items-center gap-2 text-gray-800 font-bold text-xs">
                        <svg class="w-3.5 h-3.5 transition-transform"
                            :class="showAdditionalMonitoring ? 'rotate-180' : 'rotate-90'" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 15l7-7 7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        Additional monitoring settings
                    </button>
                    <p class="text-[10px] text-gray-500 ml-6">Enhanced Monitoring, CloudWatch Logs and DevOps Guru</p>

                    <div v-if="showAdditionalMonitoring" class="mt-6 space-y-6 max-w-4xl ml-6">
                        <div>
                            <h4 class="text-xs font-bold text-gray-700 mb-2">Enhanced Monitoring</h4>
                            <label class="flex items-start gap-2 cursor-pointer">
                                <input type="checkbox" v-model="enhancedMonitoring" class="w-4 h-4 mt-0.5 rounded-sm" />
                                <div>
                                    <span class="text-xs font-bold text-gray-700 block">Enable Enhanced
                                        monitoring</span>
                                    <span class="text-[10px] text-gray-500 leading-tight">Enabling Enhanced Monitoring
                                        metrics are useful when you want to see how different processes or threads use
                                        the CPU.</span>
                                </div>
                            </label>
                        </div>

                        <div v-if="enhancedMonitoring" class="grid grid-cols-2 gap-8">
                            <div>
                                <label class="text-[11px] font-bold text-gray-700 block mb-1">OS metrics
                                    granularity</label>
                                <select v-model="osMetricsGranularity" class="aws-input text-xs">
                                    <option>60 seconds</option>
                                    <option>30 seconds</option>
                                    <option>10 seconds</option>
                                    <option>5 seconds</option>
                                    <option>1 second</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-[11px] font-bold text-gray-700 block mb-1">Monitoring role for OS
                                    metrics</label>
                                <div class="flex items-center gap-2">
                                    <select v-model="monitoringRole" class="aws-input text-xs flex-grow">
                                        <option>rds-monitoring-role</option>
                                    </select>
                                    <button class="p-1.5 border border-gray-300 rounded-sm hover:bg-gray-50">
                                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </button>
                                    <button
                                        class="text-[var(--aws-blue)] text-xs font-bold border border-[var(--aws-blue)] px-3 py-1.5 rounded-sm whitespace-nowrap">Create
                                        new role ↗</button>
                                </div>
                                <p class="text-[10px] text-gray-500 mt-1 leading-tight">The monitoring role is an IAM
                                    role that allows RDS to send Enhanced Monitoring metrics to Amazon CloudWatch Logs.
                                    Choose an existing monitoring role, or choose **default** to have RDS automatically
                                    create the IAM role **rds-monitoring-role** for you.</p>
                            </div>
                        </div>

                        <div>
                            <h4 class="text-xs font-bold text-gray-700 mb-2">Log exports</h4>
                            <p class="text-[11px] text-gray-500 mb-3">Select the log types to publish to Amazon
                                CloudWatch Logs</p>
                            <div class="space-y-2">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" class="w-4 h-4 rounded-sm" />
                                    <span class="text-xs text-gray-700">iam-db-auth-error log</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" class="w-4 h-4 rounded-sm" />
                                    <span class="text-xs text-gray-700">instance log</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" class="w-4 h-4 rounded-sm" />
                                    <span class="text-xs text-gray-700">PostgreSQL log</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <h4 class="text-xs font-bold text-gray-700 mb-2">IAM role</h4>
                            <p class="text-[10px] text-gray-500 mb-1">The following service-linked role is used for
                                publishing logs to Cloudwatch Logs.</p>
                            <input disabled type="text" value="RDS service-linked role"
                                class="aws-input bg-gray-50 text-xs italic" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Additional configuration expandable -->
            <div class="aws-card rounded-sm mb-6">
                <div @click="showAdditionalConfig = !showAdditionalConfig"
                    class="p-4 cursor-pointer hover:bg-gray-50 flex items-center gap-3">
                    <svg class="w-4 h-4 transition-transform" :class="showAdditionalConfig ? 'rotate-90' : ''"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div>
                        <h3 class="font-bold text-gray-900 text-sm">Additional configuration</h3>
                        <p class="text-[11px] text-gray-500 mt-0.5">Database options, backup turned on, backtrack turned
                            off, Enhanced Monitoring turned on, maintenance, CloudWatch Logs, delete protection turned
                            off</p>
                    </div>
                </div>

                <div v-if="showAdditionalConfig" class="px-6 pb-6 space-y-8">
                    <div>
                        <h4 class="text-base font-bold text-gray-900 mb-4">Database options</h4>
                        <div class="max-w-2xl">
                            <label class="aws-label mb-1">DB cluster parameter group <span
                                    class="text-[var(--aws-blue)] text-[10px] font-normal ml-1">Info</span></label>
                            <select v-model="dbParameterGroup" class="aws-input text-xs">
                                <option>default.aurora-postgresql17</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-base font-bold text-gray-900 mb-4">Backup</h4>
                        <div class="space-y-6 max-w-2xl">
                            <div>
                                <label class="aws-label mb-1">Backup retention period <span
                                        class="text-[var(--aws-blue)] text-[10px] font-normal ml-1">Info</span></label>
                                <p class="text-[11px] text-gray-500 mb-2">The number of days (1-35) for which automatic
                                    backups are kept.</p>
                                <div class="flex items-center gap-2">
                                    <select v-model="backupRetention" class="aws-input w-24 text-xs">
                                        <option :value="7">7</option>
                                        <option v-for="n in 35" :key="n" :value="n">{{ n }}</option>
                                    </select>
                                    <span class="text-xs text-gray-600">days</span>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-8">
                                <div>
                                    <label class="aws-label mb-1">Start time</label>
                                    <div class="flex items-center gap-2">
                                        <select class="aws-input w-20 text-xs">
                                            <option>01</option>
                                        </select>
                                        <span class="text-xs">:</span>
                                        <select class="aws-input w-20 text-xs">
                                            <option>46</option>
                                        </select>
                                        <span class="text-xs font-bold text-gray-700">UTC</span>
                                    </div>
                                </div>
                                <div>
                                    <label class="aws-label mb-1">Duration</label>
                                    <div class="flex items-center gap-2">
                                        <select class="aws-input w-20 text-xs">
                                            <option>0.5</option>
                                        </select>
                                        <span class="text-xs text-gray-600">hours</span>
                                    </div>
                                </div>
                            </div>

                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" v-model="copyTagsToSnapshots" class="w-4 h-4 rounded-sm" />
                                <span class="text-xs font-bold text-gray-700">Copy tags to snapshots</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-base font-bold text-gray-900 mb-4">Maintenance</h4>
                        <div class="space-y-6 max-w-3xl">
                            <label class="flex items-start gap-2 cursor-pointer">
                                <input type="checkbox" v-model="autoMinorVersionUpgrade"
                                    class="w-4 h-4 mt-0.5 rounded-sm" />
                                <div>
                                    <span class="text-xs font-bold text-gray-700 block text-[var(--aws-blue)]">Enable
                                        auto minor version upgrade <span
                                            class="text-[var(--aws-blue)] font-normal ml-1 italic">Info</span></span>
                                    <span class="text-[10px] text-gray-500 leading-tight">Enabling auto minor version
                                        upgrade will automatically upgrade your database minor version. For limitations
                                        and more details, see <a href="#"
                                            class="text-[var(--aws-blue)] hover:underline">Automatically upgrading the
                                            minor engine version documentation</a>.</span>
                                </div>
                            </label>

                            <div>
                                <h4 class="text-xs font-bold text-gray-700 mb-1">DB cluster maintenance window</h4>
                                <p class="text-[11px] text-gray-500 mb-4">The weekly time range during which system
                                    maintenance can occur.</p>
                                <div class="grid grid-cols-3 gap-6">
                                    <div>
                                        <label class="aws-label mb-1">Start day</label>
                                        <select v-model="maintenanceStartDay" class="aws-input text-xs">
                                            <option>Tuesday</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="aws-label mb-1">Start time</label>
                                        <div class="flex items-center gap-2">
                                            <select class="aws-input w-16 text-xs">
                                                <option>06</option>
                                            </select>
                                            <span class="text-xs">:</span>
                                            <select class="aws-input w-16 text-xs">
                                                <option>24</option>
                                            </select>
                                            <span class="text-xs font-bold text-gray-700">UTC</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="aws-label mb-1">Duration</label>
                                        <div class="flex items-center gap-2">
                                            <select class="aws-input w-20 text-xs">
                                                <option>0.5</option>
                                            </select>
                                            <span class="text-xs text-gray-600">hours</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <label class="flex items-start gap-2 cursor-pointer">
                                <input type="checkbox" v-model="deletionProtection" class="w-4 h-4 mt-0.5 rounded-sm" />
                                <div>
                                    <span class="text-xs font-bold text-gray-700 block">Enable deletion
                                        protection</span>
                                    <span class="text-[10px] text-gray-500 leading-tight">Protects the database from
                                        being deleted accidentally. While this option is enabled, you can't delete the
                                        database.</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sticky Footer -->
        <div
            class="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex items-center justify-end px-8 gap-4 z-50">
            <button @click="cancel" class="text-xs font-bold text-[var(--aws-blue)] hover:underline">Cancel</button>
            <button @click="handleContinue" class="btn-aws-primary px-8">Continue</button>
        </div>
    </div>
</template>

<style scoped>
/* Standard AWS UI classes assumed to be defined globally */
</style>
