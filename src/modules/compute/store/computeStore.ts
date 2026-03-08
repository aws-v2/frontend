import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/shared/api/apiClient'
import type { Vpc } from '@/shared/types/vpc'

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
    [key: string]: any
}

export interface Rule {
    id: string
    type: 'inbound' | 'outbound'
    protocol: string
    from_port: number
    to_port: number
    source_dest_cidr: string
    description: string
}

export interface SecurityGroup {
    id: number
    name: string
    description: string
    rules: Rule[]
}

export interface FleetStats {
    totalInstances: number
    activeInstances: number
    avgCpuLoad: number
    avgRamUsage: number
    activeFunctions: number
    clusterHealth: string
}

export interface FleetEvent {
    id: string
    timestamp: string
    type: 'info' | 'warn' | 'error' | 'success'
    message: string
    resource: string
}

export interface CreateInstancePayload {
    image: string
    cpu: number
    ram: number
    ssh_key: string
}

export interface Volume {
    id: string
    name: string
    size: number
    type: string
    state: string
    az: string
    device?: string
    instance_id?: string
    created_at: string
}

export interface Snapshot {
    id: string
    name: string
    volume_id: string | null
    instance_id: string | null
    size: number
    state: string
    created_at: string
}

export interface Template {
    id: string
    name: string
    description: string
    image: string
    cpu: number
    ram: number
    created_at: string
}

export interface SSHKey {
    id: string
    name: string
    fingerprint: string
    created_at: string
}

export interface StatusCheck {
    id: string
    name: string
    status: 'passed' | 'failed' | 'pending' | 'warning'
    details: string
    updated_at: string
}

export interface InstanceMetrics {
    cpu_usage: number
    ram_usage_mb: number
    ram_total_mb: number
    network_in_kbps: number
    network_out_kbps: number
    disk_read_iops: number
    disk_write_iops: number
    uptime_seconds: number
    updated_at: string
}

export interface Tag {
    key: string
    value: string
}

