<script setup lang="ts">
import { ref } from 'vue'

const blueprintName = ref('Hello world function')
const functionName = ref('')
const architecture = ref('x86_64')
const executionRole = ref('create-new')

const blueprints = [
    { name: 'Hello world function', desc: 'A starter AWS Lambda function.', runtime: 'nodejs22.x' },
    { name: 'Microservice-http-endpoint', desc: 'A starter AWS Lambda function with HTTP endpoint.', runtime: 'nodejs22.x' }
]

const codeSnippet = `// console.log('Loading function');

export const handler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('value1 =', event.key1);
    console.log('value2 =', event.key2);
    console.log('value3 =', event.key3);
    return event.key1; // Echo back the first key value
    // throw new Error('Something went wrong');
};`
</script>

<template>
    <div class="space-y-10">
        <div class="bg-white p-10 border-2 border-[#232f3e] relative overflow-hidden">
            <div
                class="absolute right-0 top-0 w-32 h-32 bg-[#fafafa] -rotate-45 translate-x-16 -translate-y-16 border-l-2 border-[#232f3e]">
            </div>

            <div class="flex items-center gap-4 mb-10">
                <span class="w-1.5 h-8 bg-amber-500"></span>
                <h3 class="text-2xl font-black text-[#232f3e] uppercase tracking-tight">Blueprint_Manifest</h3>
            </div>

            <div class="space-y-10 max-w-4xl">
                <!-- Blueprint Name -->
                <div class="space-y-4 max-w-2xl">
                    <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic">//
                        Selected_Template</label>
                    <div class="relative group">
                        <select v-model="blueprintName"
                            class="w-full bg-white border-2 border-[#eaeded] px-6 py-4 text-sm font-black text-[#232f3e] focus:border-amber-500 outline-none transition-all cursor-pointer appearance-none uppercase tracking-widest">
                            <option v-for="b in blueprints" :key="b.name" :value="b.name"
                                class="bg-white text-[#232f3e]">{{ b.name }}</option>
                        </select>
                        <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#879196]">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M19 9l-7 7-7-7" stroke-width="3" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                    </div>
                    <p class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em]">Starter_Module // <span
                            class="text-amber-600">nodejs22.x</span> // AWS_LAMBDA_OPTIMIZED</p>
                </div>

                <!-- Function Name -->
                <div class="space-y-4 max-w-2xl">
                    <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic">//
                        Destination_Identifier</label>
                    <input v-model="functionName" type="text" placeholder="BLUEPRINT_NODE_V1"
                        class="w-full bg-white border-2 border-[#eaeded] px-6 py-4 text-sm font-black text-[#232f3e] focus:border-amber-500 outline-none transition-all placeholder:text-[#eaeded] uppercase tracking-widest" />
                </div>

                <!-- Static Info -->
                <div class="grid grid-cols-2 gap-4 max-w-lg">
                    <div class="p-6 bg-[#fafafa] border-2 border-[#eaeded] flex flex-col">
                        <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-1 italic">//
                            Runtime</span>
                        <span class="text-sm font-black text-[#232f3e] uppercase">nodejs22.x</span>
                    </div>
                    <div class="p-6 bg-[#fafafa] border-2 border-[#eaeded] flex flex-col">
                        <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.2em] mb-1 italic">//
                            Architecture</span>
                        <span class="text-sm font-black text-[#232f3e] uppercase">x86_64</span>
                    </div>
                </div>

                <!-- Execution Role -->
                <div class="space-y-6">
                    <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-[#879196] italic">//
                        Permission_Protocol</label>
                    <div class="space-y-4">
                        <label
                            v-for="role in [{ id: 'create-new', label: 'Forge new protocol identity', sub: 'Default_Permissions_Policy' }, { id: 'existing', label: 'Inject existing security token', sub: 'Cross_Resource_Role' }]"
                            :key="role.id"
                            class="flex items-start gap-6 p-6 border-2 transition-all cursor-pointer group"
                            :class="executionRole === role.id ? 'bg-[#fafafa] border-amber-500' : 'bg-white border-[#eaeded] hover:border-[#232f3e]'">
                            <div class="mt-1">
                                <input type="radio" :value="role.id" v-model="executionRole" class="sr-only">
                                <div class="w-6 h-6 border-2 transition-all flex items-center justify-center"
                                    :class="executionRole === role.id ? 'border-amber-500 bg-amber-500' : 'border-[#eaeded] group-hover:border-[#232f3e]'">
                                    <div v-if="executionRole === role.id" class="w-3 h-3 bg-white"></div>
                                </div>
                            </div>
                            <div class="flex-grow">
                                <span class="text-sm font-black uppercase tracking-tight block transition-colors"
                                    :class="executionRole === role.id ? 'text-[#232f3e]' : 'text-[#879196] group-hover:text-[#232f3e]'">{{
                                        role.label }}</span>
                                <span
                                    class="text-[9px] font-black text-[#879196] uppercase tracking-widest block mt-2">{{
                                        role.sub }}</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <!-- Lambda Function Code -->
        <div class="bg-white border-2 border-[#232f3e] overflow-hidden">
            <div class="px-8 py-6 border-b-2 border-[#eaeded] bg-[#fafafa] flex items-center justify-between">
                <div>
                    <h3 class="font-black text-[#232f3e] text-lg uppercase tracking-tight">Artifact_Source_Preview</h3>
                    <p class="text-[9px] font-black text-[#879196] uppercase tracking-widest mt-1 italic">// Read-only
                        // Blueprint_Defined</p>
                </div>
                <div class="flex gap-2">
                    <div class="w-3 h-3 border-2 border-[#232f3e]"></div>
                    <div class="w-3 h-3 border-2 border-[#232f3e]"></div>
                    <div class="w-3 h-3 border-2 border-[#232f3e] bg-amber-500"></div>
                </div>
            </div>
            <div class="bg-[#1a1c23] p-0 flex flex-col min-h-[400px] relative">
                <div class="absolute right-0 top-0 w-8 h-full bg-white/[0.02] border-l border-white/5"></div>
                <pre
                    class="p-10 font-mono text-[11px] leading-relaxed flex-grow text-[#94a3b8] overflow-x-auto selection:bg-amber-500/30"><code>{{ codeSnippet }}</code></pre>
                <div
                    class="bg-black/20 border-t border-white/5 px-8 py-3 text-[10px] text-[#475569] font-mono text-right uppercase tracking-[0.2em] font-black italic">
                    1:1_JS_STRICT // SECURE_RUNTIME
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Scoped styles removed as utility classes are used for the new theme */
</style>
