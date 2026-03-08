<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useComputeStore } from '../store/computeStore'

const route = useRoute()
const router = useRouter()
const computeStore = useComputeStore()
const sgId = route.params.id as string

const activeTab = ref<'inbound' | 'outbound'>('inbound')

const newRule = ref({
    protocol: 'tcp',
    from_port: 80,
    to_port: 80,
    source_dest_cidr: '0.0.0.0/0',
    description: ''
})

onMounted(async () => {
    await computeStore.fetchSecurityGroup(sgId)
})

const inboundRules = computed(() =>
    computeStore.currentSecurityGroup?.rules.filter(r => r.type === 'inbound') || []
)

const outboundRules = computed(() =>
    computeStore.currentSecurityGroup?.rules.filter(r => r.type === 'outbound') || []
)

const handleAddRule = async () => {
    try {
        await computeStore.addRule(sgId, {
            ...newRule.value,
            type: activeTab.value
        })
        newRule.value = {
            protocol: 'tcp',
            from_port: 80,
            to_port: 80,
            source_dest_cidr: '0.0.0.0/0',
            description: ''
        }
    } catch (e) {
        console.error('Failed to add rule', e)
    }
}

const handleDeleteRule = async (ruleId: string) => {
    try {
        await computeStore.deleteRule(sgId, ruleId)
    } catch (e) {
        console.error('Failed to delete rule', e)
    }
}

const goBack = () => {
    router.back()
}
</script>

