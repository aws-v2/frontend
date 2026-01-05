<script setup lang="ts">
import { useToastStore } from '@/shared/store/toastStore'

const toastStore = useToastStore()

const triggerAction = (action: string) => {
    toastStore.addToast(`${action} action triggered.`, 'success')
}
</script>

<template>
    <div class="p-8 max-w-7xl mx-auto space-y-12">
        <!-- Verification Alert Banner -->
        <div class="banner-retro" style="background-color: var(--accent-warning); color: black;">
            <div class="w-6 h-6 bg-black flex items-center justify-center text-white font-black">!</div>
            <div class="flex-1">
                SECURITY ALERT: Please verify your email to ensure full account protection.
            </div>
            <router-link to="/auth/reset-password"
                class="underline decoration-2 underline-offset-4 hover:bg-black hover:text-white px-2 py-1">
                VERIFY NOW
            </router-link>
        </div>

        <div class="flex justify-between items-end border-b-4 border-black pb-8">
            <div class="space-y-2">
                <h1 class="text-6xl font-black uppercase">Dashboard</h1>
                <p class="font-mono text-sm opacity-60">active_session: root@serwin-console</p>
            </div>
            <div class="flex gap-4">
                <button @click="triggerAction('Deploy')" class="btn-retro-primary !py-2 !px-6">New Instance</button>
            </div>
        </div>

        <div class="grid md:grid-cols-4 gap-6">
            <div v-for="stat in [
                { label: 'Instances', val: '12', trend: '+2' },
                { label: 'CPU Usage', val: '42%', trend: '-5%' },
                { label: 'Network', val: '1.2 GB/s', trend: '+18%' },
                { label: 'Uptime', val: '99.9%', trend: 'stable' }
            ]" :key="stat.label" class="retro-box p-6 bg-white group hover:invert transition-all duration-300">
                <p class="label-retro">{{ stat.label }}</p>
                <div class="flex justify-between items-end">
                    <span class="text-4xl font-black">{{ stat.val }}</span>
                    <span class="font-mono text-xs opacity-60 font-bold tracking-widest">{{ stat.trend }}</span>
                </div>
            </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 retro-box p-8 bg-white">
                <div class="flex justify-between items-center mb-10">
                    <h2 class="text-4xl font-black underline decoration-4 underline-offset-8">Recent Instances</h2>
                    <button
                        class="font-mono text-xs font-bold border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">REFRESH_LIST</button>
                </div>

                <div class="space-y-4">
                    <div v-for="i in 5" :key="i"
                        class="border-2 border-black p-4 flex justify-between items-center hover:bg-gray-50 group">
                        <div class="flex items-center gap-4">
                            <div class="w-4 h-4 bg-black group-hover:rotate-45 transition-transform"></div>
                            <div>
                                <p class="font-black text-lg uppercase">serwin-vm-{{ 1024 + i }}</p>
                                <p class="font-mono text-[10px] opacity-60">ZONE: US-EAST-1 | TYPE: compute.retro.large
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <span
                                class="font-mono text-xs font-bold px-2 py-1 bg-green-100 border border-black">RUNNING</span>
                            <button @click="triggerAction('Instance Management')"
                                class="text-xl font-bold opacity-30 hover:opacity-100">•••</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="space-y-8">
                <div class="retro-box p-8 bg-black text-white">
                    <h2 class="text-3xl font-black mb-6">Cloud Shell</h2>
                    <div class="font-mono text-xs space-y-2 opacity-80 leading-relaxed">
                        <p>> apt-get update</p>
                        <p>> fetching archives...</p>
                        <p>> serwin-os-latest v4.2.1 [OK]</p>
                        <p>> initializing terminal environment...</p>
                        <div class="flex items-center gap-2 pt-2">
                            <span class="text-green-400">root@serwin:~$</span>
                            <span class="w-3 h-5 bg-white animate-pulse"></span>
                        </div>
                    </div>
                </div>

                <div class="retro-box p-8 bg-white border-dashed border-gray-400">
                    <h3 class="font-black text-xl mb-4 uppercase italic">Quick Tip</h3>
                    <p class="text-sm font-medium leading-relaxed opacity-70 italic">
                        "Remember to always back up your retro-drives before deploying to the production grid. The 1990s
                        don't forgive data loss."
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
