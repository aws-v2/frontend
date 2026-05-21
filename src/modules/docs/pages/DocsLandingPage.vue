<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PublicNavbar from '@/shared/components/PublicNavbar.vue'
import { useDocsStore } from '../store/docsStore'
import { BookOpen, ShieldCheck, Search, Database, Server, Cpu, Layers, BarChart3, Settings, Shield, ArrowRight } from 'lucide-vue-next'

const router = useRouter()
const docsStore = useDocsStore()
const searchQuery = ref('')

const isPrivileged = computed(() => docsStore.isPrivilegedUser)

// Flatten manifests into a format suitable for the landing page
const allDocs = computed(() => {
    const items: any[] = []
    
    Object.entries(docsStore.manifests).forEach(([serviceId, unified]) => {
        // Handle Internal
        if (unified.internal) {
            items.push({
                id: `${serviceId}-internal`,
                service: serviceId,
                title: `${unified.internal.service} (Internal)`,
                description: `Deep-dive technical specifications, internal architecture, and security protocols for ${unified.internal.service}.`,
                tag: 'TECHNICAL SPEC',
                status: 'active',
                isInternal: true,
                route: { name: 'docs-content', params: { service: serviceId } }
            })
        }
        
        // Handle Public
        if (unified.public) {
            items.push({
                id: `${serviceId}-public`,
                service: serviceId,
                title: unified.public.service,
                description: `General guides, API documentation, and quickstart tutorials for ${unified.public.service}.`,
                tag: 'DOCUMENTATION',
                status: 'active',
                isInternal: false,
                route: { name: 'docs-content', params: { service: serviceId } }
            })
        }
    })
    
    return items
})

const filteredInternalDocs = computed(() => {
    const internal = allDocs.value.filter(d => d.isInternal)
    if (!searchQuery.value) return internal
    const q = searchQuery.value.toLowerCase()
    return internal.filter(d => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q))
})

const filteredPublicDocs = computed(() => {
    const publicDocs = allDocs.value.filter(d => !d.isInternal)
    if (!searchQuery.value) return publicDocs
    const q = searchQuery.value.toLowerCase()
    return publicDocs.filter(d => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q))
})

const navigateToDoc = (doc: any) => {
    if (doc.status === 'active') {
        router.push(doc.route)
    }
}

onMounted(async () => {
    window.scrollTo(0, 0)
    if (Object.keys(docsStore.manifests).length === 0) {
        await docsStore.fetchAllManifests()
    }
})

const getIcon = (service: string) => {
    const icons: Record<string, any> = {
        gamelift: Server,
        fargate: Cpu,
        lambda: Layers,
        metrics: BarChart3,
        config: Settings,
        auth: Shield,
        database: Database
    }
    return icons[service.toLowerCase()] || BookOpen
}
</script>

<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-[#ff9900]/30 selection:text-[#16191f]">
        <PublicNavbar activeLink="docs" />

        <!-- Spacer for fixed navbar -->
        <div class="h-20"></div>

        <!-- Hero Section -->
        <section class="py-24 bg-[#fafafa] border-b border-[#eaeded]">
            <div class="max-w-7xl mx-auto px-6">
                <div class="max-w-3xl">
                    <div v-if="isPrivileged" class="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-[10px] font-black text-orange-600 uppercase tracking-widest">
                        <ShieldCheck :size="12" />
                        Admin Access Active
                    </div>
                    <h1 class="text-5xl md:text-7xl font-black text-[#232f3e] mb-8 tracking-tighter">Serwin Docs</h1>
                    <p class="text-xl text-[#545b64] mb-12 font-medium leading-relaxed">
                        Unified resource center for engineering and infrastructure management.
                    </p>
                    <div class="relative max-w-xl">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search class="h-5 w-5 text-[#879196]" />
                        </div>
                        <input v-model="searchQuery" type="text" placeholder="Search technical guides..."
                            class="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#232f3e] focus:outline-none focus:border-[#ff9900] text-lg font-bold placeholder-[#879196] transition-all" />
                    </div>
                </div>
            </div>
        </section>

        <!-- Main Content -->
        <main class="py-20 max-w-7xl mx-auto px-6">
            
            <!-- 1. Internal Documents (Admin Only) -->
            <div v-if="isPrivileged && filteredInternalDocs.length > 0" class="mb-24">
                <div class="flex items-center gap-4 mb-10">
                    <h2 class="text-3xl font-black text-[#232f3e] tracking-tighter uppercase italic">Internal Infrastructure</h2>
                    <div class="flex-1 h-px bg-orange-100"></div>
                </div>
                
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div v-for="doc in filteredInternalDocs" :key="doc.id" @click="navigateToDoc(doc)"
                        class="border-2 border-orange-100 p-10 transition-all flex flex-col items-start bg-gradient-to-br from-white to-orange-50/20 relative overflow-hidden cursor-pointer group hover:border-orange-500 hover:shadow-xl">
                        
                        <div class="absolute -right-4 -top-4 text-orange-100 opacity-20 group-hover:opacity-40 transition-opacity">
                            <component :is="getIcon(doc.service)" :size="120" />
                        </div>

                        <div class="text-[10px] font-black text-[#ff9900] uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ShieldCheck :size="12" />
                            {{ doc.tag }}
                        </div>
                        <h3 class="text-2xl font-black text-[#232f3e] mb-4 group-hover:text-orange-600">{{ doc.title }}</h3>
                        <p class="text-[#545b64] mb-10 leading-relaxed font-medium relative z-10">{{ doc.description }}</p>

                        <div class="mt-auto text-orange-600 font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all group-hover:translate-x-2">
                            Access Internal Spec
                            <ArrowRight :size="14" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. Public Documents -->
            <div>
                <div v-if="isPrivileged" class="flex items-center gap-4 mb-10">
                    <h2 class="text-2xl font-black text-[#879196] tracking-tighter uppercase italic">Public Documentation</h2>
                    <div class="flex-1 h-px bg-gray-100"></div>
                </div>

                <div v-if="filteredPublicDocs.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div v-for="doc in filteredPublicDocs" :key="doc.id" @click="navigateToDoc(doc)" :class="[
                        'border-2 p-10 transition-all flex flex-col items-start bg-white relative overflow-hidden',
                        doc.status === 'active' ? 'border-[#eaeded] hover:border-[#232f3e] cursor-pointer group' : 'border-[#eaeded]/50 opacity-60 cursor-not-allowed grayscale-[0.5]'
                    ]">

                        <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{{ doc.tag }}</div>
                        <h3 class="text-2xl font-black text-[#232f3e] mb-4">{{ doc.title }}</h3>
                        <p class="text-[#545b64] mb-10 leading-relaxed font-medium">{{ doc.description }}</p>

                        <div v-if="doc.status === 'active'"
                            class="mt-auto text-[#0073bb] font-bold uppercase tracking-widest text-sm group-hover:text-[#ff9900] transition-colors">
                            View Documentation
                        </div>
                    </div>
                </div>
                <div v-else-if="!isPrivileged || filteredPublicDocs.length === 0" class="py-20 text-center">
                    <div class="text-4xl font-black text-[#232f3e] mb-4">No documentation found</div>
                    <p class="text-[#545b64] font-medium">Please contact support if you believe this is an error.</p>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="bg-[#fafafa] py-12 border-t border-[#eaeded]">
            <div class="max-w-7xl mx-auto px-6 text-center">
                <p class="text-[#879196] font-bold text-xs uppercase tracking-widest">© 2026 Serwin Systems Inc.
                    Documentation Portal.</p>
            </div>
        </footer>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}

.font-black {
    font-weight: 900;
}
</style>
