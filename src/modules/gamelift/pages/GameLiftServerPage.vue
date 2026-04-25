<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchGameManifest } from '../services/gameliftApi'

const route = useRoute()
const router = useRouter()

const gameId = route.params.id as string

const manifest = ref<any>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
    try {
        manifest.value = await fetchGameManifest(gameId)
    } catch (e: any) {
        error.value = e.message
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="min-h-screen pb-24 bg-white font-urbanist selection:bg-[#ff9900]/30">
        <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]"></div>

        <div class="relative z-10 max-w-[1600px] mx-auto px-8 md:px-16 pt-24 pb-20">

            <!-- Back nav -->
            <button @click="router.back()"
                class="inline-flex items-center gap-2 text-[10px] font-black text-[#879196] uppercase tracking-[0.2em] hover:text-[#ff9900] transition-colors mb-10 group">
                <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Registry
            </button>

            <!-- Loading -->
            <div v-if="loading" class="py-32 text-center">
                <div class="w-8 h-8 border-2 border-[#ff9900] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest">Loading manifest...</p>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="py-32 text-center">
                <p class="text-sm font-bold text-red-600 mb-2">{{ error }}</p>
                <p class="text-[10px] text-[#879196] font-black uppercase tracking-widest">Could not load game manifest.</p>
            </div>

            <template v-else-if="manifest">

                <!-- Header -->
                <header class="mb-14">
                    <div class="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white border border-[#ff9900]/30 text-[#ff9900] text-[10px] font-black tracking-[0.2em] uppercase">
                        <div class="w-1.5 h-1.5 bg-[#879196] rounded-full"></div>
                        GameLift · Game Manifest
                    </div>
                    <h1 class="text-5xl md:text-6xl font-black text-[#232f3e] uppercase tracking-tighter mb-3">
                        Game <span class="text-[#ff9900]">#{{ gameId }}</span>
                    </h1>
                    <p class="text-[#545b64] font-medium text-sm">Build configuration and deployment manifest.</p>
                </header>

                <!-- Manifest Panel — full width -->
                <div class="border-2 border-[#232f3e] overflow-hidden">
                    <div class="px-8 py-5 bg-[#fafafa] border-b-2 border-[#eaeded] flex items-center justify-between">
                        <h2 class="text-sm font-black text-[#232f3e] uppercase tracking-tighter">Game Manifest</h2>
                        <span class="text-[9px] font-black text-[#879196] uppercase tracking-[0.3em]">Build Config</span>
                    </div>

                    <div class="p-8">

                        <!-- Headless Binary -->
                        <div class="mb-8">
                            <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-2">Headless Binary</p>
                            <div class="bg-[#fafafa] border border-[#eaeded] px-4 py-3">
                                <code class="font-mono text-sm text-[#232f3e]">
                                    {{ manifest.headless_bin || manifest.HeadlessBin || '–' }}
                                </code>
                            </div>
                        </div>

                        <!-- Required Files -->
                        <div v-if="manifest.required_files?.length || manifest.RequiredFiles?.length" class="mb-8">
                            <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Required Files</p>
                            <div class="space-y-2">
                                <div v-for="(file, i) in (manifest.required_files || manifest.RequiredFiles)" :key="i"
                                    class="flex items-center gap-3 px-4 py-3 border border-[#eaeded] bg-[#fafafa]">
                                    <svg class="w-4 h-4 text-[#ff9900] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <code class="font-mono text-xs text-[#545b64]">{{ file }}</code>
                                </div>
                            </div>
                        </div>

                        <!-- Ports -->
                        <div v-if="manifest.ports || manifest.Ports" class="mb-8">
                            <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Exposed Ports</p>
                            <div class="flex flex-wrap gap-2">
                                <template v-if="Array.isArray(manifest.ports || manifest.Ports)">
                                    <span v-for="(port, i) in (manifest.ports || manifest.Ports)" :key="i"
                                        class="font-mono text-xs px-3 py-1.5 bg-[#232f3e] text-[#ff9900] font-bold">
                                        :{{ port }}
                                    </span>
                                </template>
                                <template v-else>
                                    <span v-for="(val, proto) in (manifest.ports || manifest.Ports)" :key="proto"
                                        class="font-mono text-xs px-3 py-1.5 bg-[#232f3e] text-[#ff9900] font-bold">
                                        {{ proto }}:{{ val }}
                                    </span>
                                </template>
                            </div>
                        </div>

                        <!-- Raw JSON — always shown so you can see exact field names returned -->
                        <div>
                            <p class="text-[10px] font-black text-[#879196] uppercase tracking-widest mb-3">Raw Manifest</p>
                            <pre class="bg-[#fafafa] border border-[#eaeded] p-4 text-xs font-mono text-[#545b64] overflow-auto max-h-96 whitespace-pre-wrap">{{ JSON.stringify(manifest, null, 2) }}</pre>
                        </div>

                    </div>
                </div>
            </template>
        </div>
    </div>
</template>