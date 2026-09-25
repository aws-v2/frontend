export interface VolumeSnapshot {
    id: string
    name: string
    volume_id: string | null
    instance_id?: string | null
    description?: string
    size?: number
    status?: string
    created_at?: string
}

export interface InstanceSnapshot {
    id: string
    name: string
    instance_id: string | null
    volume_id?: string | null
    description?: string
    size?: number
    status?: string
    created_at?: string
}

export type VolumeSnapshotWithKind = VolumeSnapshot & { kind: 'volume' }
export type InstanceSnapshotWithKind = InstanceSnapshot & { kind: 'instance' }

export type Snapshot = VolumeSnapshotWithKind | InstanceSnapshotWithKind
export type Snapshot2 = Snapshot
