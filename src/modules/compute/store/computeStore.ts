import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/shared/api/apiClient'

export interface Instance {
    id: string
    name: string
    state: string
    type: string
    statusCheck: string
    alarm: string
    publicIp: string
    az: string
    image?: string
    cpu?: number
    ram?: number
    ssh_key?: string
}

export interface CreateInstancePayload {
    image: string
    cpu: number
    ram: number
    ssh_key: string
}

export const useComputeStore = defineStore('compute', () => {
    const instances = ref<Instance[]>([])
    const currentInstance = ref<Instance | null>(null)
    const isLoading = ref(false)

    const fetchInstances = async () => {
        isLoading.value = true
        try {
            const response = await apiClient.get<{ data: any[] }>('/ec2/instances')
            const rawData = response.data?.data || []
            instances.value = rawData.map(inst => ({
                id: inst.id,
                name: inst.vm_name || inst.name,
                state: inst.status || inst.state,
                type: inst.type || 't2.micro',
                publicIp: inst.public_ip || inst.ip || inst.publicIp || '',
                statusCheck: inst.statusCheck || '2/2 checks passed',
                alarm: inst.alarm || 'None',
                az: inst.az || 'us-east-1a',
                image: inst.image,
                cpu: inst.cpu,
                ram: inst.ram,
                ssh_key: inst.ssh_key
            }))
        } catch (error) {
            console.error('Failed to fetch instances:', error)
        } finally {
            isLoading.value = false
        }
    }

    const fetchInstance = async (id: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.get<{ data: any }>(`/ec2/instances/${id}`)
            const inst = response.data?.data || response.data
            if (inst) {
                currentInstance.value = {
                    id: inst.id,
                    name: inst.vm_name || inst.name,
                    state: inst.status || inst.state,
                    type: inst.type || 't2.micro',
                    publicIp: inst.public_ip || inst.ip || inst.publicIp || '',
                    statusCheck: inst.statusCheck || '2/2 checks passed',
                    alarm: inst.alarm || 'None',
                    az: inst.az || 'us-east-1a',
                    image: inst.image,
                    cpu: inst.cpu,
                    ram: inst.ram,
                    ssh_key: inst.ssh_key
                }
            }
        } catch (error) {
            console.error(`Failed to fetch instance ${id}:`, error)
            currentInstance.value = null
        } finally {
            isLoading.value = false
        }
    }

    const launchInstance = async (payload: CreateInstancePayload) => {
        isLoading.value = true
        try {
            await apiClient.post('/ec2/instances', payload)
            await fetchInstances() // Refresh list
        } catch (error) {
            console.error('Failed to launch instance:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const startInstance = async (id: string) => {
        try {
            await apiClient.post(`/ec2/instances/${id}/start`)
            await fetchInstances() // Refresh status
        } catch (error) {
            console.error(`Failed to start instance ${id}:`, error)
        }
    }

    const stopInstance = async (id: string) => {
        try {
            await apiClient.post(`/ec2/instances/${id}/stop`)
            await fetchInstances() // Refresh status
        } catch (error) {
            console.error(`Failed to stop instance ${id}:`, error)
        }
    }

    const restartInstance = async (id: string) => {
        try {
            await apiClient.post(`/ec2/instances/${id}/restart`)
            await fetchInstances() // Refresh status
        } catch (error) {
            console.error(`Failed to restart instance ${id}:`, error)
        }
    }

    const deleteInstance = async (id: string) => {
        try {
            await apiClient.delete(`/ec2/instances/${id}`)
            instances.value = instances.value.filter(i => i.id !== id)
        } catch (error) {
            console.error(`Failed to delete instance ${id}:`, error)
        }
    }

    return {
        instances,
        currentInstance,
        isLoading,
        fetchInstances,
        fetchInstance,
        launchInstance,
        startInstance,
        stopInstance,
        restartInstance,
        deleteInstance
    }
})
