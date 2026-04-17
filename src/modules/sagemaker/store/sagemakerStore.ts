import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface MLJob {
    id: string
    name: string
    status: 'Initializing' | 'Training' | 'Completed' | 'Failed' | 'Canceled'
    duration: string
    instance: string
    inputPath: string
    outputPath: string
    createdAt: string
}

export const useSageMakerStore = defineStore('sagemaker', () => {
    const trainingJobs = ref<MLJob[]>([
        { 
            id: 'job-algo-xy1', 
            name: 'gpt-4-finetune-v1', 
            status: 'Completed', 
            duration: '5h 12m', 
            instance: 'ml.p4d.24xlarge',
            inputPath: 's3://serwin-ai-datasets/gpt-4/v1/training_data/',
            outputPath: 's3://serwin-ai-models/gpt-4/v1/checkpoints/',
            createdAt: '2026-04-16T14:32:00Z'
        },
        { 
            id: 'job-algo-xy2', 
            name: 'customer-churn-xgb', 
            status: 'Training', 
            duration: '42m', 
            instance: 'ml.m5.xlarge',
            inputPath: 's3://analytics-datasets/churn-analysis/2026-q1/',
            outputPath: 's3://analytics-models/xgb-churn/v1/',
            createdAt: '2026-04-17T08:15:00Z'
        },
        { 
            id: 'job-algo-xy3', 
            name: 'stable-diff-lora', 
            status: 'Failed', 
            duration: '12m', 
            instance: 'ml.g5.2xlarge',
            inputPath: 's3://serwin-ai-datasets/sd-lora/images/',
            outputPath: 's3://serwin-ai-models/sd-lora/checkpoints/',
            createdAt: '2026-04-17T11:45:00Z'
        }
    ])

    const createTrainingJob = async (jobData: any) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                trainingJobs.value.unshift({
                    id: `job-${Math.random().toString(36).substr(2, 9)}`,
                    name: jobData.name,
                    status: 'Initializing',
                    duration: '0m',
                    instance: jobData.instanceType,
                    inputPath: jobData.inputData,
                    outputPath: jobData.outputData,
                    createdAt: new Date().toISOString()
                })
                
                // Simulate status change after a few seconds
                const newJob = trainingJobs.value[0]
                setTimeout(() => {
                    if (newJob && newJob.status === 'Initializing') {
                        newJob.status = 'Training'
                    }
                }, 3000)

                resolve(true)
            }, 1000)
        })
    }

    const cancelTrainingJob = async (id: string) => {
        const job = trainingJobs.value.find(j => j.id === id)
        if (job && (job.status === 'Training' || job.status === 'Initializing')) {
            job.status = 'Canceled'
        }
    }

    const deleteTrainingJob = async (id: string) => {
        trainingJobs.value = trainingJobs.value.filter(j => j.id !== id)
    }

    return {
        trainingJobs,
        createTrainingJob,
        cancelTrainingJob,
        deleteTrainingJob
    }
})
