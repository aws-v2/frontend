<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
    router.push('/compute')
}

// Mock data for demonstration
const costOverview = {
    thisMonth: 779.80,
    lastMonth: 849.20,
    forecast: 812.50,
    ytd: 8234.10,
    trend: -8.2
}

const serviceCosts = [
    { name: 'EC2 Instances', cost: 650.20, percentage: 83.4, color: 'blue', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 01-2 2v4a2 2 0 012 2h14a2 2 0 012-2v-4a2 2 0 01-2-2' },
    { name: 'AWS Lambda', cost: 89.40, percentage: 11.5, color: 'indigo', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { name: 'EKS Clusters', cost: 40.20, percentage: 5.1, color: 'purple', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
]

const topResources = [
    { id: 'i-0a1b2c3d', name: 'prod-web-server-01', type: 't2.large', cost: 156.80, hours: 720 },
    { id: 'i-4e5f6g7h', name: 'prod-api-server-01', type: 't2.large', cost: 156.80, hours: 720 },
    { id: 'i-8i9j0k1l', name: 'prod-db-server-01', type: 't2.xlarge', cost: 313.60, hours: 720 },
    { id: 'lambda-api', name: 'api-gateway-handler', type: 'Lambda', cost: 45.20, hours: 0 },
    { id: 'i-2m3n4o5p', name: 'dev-test-server-01', type: 't2.medium', cost: 78.40, hours: 720 }
]

const billingHistory = [
    { month: 'February 2026', amount: 779.80, status: 'Current', date: '2026-02-11' },
    { month: 'January 2026', amount: 849.20, status: 'Paid', date: '2026-01-31' },
    { month: 'December 2025', amount: 892.50, status: 'Paid', date: '2025-12-31' },
    { month: 'November 2025', amount: 756.30, status: 'Paid', date: '2025-11-30' },
    { month: 'October 2025', amount: 823.40, status: 'Paid', date: '2025-10-31' }
]
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
            <span class="text-slate-400">Billing</span>
          </nav>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-white tracking-tight">Billing Dashboard</h1>
              <p class="text-xs text-slate-500 font-medium mt-1">Detailed cost analysis and billing history</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Cost Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl hover:border-emerald-500/30 transition-all group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">This Month</span>
            <span class="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{{ costOverview.trend }}%</span>
          </div>
          <div class="text-3xl font-bold text-white mb-1">${{ costOverview.thisMonth.toFixed(2) }}</div>
          <div class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Current Billing</div>
        </div>

        <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl hover:border-blue-500/30 transition-all group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Last Month</span>
          </div>
          <div class="text-3xl font-bold text-white mb-1">${{ costOverview.lastMonth.toFixed(2) }}</div>
          <div class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Previous Period</div>
        </div>

        <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl hover:border-purple-500/30 transition-all group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Forecast</span>
          </div>
          <div class="text-3xl font-bold text-white mb-1">${{ costOverview.forecast.toFixed(2) }}</div>
          <div class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">End of Month</div>
        </div>

        <div class="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl hover:border-amber-500/30 transition-all group">
          <div class="flex items-center justify-between mb-4">
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">YTD Total</span>
          </div>
          <div class="text-3xl font-bold text-white mb-1">${{ costOverview.ytd.toLocaleString() }}</div>
          <div class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Year to Date</div>
        </div>
      </div>

      <!-- Cost Trend Graph & Service Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Cost Trend Graph -->
        <div class="lg:col-span-2 glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-sm font-bold text-white uppercase tracking-widest">Cost Trend</h3>
              <p class="text-[10px] text-slate-500 mt-1 font-medium">Daily spending over the last 30 days</p>
            </div>
            <select class="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-blue-500/50 transition-all font-bold">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          <div class="h-48 flex items-end gap-1">
            <div v-for="n in 30" :key="n"
              class="flex-1 bg-gradient-to-t from-amber-600/20 to-amber-500/40 rounded-t-sm hover:from-amber-600/40 hover:to-amber-500/80 transition-all cursor-pointer group relative"
              :style="{ height: (Math.sin(n/3) * 25 + 50 + Math.random() * 20) + '%' }">
              <div class="absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-amber-600 text-[9px] font-bold text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                ${{ (Math.random() * 15 + 20).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Service Breakdown -->
        <div class="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
          <h3 class="text-sm font-bold text-white uppercase tracking-widest mb-6">Cost by Service</h3>
          <div class="space-y-4">
            <div v-for="service in serviceCosts" :key="service.name" 
              class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
              <div class="flex items-center gap-3">
                <div :class="`w-8 h-8 rounded-lg bg-${service.color}-500/10 flex items-center justify-center text-${service.color}-400`">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="service.icon" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-bold text-white">{{ service.name }}</div>
                  <div class="text-[9px] text-slate-500">{{ service.percentage }}%</div>
                </div>
              </div>
              <span :class="`text-sm font-bold text-${service.color}-400`">${{ service.cost.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top 5 Most Expensive Resources -->
      <div class="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div class="p-8 border-b border-white/10">
          <h3 class="text-sm font-bold text-white uppercase tracking-widest">Top 5 Most Expensive Resources</h3>
          <p class="text-[10px] text-slate-500 mt-1 font-medium">Resources with highest costs this month</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th class="p-6 border-r border-white/5">Resource ID</th>
                <th class="p-6 border-r border-white/5">Name</th>
                <th class="p-6 border-r border-white/5">Type</th>
                <th class="p-6 border-r border-white/5">Hours</th>
                <th class="p-6">Cost</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.05]">
              <tr v-for="resource in topResources" :key="resource.id" 
                  class="hover:bg-white/[0.02] transition-colors">
                <td class="p-6 border-r border-white/5">
                  <span class="text-xs font-bold text-blue-400 font-mono">{{ resource.id }}</span>
                </td>
                <td class="p-6 border-r border-white/5">
                  <span class="text-sm font-bold text-white">{{ resource.name }}</span>
                </td>
                <td class="p-6 border-r border-white/5 text-xs text-slate-400 font-medium">
                  {{ resource.type }}
                </td>
                <td class="p-6 border-r border-white/5 text-xs text-slate-400">
                  {{ resource.hours > 0 ? resource.hours + 'h' : 'N/A' }}
                </td>
                <td class="p-6">
                  <span class="text-sm font-bold text-amber-400">${{ resource.cost.toFixed(2) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Billing History -->
      <div class="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div class="p-8 border-b border-white/10">
          <h3 class="text-sm font-bold text-white uppercase tracking-widest">Billing History</h3>
          <p class="text-[10px] text-slate-500 mt-1 font-medium">Past invoices and payment records</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th class="p-6 border-r border-white/5">Period</th>
                <th class="p-6 border-r border-white/5">Amount</th>
                <th class="p-6 border-r border-white/5">Status</th>
                <th class="p-6">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.05]">
              <tr v-for="invoice in billingHistory" :key="invoice.month" 
                  class="hover:bg-white/[0.02] transition-colors">
                <td class="p-6 border-r border-white/5">
                  <span class="text-sm font-bold text-white">{{ invoice.month }}</span>
                </td>
                <td class="p-6 border-r border-white/5">
                  <span class="text-sm font-bold text-amber-400">${{ invoice.amount.toFixed(2) }}</span>
                </td>
                <td class="p-6 border-r border-white/5">
                  <span :class="[
                    'text-[10px] font-black uppercase px-2 py-0.5 rounded-full border',
                    invoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  ]">{{ invoice.status }}</span>
                </td>
                <td class="p-6">
                  <button class="text-blue-400 text-xs font-black uppercase tracking-widest hover:text-blue-300 transition-colors">
                    Download Invoice
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