<template>
    <div class="min-h-screen bg-[#fafafa] font-urbanist pb-40">
        <!-- Structural Grid Background -->
        <div
            class="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none">
        </div>

        <div class="relative z-10 p-8 px-8 md:px-16 pt-24 max-w-[1400px] mx-auto">
            <!-- Breadcrumbs -->
            <nav class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                <span class="text-[#879196]">EC2_ENGINE</span>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span class="text-[#879196]">SECURITY_GROUPS</span>
                <div class="w-1 h-1 bg-[#eaeded] rounded-full"></div>
                <span class="text-[#232f3e]">{{ computeStore.currentSecurityGroup?.name || 'SG_LOADING' }}</span>
            </nav>

            <!-- Header -->
            <div class="flex items-end justify-between mb-16 pb-12 border-b-2 border-[#eaeded]">
                <div>
                    <h1 class="text-4xl font-black text-[#232f3e] uppercase tracking-tighter mb-4">Edit Security Rules
                    </h1>
                    <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest italic">// Group_ID: {{
                        sgId }} // Description: {{ computeStore.currentSecurityGroup?.description }}</p>
                </div>
                <button @click="goBack"
                    class="px-8 py-3 bg-[#232f3e] text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
                    Return_To_Node
                </button>
            </div>

            <!-- Tabs -->
            <div class="flex gap-1 mb-12">
                <button v-for="tab in ['inbound', 'outbound'] as const" :key="tab" @click="activeTab = tab"
                    class="px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2"
                    :class="activeTab === tab ? 'bg-[#232f3e] text-white border-[#232f3e]' : 'bg-white text-[#879196] border-[#eaeded] hover:border-[#232f3e]'">
                    {{ tab }}_Rules
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <!-- Rules Table -->
                <div class="lg:col-span-3 space-y-8">
                    <div
                        class="bg-white border-2 border-[#232f3e] overflow-hidden shadow-[20px_20px_0_rgba(35,47,62,0.05)]">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr
                                    class="bg-[#fafafa] text-[10px] font-black uppercase tracking-widest text-[#879196] border-b-2 border-[#eaeded]">
                                    <th class="p-6 border-r-2 border-[#eaeded]">Protocol</th>
                                    <th class="p-6 border-r-2 border-[#eaeded]">Port Range</th>
                                    <th class="p-6 border-r-2 border-[#eaeded]">Source/Dest</th>
                                    <th class="p-6 border-r-2 border-[#eaeded]">Description</th>
                                    <th class="p-6">Action</th>
                                </tr>
                            </thead>
                            <tbody class="text-xs font-black uppercase">
                                <tr v-for="rule in (activeTab === 'inbound' ? inboundRules : outboundRules)"
                                    :key="rule.id"
                                    class="border-b-2 border-[#eaeded] hover:bg-[#fafafa] transition-colors">
                                    <td class="p-6 border-r-2 border-[#eaeded] text-blue-600">{{ rule.protocol }}</td>
                                    <td class="p-6 border-r-2 border-[#eaeded] text-[#232f3e]">{{ rule.from_port ===
                                        rule.to_port ? rule.from_port : `${rule.from_port}-${rule.to_port}` }}</td>
                                    <td class="p-6 border-r-2 border-[#eaeded] text-[#545b64] font-mono">{{
                                        rule.source_dest_cidr }}</td>
                                    <td class="p-6 border-r-2 border-[#eaeded] text-[#879196] italic lowercase">{{
                                        rule.description || 'no_description_node' }}</td>
                                    <td class="p-6 text-rose-600">
                                        <button @click="handleDeleteRule(rule.id)"
                                            class="hover:underline">DELETE_RULE</button>
                                    </td>
                                </tr>
                                <tr v-if="(activeTab === 'inbound' ? inboundRules : outboundRules).length === 0">
                                    <td colspan="5"
                                        class="p-12 text-center text-[10px] text-[#879196] tracking-[0.3em]">
                                        NO_{{ activeTab.toUpperCase() }}_RULES_DEFINED
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Add Rule Panel -->
                <div class="space-y-8">
                    <div class="bg-white border-2 border-blue-600 p-8 shadow-[10px_10px_0_rgba(37,99,235,0.1)]">
                        <h3
                            class="text-sm font-black text-[#232f3e] uppercase tracking-widest mb-8 flex items-center gap-3">
                            <span class="w-1.5 h-4 bg-blue-600"></span>
                            Add New Rule
                        </h3>

                        <div class="space-y-6">
                            <div class="flex flex-col gap-2">
                                <label
                                    class="text-[9px] font-black text-[#879196] uppercase tracking-widest">Protocol</label>
                                <select v-model="newRule.protocol"
                                    class="w-full bg-[#fafafa] border-2 border-[#eaeded] p-3 text-[10px] font-black uppercase outline-none focus:border-blue-600 transition-colors">
                                    <option value="tcp">TCP</option>
                                    <option value="udp">UDP</option>
                                    <option value="icmp">ICMP</option>
                                    <option value="all">ALL TRAFFIC</option>
                                </select>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="flex flex-col gap-2">
                                    <label class="text-[9px] font-black text-[#879196] uppercase tracking-widest">From
                                        Port</label>
                                    <input v-model.number="newRule.from_port" type="number"
                                        class="w-full bg-[#fafafa] border-2 border-[#eaeded] p-3 text-[10px] font-black uppercase outline-none focus:border-blue-600 transition-colors" />
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label class="text-[9px] font-black text-[#879196] uppercase tracking-widest">To
                                        Port</label>
                                    <input v-model.number="newRule.to_port" type="number"
                                        class="w-full bg-[#fafafa] border-2 border-[#eaeded] p-3 text-[10px] font-black uppercase outline-none focus:border-blue-600 transition-colors" />
                                </div>
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="text-[9px] font-black text-[#879196] uppercase tracking-widest">{{
                                    activeTab === 'inbound' ? 'Source' : 'Destination' }} CIDR</label>
                                <input v-model="newRule.source_dest_cidr" type="text"
                                    class="w-full bg-[#fafafa] border-2 border-[#eaeded] p-3 text-[10px] font-black uppercase outline-none focus:border-blue-600 transition-colors font-mono"
                                    placeholder="0.0.0.0/0" />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label
                                    class="text-[9px] font-black text-[#879196] uppercase tracking-widest">Description</label>
                                <input v-model="newRule.description" type="text"
                                    class="w-full bg-[#fafafa] border-2 border-[#eaeded] p-3 text-[10px] font-black uppercase outline-none focus:border-blue-600 transition-colors"
                                    placeholder="e.g. web_traffic" />
                            </div>

                            <button @click="handleAddRule"
                                class="w-full py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#232f3e] transition-all shadow-none mt-4">
                                APPEND_PROTOCOL_RULE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
