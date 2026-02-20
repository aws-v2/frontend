<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLambdaStore } from '../store/lambdaStore'

const router = useRouter()
const lambdaStore = useLambdaStore()
const activeRuntimeTabIndex = ref(2) // Default to Node.js

const runtimes = [
  { name: '.NET', code: 'public void Handler(Stream stream) {\n  Console.WriteLine("Hello from .NET!");\n}' },
  { name: 'Java', code: 'public class Handler implements RequestHandler<Map<String, String>, String> {\n  @Override\n  public String handleRequest(Map<String, String> event, Context context) {\n    return "Hello from Java!";\n  }\n}' },
  { name: 'Node.js', code: 'exports.handler = async (event) => {\n  console.log(event);\n  return "Hello from Lambda!";\n};' },
  { name: 'Python', code: 'import json\n\ndef lambda_handler(event, context):\n    print(event)\n    return {\n        \'statusCode\': 200,\n        \'body\': json.dumps(\'Hello from Python!\')\n    }' },
  { name: 'Ruby', code: 'require "json"\n\ndef lambda_handler(event:, context:)\n    puts event\n    { statusCode: 200, body: JSON.generate("Hello from Ruby!") }\nend' },
  { name: 'Custom runtime', code: '# Custom runtime example\n# bootstrap file\nwhile true; do\n  HEADERS="$(mktemp)"\n  EVENT_DATA=$(curl -sS -LD "$HEADERS" "http://${AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime/invocation/next")\n  # Process event...\n  curl -X POST "http://${AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime/invocation/$INVOCATION_ID/response" -d "Success"\ndone' }
]

const navigateToCreate = () => {
    router.push({ name: 'lambda-create' })
}

onMounted(() => {
    lambdaStore.fetchFunctions()
})
</script>

