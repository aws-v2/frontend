<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRdsStore } from '../store/rdsStore'

const router = useRouter()
const rdsStore = useRdsStore()

const volumeName = ref('')
const volumeSize = ref(20)
const isCreating = ref(false)

const handleCreate = async () => {
    if (!volumeName.value || !volumeSize.value) return
    isCreating.value = true
    try {
        await rdsStore.createRdsVolume({
            name: volumeName.value,
            sizeGb: volumeSize.value
        })
        router.push('/rds/volumes')
    } catch (e) {
        console.error('Failed to create volume:', e)
    } finally {
        isCreating.value = false
    }
}

const cancel = () => {
    router.back()
}
<template>
    <div class="min-h-screen bg-white text-[#16191f] font-urbanist selection:bg-amber-500/20 selection:text-amber-900" >
        <div class="relative pt-24 pb-40" >
            <!--Grid Background-- >
                <div
                class="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.06)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" >
    </div>

    < div class="relative z-10 max-w-7xl mx-auto px-6" >
        <div class="flex items-center gap-2 mb-8" >
            <h1 class="text-3xl font-black text-[#232f3e] uppercase tracking-tighter italic" > Create Storage Volume
                </h1>
                </div>

                < !--Volume Settings-- >
                    <div class="aws-card p-8 rounded-sm mb-8 border-4 border-[#232f3e] bg-white" >
                        <h3 class="text-sm font-black text-[#879196] uppercase tracking-[0.2em] mb-6" > Volume_Configuration </h3>

                            < div class="mb-8" >
                                <label class="aws-label flex items-center gap-2" >
                                    Volume name
                                        < span
class="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 border border-amber-200" > Required </span>
    </label>
    < p class="text-[11px] text-[#545b64] mb-3" > A descriptive name for your block storage unit.</p>
        < input v - model="volumeName" type = "text" class="aws-input font-mono" placeholder = "my-data-volume" />
            </div>

            < div class="mb-8" >
                <label class="aws-label flex items-center gap-2" >
                    Size(GiB)
                    < span
class="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 border border-amber-200" > Required </span>
    </label>
    < p class="text-[11px] text-[#545b64] mb-3" > Storage capacity.Min: 5, Max: 16384. </p>
        < div class="flex items-center gap-4" >
            <input v - model.number="volumeSize" type = "number" class="aws-input font-mono w-32" />
                <span class="text-xs font-black text-[#879196] uppercase tracking-widest" > GiB </span>
                    </div>
                    </div>
                    </div>

                    < !--Note -->
                        <div class="p-6 border-l-4 border-[#232f3e] bg-[#fafafa] mb-12" >
                            <div class="text-[10px] font-black text-[#232f3e] uppercase tracking-widest mb-1" > Deployment Note </div>
                                < p class="text-xs text-[#545b64] leading-relaxed font-medium" > Volumes are created as independent units
                        and can be attached to any compatible RDS instance in the same availability zone.</p>
    </div>
    </div>

    < !--Footer Actions-- >
        <div
                class="fixed bottom-0 left-0 right-0 h-16 bg-white border-t-4 border-[#232f3e] flex items-center justify-end px-12 gap-6 z-50" >
    <button @click="cancel"
class="text-[10px] font-black text-[#879196] hover:text-[#232f3e] uppercase tracking-widest transition-colors" > Cancel </button>
    < button @click="handleCreate" : disabled = "isCreating || !volumeName || !volumeSize"
class="px-10 py-4 bg-[#232f3e] text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-[6px_6px_0px_#ff9900] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed" >
    {{ isCreating ? 'Allocating Storage...' : 'Create Volume' }}
</button>
    </div>
    </div>
    </div>
    </template>

    < style scoped >
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&display=swap');

.font - urbanist {
    font - family: 'Urbanist', sans - serif;
}
</style>

