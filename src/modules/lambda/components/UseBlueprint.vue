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
  <div class="space-y-6">
    <div class="glass-panel p-8 rounded-3xl border border-white/10 shadow-xl">
      <div class="flex items-center gap-1.5 mb-8">
        <h3 class="text-xl font-bold text-white">Basic information</h3>
      </div>

      <div class="space-y-8 max-w-4xl">
         <!-- Blueprint Name -->
         <div>
          <label class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Blueprint name</label>
          <div class="relative group max-w-2xl">
              <select v-model="blueprintName" 
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all cursor-pointer appearance-none">
                <option v-for="b in blueprints" :key="b.name" :value="b.name" class="bg-[#1a1c23]">{{ b.name }}</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
          </div>
          <p class="text-[10px] text-slate-500 mt-2 font-medium">A starter AWS Lambda function. <span class="ml-4 font-bold text-amber-500">nodejs22.x</span></p>
        </div>

        <!-- Function Name -->
        <div class="max-w-2xl">
          <label class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Function name</label>
          <p class="text-[11px] text-slate-400 mb-4">Enter a name that describes the purpose of your function.</p>
          <input v-model="functionName" type="text" placeholder="my-blueprint-function" 
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder:text-slate-600" />
        </div>

        <!-- Static Info -->
        <div class="grid grid-cols-2 gap-8 max-w-lg">
            <div class="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Runtime</label>
                <p class="text-xs text-white font-bold">nodejs22.x</p>
            </div>
            <div class="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                 <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Architecture</label>
                 <p class="text-xs text-white font-bold">x86_64</p>
            </div>
        </div>

        <!-- Execution Role -->
        <div>
            <label class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Execution role</label>
            <div class="space-y-4">
                <label v-for="role in [{id: 'create-new', label: 'Create a new role with basic Lambda permissions'}, {id: 'existing', label: 'Use an existing role'}]" :key="role.id"
                    class="flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group"
                    :class="executionRole === role.id ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'">
                    <div class="mt-0.5">
                        <input type="radio" :value="role.id" v-model="executionRole" class="sr-only">
                        <div class="w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center"
                            :class="executionRole === role.id ? 'border-amber-500 bg-amber-500' : 'border-slate-700'">
                            <div v-if="executionRole === role.id" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                        </div>
                    </div>
                    <span class="text-sm font-bold transition-colors" :class="executionRole === role.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'">{{ role.label }}</span>
                </label>
            </div>
        </div>
      </div>
    </div>

    <!-- Lambda Function Code -->
    <div class="glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div class="px-8 py-6 border-b border-white/5">
            <h3 class="font-bold text-white text-lg">Lambda function code</h3>
            <p class="text-xs text-slate-500 mt-1">Code is preconfigured by the chosen blueprint. You can configure it after you create the function.</p>
        </div>
        <div class="bg-[#0b0e14] p-0 flex flex-col min-h-[400px]">
             <!-- Minimal Mock Editor -->
             <div class="bg-white/[0.03] border-b border-white/5 px-6 py-3 flex justify-end">
                <div class="flex gap-1.5">
                    <div class="w-2.5 h-2.5 rounded-full bg-red-500/30"></div>
                    <div class="w-2.5 h-2.5 rounded-full bg-amber-500/30"></div>
                    <div class="w-2.5 h-2.5 rounded-full bg-emerald-500/30"></div>
                </div>
             </div>
             <pre class="p-8 font-mono text-xs leading-relaxed flex-grow text-slate-300 overflow-x-auto"><code>{{ codeSnippet }}</code></pre>
             <div class="bg-white/[0.02] border-t border-white/5 px-6 py-2 text-[10px] text-slate-600 font-mono text-right italic">
                 1:1 JavaScript
             </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.glass-panel {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}
</style>

