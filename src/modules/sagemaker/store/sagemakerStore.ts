import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSageMakerStore = defineStore('sagemaker', () => {
    const trainingJobs = ref([
        { id: 'job-algo-xy1', name: 'gpt-4-finetune-v1', status: 'Completed', duration: '5h 12m', instance: 'ml.p4d.24xlarge' },
        { id: 'job-algo-xy2', name: 'customer-churn-xgb', status: 'Training', duration: '42m', instance: 'ml.m5.xlarge' },
        { id: 'job-algo-xy3', name: 'stable-diff-lora', status: 'Failed', duration: '12m', instance: 'ml.g5.2xlarge' }
    ])

    const createTrainingJob = async (jobData: any) => {
        // Mock API call
        return new Promise((resolve) => {
            setTimeout(() => {
                trainingJobs.value.unshift({
                    id: `job-${Math.random().toString(36).substr(2, 9)}`,
                    name: jobData.name,
                    status: 'Initializing',
                    duration: '0m',
                    instance: jobData.instanceType
                })
                resolve(true)
            }, 1000)
        })
    }

    return {
        trainingJobs,
        createTrainingJob
    }
})
