export interface Database {
    id: string
    identifier: string
    status: 'creating' | 'available' | 'backing-up' | 'modifying' | 'deleting' | 'stopped'
    role: string
    engine: string
    regionAz: string
    size: string
    cpu?: string
    createdAt: string
    vpc: string
    multiAz: boolean
    recommendations?: number
}

export type EngineType =
    | 'Aurora (MySQL-SQL Compatible)'
    | 'Aurora (PostgreSQL Compatible)'
    | 'MySQL'
    | 'PostgreSQL'
    | 'MariaDB'
    | 'Oracle'
    | 'Microsoft SQL Server'
    | 'IBM Db2'

export type InstanceSize = 'Production' | 'Dev/Test'

export type CredentialManagement = 'aws-secrets-manager' | 'self-managed'