export const useComputeStore = defineStore('compute', () => {
    const instances = ref<Instance[]>([])
    const currentInstance = ref<Instance | null>(null)
    const isLoading = ref(false)
    const fleetStats = ref<FleetStats>({
        totalInstances: 0,
        activeInstances: 0,
        avgCpuLoad: 0,
        avgRamUsage: 0,
        activeFunctions: 0,
        clusterHealth: 'Unknown'
    })
    const recentEvents = ref<FleetEvent[]>([])
    const currentSecurityGroup = ref<SecurityGroup | null>(null)
    const instanceSecurityGroups = ref<SecurityGroup[]>([])

    // New Resource Refs
    const volumes = ref<Volume[]>([])
    const snapshots = ref<Snapshot[]>([])
    const templates = ref<Template[]>([])
    const sshKeys = ref<SSHKey[]>([])
    const instanceStatusChecks = ref<StatusCheck[]>([])
    const currentInstanceMetrics = ref<InstanceMetrics | null>(null)
    const instanceTags = ref<Tag[]>([])
    const volumeTags = ref<Tag[]>([])
    const volumeSnapshots = ref<Snapshot[]>([])
    const currentVolume = ref<Volume | null>(null)
    const vpcs = ref<Vpc[]>([])
    const currentTemplate = ref<Template | null>(null)

    const fetchInstances = async () => {
        isLoading.value = true
        try {
            const response = await apiClient.get<{ data: any[] }>('/ec2/instances')
            const rawData = response.data?.data || []
            instances.value = rawData.map(inst => {
                const rawState = (inst.status || inst.state || '').toLowerCase()
                const normalizedState = rawState === 'running' ? 'Running' :
                    rawState === 'stopped' ? 'Stopped' :
                        inst.status || inst.state || 'Unknown'

                return {
                    id: inst.id,
                    name: inst.vm_name || inst.name,
                    state: normalizedState,
                    type: inst.type || 't2.micro',
                    publicIp: inst.public_ip || inst.ip || inst.publicIp || '',
                    statusCheck: inst.statusCheck || '2/2 checks passed',
                    alarm: inst.alarm || 'None',
                    az: inst.az || 'us-east-1a',
                    image: inst.image,
                    cpu: inst.cpu,
                    ram: inst.ram,
                    ssh_key: inst.ssh_key,
                    vpc_id: inst.vpc_id,
                    subnet_id: inst.subnet_id,
                    privateIp: inst.private_ip
                }
            })
        } catch (error) {
            console.error('Failed to fetch instances:', error)
        } finally {
            isLoading.value = false
        }
    }

    // --- Volume Actions ---
    const fetchVolumes = async () => {
        try {
            const response = await apiClient.get<{ data: any[] }>('/ec2/volumes')
            const rawData = response.data?.data || []
            volumes.value = rawData.map(v => ({
                id: String(v.id),
                name: v.name || v.volume_name || 'Unnamed',
                size: v.size,
                type: v.type,
                state: v.status || v.state,
                az: v.availability_zone || v.az,
                device: v.device_path || v.device,
                instance_id: v.attached_to || v.instance_id,
                created_at: v.created_at
            }))
        } catch (error) {
            console.error('Failed to fetch volumes:', error)
        }
    }
    const fetchVolume = async (id: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.get<{ data: any }>(`/ec2/volumes/${id}`)
            const v = response.data?.data || response.data
            if (v) {
                currentVolume.value = {
                    id: String(v.id),
                    name: v.name || v.volume_name || 'Unnamed',
                    size: v.size,
                    type: v.type,
                    state: v.status || v.state,
                    az: v.availability_zone || v.az,
                    device: v.device_path || v.device,
                    instance_id: v.attached_to || v.instance_id,
                    created_at: v.created_at
                }
            }
        } catch (error) {
            console.error(`Failed to fetch volume ${id}:`, error)
            currentVolume.value = null
        } finally {
            isLoading.value = false
        }
    }

    const createVolume = async (payload: any) => {
        await apiClient.post('/ec2/volumes', payload)
        await fetchVolumes()
    }

    const deleteVolume = async (id: string) => {
        await apiClient.delete(`/ec2/volumes/${id}`)
        await fetchVolumes()
    }

    const attachVolume = async (volumeId: string, instanceId: string) => {
        await apiClient.post(`/ec2/volumes/${volumeId}/attach`, { instance_id: instanceId })
        await fetchVolumes()
        await fetchInstances() // Refresh instance state to see attached volume
    }

    const detachVolume = async (volumeId: string) => {
        await apiClient.post(`/ec2/volumes/${volumeId}/detach`)
        await fetchVolumes()
        await fetchInstances()
    }

    const expandVolume = async (volumeId: string, newSize: number) => {
        await apiClient.post(`/ec2/volumes/${volumeId}/expand`, { new_size: newSize })
        await fetchVolumes()
    }

    const reserveVolume = async (id: string) => {
        await apiClient.post(`/ec2/volumes/${id}/reserve`)
        await fetchVolume(id)
    }

    const fetchVolumeSnapshots = async (volumeId: string) => {
        try {
            const response = await apiClient.get<{ data: any[] }>(`/ec2/volumes/${volumeId}/snapshots`)
            const rawData = response.data?.data || []
            volumeSnapshots.value = rawData.map(s => ({
                id: String(s.id),
                name: s.name || s.snapshot_id,
                volume_id: String(s.volume_id),
                instance_id: s.instance_id ? String(s.instance_id) : null,
                size: s.size,
                state: s.status || s.state,
                created_at: s.created_at
            }))
            // Also update the global snapshots list if needed
            // snapshots.value = [...snapshots.value.filter(sn => sn.volume_id !== volumeId), ...volumeSnapshots.value]
        } catch (error) {
            console.error(`Failed to fetch snapshots for volume ${volumeId}:`, error)
        }
    }

    const createVolumeSnapshot = async (volumeId: string, payload: { name: string, description: string }) => {
        await apiClient.post(`/ec2/volumes/${volumeId}/snapshots`, payload)
        await fetchVolumeSnapshots(volumeId)
    }

    // --- Snapshot Actions ---
    const fetchSnapshots = async () => {
        try {
            const response = await apiClient.get<{ data: any[] }>('/ec2/snapshots')
            const rawData = response.data?.data || []
            snapshots.value = rawData.map(s => ({
                id: String(s.id),
                name: s.name || s.snapshot_id,
                volume_id: s.volume_id ? String(s.volume_id) : null,
                instance_id: s.instance_id ? String(s.instance_id) : null,
                size: s.size,
                state: s.status || s.state,
                created_at: s.created_at
            }))
        } catch (error) {
            console.error('Failed to fetch snapshots:', error)
        }
    }

    const createSnapshot = async (instanceId: string, payload: any) => {
        await apiClient.post(`/ec2/instances/${instanceId}/snapshot`, payload)
        await fetchSnapshots()
    }

    const deleteSnapshot = async (id: string) => {
        await apiClient.delete(`/ec2/snapshots/${id}`)
        await fetchSnapshots()
    }

    const deleteVolumeSnapshot = async (snapshotId: string) => {
        await apiClient.delete(`/ec2/volumes/${snapshotId}/snapshot`)
        await fetchSnapshots()
    }

    // --- Template Actions ---
    const fetchTemplates = async () => {
        try {
            const response = await apiClient.get<{ data: Template[] }>('/ec2/templates')
            templates.value = response.data?.data || []
        } catch (error) {
            console.error('Failed to fetch templates:', error)
        }
    }

    const createTemplate = async (payload: any) => {
        await apiClient.post('/ec2/templates', payload)
        await fetchTemplates()
    }

    const deleteTemplate = async (id: string) => {
        await apiClient.delete(`/ec2/templates/${id}`)
        await fetchTemplates()
    }

    const fetchTemplate = async (id: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.get<{ data: Template }>(`/ec2/templates/${id}`)
            currentTemplate.value = response.data?.data || null
        } catch (error) {
            console.error(`Failed to fetch template ${id}:`, error)
            currentTemplate.value = null
        } finally {
            isLoading.value = false
        }
    }

    // --- SSH Key Actions ---
    const fetchSSHKeys = async () => {
        try {
            const response = await apiClient.get<{ data: any[] }>('/ec2/ssh-keys')
            const rawData = response.data?.data || []
            sshKeys.value = rawData.map(k => ({
                id: String(k.id),
                name: k.name,
                fingerprint: k.fingerprint,
                created_at: k.created_at
            }))
        } catch (error) {
            console.error('Failed to fetch SSH keys:', error)
        }
    }

    const createSSHKey = async (payload: any) => {
        await apiClient.post('/ec2/ssh-keys', payload)
        await fetchSSHKeys()
    }

    const deleteSSHKey = async (id: string) => {
        await apiClient.delete(`/ec2/ssh-keys/${id}`)
        await fetchSSHKeys()
    }

    const downloadSSHKey = async (name: string) => {
        try {
            const response = await apiClient.get(`/ec2/ssh-keys/${name}/download`, {
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `${name}.pem`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to download SSH key:', error)
            throw error
        }
    }

    const fetchInstance = async (id: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.get<{ data: any }>(`/ec2/instances/${id}`)
            const inst = response.data?.data || response.data
            if (inst) {
                const rawState = (inst.status || inst.state || '').toLowerCase()
                const normalizedState = rawState === 'running' ? 'Running' :
                    rawState === 'stopped' ? 'Stopped' :
                        inst.status || inst.state || 'Unknown'

                currentInstance.value = {
                    ...inst,
                    id: inst.id,
                    name: inst.vm_name || inst.name,
                    state: normalizedState,
                    type: inst.type || 't2.micro',
                    publicIp: inst.public_ip || inst.ip || inst.publicIp || '',
                    statusCheck: inst.statusCheck || '2/2 checks passed',
                    alarm: inst.alarm || 'None',
                    az: inst.az || 'us-east-1a',
                    image: inst.image,
                    cpu: inst.cpu,
                    ram: inst.ram,
                    ssh_key: inst.ssh_key,
                    vpc_id: inst.vpc_id,
                    subnet_id: inst.subnet_id,
                    privateIp: inst.private_ip
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

    const fetchFleetOverview = async () => {
        try {
            const response = await apiClient.get<{ data: FleetStats }>('/compute/fleet/overview')
            if (response.data?.data) {
                fleetStats.value = response.data.data
            }
        } catch (error) {
            console.error('Failed to fetch fleet overview:', error)
        }
    }

    const fetchRecentEvents = async () => {
        try {
            const response = await apiClient.get<{ data: FleetEvent[] }>('/compute/fleet/events')
            if (response.data?.data) {
                recentEvents.value = response.data.data
            }
        } catch (error) {
            console.error('Failed to fetch recent events:', error)
        }
    }

    const fetchSecurityGroup = async (id: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.get<{ data: SecurityGroup }>(`/ec2/security-groups/${id}`)
            currentSecurityGroup.value = response.data?.data || null
        } catch (error) {
            console.error(`Failed to fetch security group ${id}:`, error)
        } finally {
            isLoading.value = false
        }
    }

    const addRule = async (sgId: string, rule: Partial<Rule>) => {
        try {
            await apiClient.post(`/ec2/security-groups/${sgId}/rules`, rule)
            await fetchSecurityGroup(sgId)
        } catch (error) {
            console.error(`Failed to add rule to security group ${sgId}:`, error)
            throw error
        }
    }

    const deleteRule = async (sgId: string, ruleId: string) => {
        try {
            await apiClient.delete(`/ec2/security-groups/${sgId}/rules/${ruleId}`)
            await fetchSecurityGroup(sgId)
        } catch (error) {
            console.error(`Failed to delete rule ${ruleId} from security group ${sgId}:`, error)
            throw error
        }
    }

    const fetchInstanceSecurityGroups = async (instanceId: string) => {
        try {
            const response = await apiClient.get<any>(`/ec2/instances/${instanceId}/security-groups`)
            const data = response.data?.data || response.data
            instanceSecurityGroups.value = Array.isArray(data) ? data : []
            console.log(`Fetched security groups for instance ${instanceId}:`, instanceSecurityGroups.value)
        } catch (error) {
            console.error(`Failed to fetch security groups for instance ${instanceId}:`, error)
        }
    }

    const assignSecurityGroup = async (instanceId: string, security_group_id: number) => {
        try {
            await apiClient.post(`/ec2/instances/${instanceId}/security-groups`, { security_group_id })
            await fetchInstanceSecurityGroups(instanceId)
        } catch (error) {
            console.error(`Failed to assign security group to instance ${instanceId}:`, error)
            throw error
        }
    }

    const unassignSecurityGroup = async (instanceId: string, sgId: number) => {
        try {
            await apiClient.delete(`/ec2/instances/${instanceId}/security-groups/${sgId}`)
            await fetchInstanceSecurityGroups(instanceId)
        } catch (error) {
            console.error(`Failed to unassign security group from instance ${instanceId}:`, error)
            throw error
        }
    }

    const fetchInstanceStatusChecks = async (instanceId: string) => {
        try {
            const response = await apiClient.get<{ data: StatusCheck[] }>(`/ec2/instances/${instanceId}/status-checks`)
            instanceStatusChecks.value = response.data?.data || []
        } catch (error) {
            console.error(`Failed to fetch status checks for instance ${instanceId}:`, error)
            // Fallback for placeholder when backend is not ready
            instanceStatusChecks.value = [
                { id: 'system_check', name: 'System Status Check', status: 'pending', details: 'Awaiting backend signal...', updated_at: new Date().toISOString() },
                { id: 'instance_check', name: 'Instance Status Check', status: 'pending', details: 'Awaiting backend signal...', updated_at: new Date().toISOString() }
            ]
        }
    }

    const fetchInstanceMetrics = async (instanceId: string) => {
        try {
            const response = await apiClient.get<{ data: InstanceMetrics }>(`/ec2/instances/${instanceId}/metrics`)
            currentInstanceMetrics.value = response.data?.data || null
        } catch (error) {
            console.error(`Failed to fetch metrics for instance ${instanceId}:`, error)
            // Fallback for visual demonstration
            currentInstanceMetrics.value = {
                cpu_usage: 0,
                ram_usage_mb: 0,
                ram_total_mb: 2048,
                network_in_kbps: 0,
                network_out_kbps: 0,
                disk_read_iops: 0,
                disk_write_iops: 0,
                uptime_seconds: 0,
                updated_at: new Date().toISOString()
            }
        }
    }

    const fetchInstanceTags = async (instanceId: string) => {
        try {
            const response = await apiClient.get<{ data: Tag[] }>(`/ec2/instances/${instanceId}/tags`)
            instanceTags.value = response.data?.data || []
        } catch (error) {
            console.error(`Failed to fetch tags for instance ${instanceId}:`, error)
            instanceTags.value = []
        }
    }

    const addInstanceTag = async (instanceId: string, tag: Tag) => {
        try {
            await apiClient.post(`/ec2/instances/${instanceId}/tags`, tag)
            await fetchInstanceTags(instanceId)
        } catch (error) {
            console.error(`Failed to add tag to instance ${instanceId}:`, error)
            throw error
        }
    }

    const deleteInstanceTag = async (instanceId: string, key: string) => {
        try {
            await apiClient.delete(`/ec2/instances/${instanceId}/tags/${key}`)
            await fetchInstanceTags(instanceId)
        } catch (error) {
            console.error(`Failed to delete tag ${key} from instance ${instanceId}:`, error)
            throw error
        }
    }

    const fetchVolumeTags = async (volumeId: string) => {
        try {
            const response = await apiClient.get<{ data: Tag[] }>(`/ec2/volumes/${volumeId}/tags`)
            volumeTags.value = response.data?.data || []
        } catch (error) {
            console.error(`Failed to fetch tags for volume ${volumeId}:`, error)
            volumeTags.value = []
        }
    }

    const addVolumeTag = async (volumeId: string, tag: Tag) => {
        try {
            await apiClient.post(`/ec2/volumes/${volumeId}/tags`, tag)
            await fetchVolumeTags(volumeId)
        } catch (error) {
            console.error(`Failed to add tag to volume ${volumeId}:`, error)
            throw error
        }
    }

    const deleteVolumeTag = async (volumeId: string, key: string) => {
        try {
            await apiClient.delete(`/ec2/volumes/${volumeId}/tags/${key}`)
            await fetchVolumeTags(volumeId)
        } catch (error) {
            console.error(`Failed to delete tag ${key} from volume ${volumeId}:`, error)
            throw error
        }
    }

    const fetchVpcs = async () => {
        isLoading.value = true
        try {
            const response = await apiClient.get<any>('/ec2/vpcs')
            const raw = Array.isArray(response.data)
                ? response.data
                : response.data?.data || response.data?.vpcs || []
            vpcs.value = raw
        } catch (e: any) {
            console.error('Compute fetchVpcs error:', e)
        } finally {
            isLoading.value = false
        }
    }

    const changeInstanceVpc = async (instanceId: string, vpcId: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.put(`/compute/instances/${instanceId}/vpc`, { vpc_id: vpcId })
            await fetchInstance(instanceId)
            return response.data
        } catch (e) {
            console.error('Compute changeInstanceVpc error:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const createVpc = async (name: string) => {
        isLoading.value = true
        try {
            const response = await apiClient.post('/ec2/vpcs', { name })
            await fetchVpcs()
            return response.data?.data || response.data
        } catch (e) {
            console.error('Compute createVpc error:', e)
            throw e
        } finally {
            isLoading.value = false
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
        deleteInstance,
        fleetStats,
        recentEvents,
        fetchFleetOverview,
        fetchRecentEvents,
        currentSecurityGroup,
        instanceSecurityGroups,
        fetchSecurityGroup,
        addRule,
        deleteRule,
        fetchInstanceSecurityGroups,
        assignSecurityGroup,
        unassignSecurityGroup,
        // New Exports
        volumes,
        snapshots,
        templates,
        sshKeys,
        fetchVolumes,
        createVolume,
        deleteVolume,
        fetchSnapshots,
        createSnapshot,
        deleteSnapshot,
        deleteVolumeSnapshot,
        fetchTemplates,
        createTemplate,
        deleteTemplate,
        fetchSSHKeys,
        createSSHKey,
        deleteSSHKey,
        downloadSSHKey,
        attachVolume,
        detachVolume,
        expandVolume,
        instanceStatusChecks,
        fetchInstanceStatusChecks,
        currentInstanceMetrics,
        fetchInstanceMetrics,
        addInstanceTag,
        deleteInstanceTag,
        instanceTags,
        fetchInstanceTags,
        volumeTags,
        fetchVolumeTags,
        addVolumeTag,
        deleteVolumeTag,
        volumeSnapshots,
        currentVolume,
        fetchVolume,
        reserveVolume,
        createVolumeSnapshot,
        fetchVolumeSnapshots,
        currentTemplate,
        fetchTemplate,
        vpcs,
        fetchVpcs,
        changeInstanceVpc,
        createVpc
    }
})
