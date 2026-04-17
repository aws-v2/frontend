<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
    router.push('/compute')
}

// Mock recommendations data
const recommendations = ref([
    {
        id: 'rec-1',
        type: 'rightsizing',
        title: 'Right-size EC2 Instances',
        description: 'Instance i-0a1b2c3d is underutilized (avg 15% CPU). Downgrade to t2.medium to save.',
        potentialSavings: 120.00,
        resourceId: 'i-0a1b2c3d',
        severity: 'high',
        action: 'Resize'
    },
    {
        id: 'rec-2',
        type: 'idle',
        title: 'Delete Idle Resources',
        description: '3 stopped instances found that have been inactive for > 30 days.',
        potentialSavings: 75.50,
        resourceId: 'Multiple',
        severity: 'medium',
        action: 'Review'
    },
    {
        id: 'rec-3',
        type: 'storage',
        title: 'Unattached EBS Volumes',
        description: '5 EBS volumes are not attached to any instance.',
        potentialSavings: 45.00,
        resourceId: 'vol-multiple',
        severity: 'low',
        action: 'Delete'
    },
    {
        id: 'rec-4',
        type: 'reserved',
        title: 'Purchase Reserved Instances',
        description: 'You have reliable steady-state usage. Purchase RIs to save up to 40%.',
        potentialSavings: 300.00,
        resourceId: 'N/A',
        severity: 'high',
        action: 'Purchase'
    }
])

const dismissRecommendation = (id: string) => {
    recommendations.value = recommendations.value.filter(r => r.id !== id)
}
</script>

<template>
  <div class="min-h-screen bg-[#05080F] text-slate-200 pb-32 font-sans relative overflow-hidden">
    <!-- Ambient background effects -->
    <div class="absolute inset-0 pointer-events-none opacity-20">
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
    </div>

    <div class="relative z-10 p-12 px-8 md:px-20 space-y-10 pt-16">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <a href="#" @click.prevent="router.push('/dashboard')" class="text-slate-500 hover:text-blue-400 transition-colors">AWS</a>
            <span class="text-slate-700">/</span>
            <a href="#" @click.prevent="goBack" class="text-slate-500 hover:text-blue-400 transition-colors">Compute</a>
            <span class="text-slate-700">/</span>
            <span class="text-slate-400">Optimization</span>
          </nav>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-white tracking-tight">Cost Optimization</h1>
              <p class="text-xs text-slate-500 font-medium mt-1">Actionable recommendations to reduce your AWS bill</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Savings Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl bg-gradient-to-br from-emerald-500/10 to-transparent">
          <div class="flex items-center justify-between mb-4">
            <span class="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Total Potential Savings</span>
            <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-4xl font-bold text-white mb-1"><span class="text-emerald-400">$</span>{{ recommendations.reduce((acc, r) => acc + r.potentialSavings, 0).toFixed(2) }}<span class="text-base font-medium text-slate-400">/mo</span></div>
          <p class="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-2">By applying all {{ recommendations.length }} recommendations</p>
        </div>
        
        <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl">
           <div class="flex items-center justify-between mb-4">
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Opportunities</span>
          </div>
          <div class="text-4xl font-bold text-white mb-1">{{ recommendations.length }}</div>
          <p class="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-2">Active recommendations</p>
        </div>

        <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl">
           <div class="flex items-center justify-between mb-4">
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Estimated Bill After</span>
          </div>
           <div class="text-4xl font-bold text-white mb-1">$239.30<span class="text-base font-medium text-slate-400">/mo</span></div>
           <p class="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-2">If all actions are taken</p>
        </div>
      </div>

      <!-- Recommendation Cards -->
      <div class="space-y-4">
         <h3 class="text-sm font-bold text-white uppercase tracking-widest mb-2">Recommended Actions</h3>
         
         <div v-for="rec in recommendations" :key="rec.id" 
              class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-6 hover:border-emerald-500/30 transition-all group">
            
            <!-- Icon -->
            <div :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0',
                rec.type === 'rightsizing' ? 'bg-blue-500/10 text-blue-400' : 
                rec.type === 'idle' ? 'bg-amber-500/10 text-amber-400' :
                rec.type === 'storage' ? 'bg-purple-500/10 text-purple-400' :
                'bg-emerald-500/10 text-emerald-400'
            ]">
                <span v-if="rec.type === 'rightsizing'">📉</span>
                <span v-else-if="rec.type === 'idle'">🛑</span>
                <span v-else-if="rec.type === 'storage'">💾</span>
                <span v-else>💰</span>
            </div>

            <!-- Content -->
            <div class="flex-1 text-center md:text-left">
                <div class="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                    <h4 class="text-lg font-bold text-white">{{ rec.title }}</h4>
                    <span :class="[
                        'text-[9px] font-black uppercase px-2 py-0.5 rounded-full border w-fit mx-auto md:mx-0',
                        rec.severity === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                        rec.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    ]">{{ rec.severity }} Priority</span>
                </div>
                <p class="text-sm text-slate-400">{{ rec.description }}</p>
            </div>

            <!-- Savings -->
            <div class="text-center md:text-right shrink-0">
                <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Potential Savings</div>
                <div class="text-2xl font-bold text-emerald-400">${{ rec.potentialSavings.toFixed(2) }}<span class="text-xs text-slate-500 font-medium">/mo</span></div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 shrink-0">
                <button @click="dismissRecommendation(rec.id)" 
                    class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold transition-colors">
                    Dismiss
                </button>
                <button class="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all">
                    {{ rec.action }}
                </button>
            </div>
         </div>

         <div v-if="recommendations.length === 0" class="glass-panel p-12 rounded-2xl border border-white/10 text-center">
             <div class="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                 <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                 </svg>
             </div>
             <h3 class="text-xl font-bold text-white mb-2">All Optimized!</h3>
             <p class="text-slate-400">You have no active cost optimization recommendations at this time.</p>
         </div>
      </div>

    </div>

    <!-- Footer Actions (Sticky) -->
    <div class="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 flex items-center justify-end px-8 md:px-16 py-4 gap-4 z-50 backdrop-blur-xl">
      <button @click="goBack" 
        class="px-8 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all active:scale-95 shadow-lg">
        Go Back
      </button>
    </div>
  </div>
</template>

<style scoped>
.glass-panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
</style>
