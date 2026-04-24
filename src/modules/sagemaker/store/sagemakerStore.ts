import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/shared/api/apiClient'

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


export interface MLJob {
    id: string
    name: string
    // status: string
    duration: string
    instance: string
    inputPath: string
    outputPath: string
    createdAt: string
    progress?: number
}

export const useSageMakerStore = defineStore('sagemaker', () => {

    const trainingJobs = ref<MLJob[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    /**
     * FETCH ALL TRAINING JOBS
     */
    const fetchTrainingJobs = async () => {
        loading.value = true
        error.value = null

        try {
            const res = await apiClient.get('/llm/training/jobs')
            trainingJobs.value = res.data || []
        } catch (err: any) {
            console.error('Failed to fetch training jobs', err)
            error.value = 'Failed to load training jobs'
        } finally {
            loading.value = false
        }
    }

    /**
     * CREATE TRAINING JOB
     */
    const createTrainingJob = async (jobData: any) => {
        try {
            const res = await apiClient.post('/llm/training/jobs', jobData)

            // backend returns created job
            const job = res.data

            trainingJobs.value.unshift(job)

            return job
        } catch (err) {
            console.error('Failed to create training job', err)
            throw err
        }
    }

    /**
     * CANCEL TRAINING JOB
     */
    const cancelTrainingJob = async (id: string) => {
        try {
            await apiClient.post(`/training/jobs/${id}/cancel`)

            const job = trainingJobs.value.find(j => j.id === id)
            if (job) job.status = 'Canceled'

        } catch (err) {
            console.error('Failed to cancel job', err)
        }
    }

    /**
     * DELETE TRAINING JOB
     */
    const deleteTrainingJob = async (id: string) => {
        try {
            await apiClient.delete(`/training/jobs/${id}`)

            trainingJobs.value = trainingJobs.value.filter(j => j.id !== id)

        } catch (err) {
            console.error('Failed to delete job', err)
        }
    }

    return {
        trainingJobs,
        loading,
        error,
        fetchTrainingJobs,
        createTrainingJob,
        cancelTrainingJob,
        deleteTrainingJob
    }
})