<template>
    <div class="min-h-screen relative overflow-hidden bg-[#05080F]">
        <!-- Ambient Background -->
        <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-[10%] left-[10%] w-[50vw] h-[50vw] bg-amber-600/10 rounded-full blur-[120px] opacity-20"></div>
            <div class="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-orange-600/10 rounded-full blur-[100px] opacity-10"></div>
            <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
        </div>

        <div class="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
            <!-- Header Section -->
            <div class="flex flex-col lg:flex-row justify-between items-start gap-12 mb-24">
                <div class="max-w-3xl">
                    <div class="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-widest uppercase">
                        <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        Event-Driven Serverless
                    </div>
                    <h1 class="text-6xl md:text-7xl font-bold text-white tracking-tight font-display mb-8">
                        Scale Seamlessly.<br>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Zero Admin.</span>
                    </h1>
                    <p class="text-xl text-slate-400 leading-relaxed font-light max-w-2xl">
                        AWS Lambda lets you run code without thinking about servers. Pay only for the compute time you consume with zero administration and sub-ms scaling.
                    </p>
                </div>

                <!-- Launch Card -->
                <div class="glass-panel p-8 rounded-3xl w-full lg:w-96 border border-white/10 hover:border-amber-500/30 transition-all group">
                    <h3 class="text-xl font-bold text-white mb-4">Get Started</h3>
                    <p class="text-sm text-slate-400 mb-8 leading-relaxed">
                        Author a Lambda function from scratch, or choose from one of many preconfigured examples.
                    </p>
                    <button @click="navigateToCreate" 
                        class="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-amber-900/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all">
                        Create Function
                    </button>
                </div>
            </div>

            <!-- Functions Management Section -->
            <div class="mb-24">
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h2 class="text-3xl font-bold text-white mb-2">My Functions</h2>
                        <p class="text-sm text-slate-500 uppercase tracking-widest font-bold">Manage your serverless infrastructure</p>
                    </div>
                    <button @click="navigateToCreate" class="flex items-center gap-2 text-amber-400 text-sm font-bold hover:text-amber-300 transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        New Function
                    </button>
                </div>

                <div class="glass-panel rounded-3xl overflow-hidden border border-white/5">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="border-b border-white/5 bg-white/[0.02]">
                                    <th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Function Name</th>
                                    <th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Runtime</th>
                                    <th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Modified</th>
                                    <th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                    <th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="func in lambdaStore.functions" :key="func.id" 
                                    class="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <td class="px-8 py-6">
                                        <div class="flex items-center gap-4">
                                            <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <div class="flex flex-col">
                                                <button @click="router.push({ name: 'lambda-details', params: { id: func.id } })" 
                                                    class="text-sm font-bold text-white hover:text-amber-400 transition-colors text-left cursor-pointer">
                                                    {{ func.name }}
                                                </button>
                                                <span class="text-[10px] text-slate-500 mt-0.5">{{ func.description }}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-8 py-6">
                                        <span class="text-xs font-bold text-slate-400 group-hover:text-slate-300 transition-colors">{{ func.runtime }}</span>
                                    </td>
                                    <td class="px-8 py-6">
                                        <span class="text-xs text-slate-500">{{ func.lastModified }}</span>
                                    </td>
                                    <td class="px-8 py-6">
                                        <div class="flex items-center gap-2">
                                            <div class="w-1.5 h-1.5 rounded-full" :class="func.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-600'"></div>
                                            <span class="text-[10px] font-black uppercase tracking-widest" :class="func.status === 'Active' ? 'text-emerald-500/80' : 'text-slate-500'">
                                                {{ func.status }}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="px-8 py-6 text-right">
                                        <button class="p-2 text-slate-500 hover:text-white transition-colors">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- How it works -->
            <div class="grid lg:grid-cols-2 gap-12 items-center mb-24">
                <div>
                    <h2 class="text-4xl font-bold text-white mb-6">Just Write Code.</h2>
                    <p class="text-slate-400 leading-relaxed mb-8">
                        Focus on your business logic while we handle the rest. Lambda takes care of server provisioning, maintenance, OS patching, and capacity provisioning.
                    </p>
                    <div class="space-y-4">
                        <div v-for="(runtime, index) in runtimes.slice(0, 4)" :key="runtime.name"
                            @click="activeRuntimeTabIndex = index"
                            class="p-4 rounded-xl border transition-all cursor-pointer group"
                            :class="activeRuntimeTabIndex === index ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'">
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-bold transition-colors" :class="activeRuntimeTabIndex === index ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'">
                                    {{ runtime.name }}
                                </span>
                                <div class="w-2 h-2 rounded-full" :class="activeRuntimeTabIndex === index ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-700'"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="glass-panel p-1 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                    <div class="bg-[#0b0e14] rounded-[22px] overflow-hidden">
                        <div class="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-b border-white/5">
                            <div class="flex gap-1.5">
                                <div class="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                <div class="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                                <div class="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                            </div>
                            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">lambda_handler.{{ runtimes[activeRuntimeTabIndex]?.name.toLowerCase() }}</span>
                        </div>
                        <div class="p-8 font-mono text-sm leading-relaxed overflow-x-auto">
                            <pre class="text-slate-300"><code>{{ runtimes[activeRuntimeTabIndex]?.code }}</code></pre>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-t border-white/5">
                <div>
                    <div class="text-4xl font-bold text-white mb-2 font-display">1M<span class="text-amber-500">+</span></div>
                    <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Free Requests</div>
                </div>
                <div>
                    <div class="text-4xl font-bold text-white mb-2 font-display">15<span class="text-amber-500">min</span></div>
                    <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Max Execution</div>
                </div>
                <div>
                    <div class="text-4xl font-bold text-white mb-2 font-display">10<span class="text-amber-500">GB</span></div>
                    <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Max RAM Size</div>
                </div>
                <div>
                    <div class="text-4xl font-bold text-white mb-2 font-display">0<span class="text-amber-500">ms</span></div>
                    <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cold Starts</div>
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

.font-display {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
</style>

