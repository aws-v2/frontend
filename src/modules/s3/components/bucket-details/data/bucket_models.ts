export interface BucketInfo {
    bucket_id: string;
    bucket_name: string;
    arn: string;
    region: string;
    bucket_type: string;
    created_at: string;
    total_size: number;
    total_file_count: number;
    total_folder_count: number;
    current_utilization: number;
}

export interface FileNode {
    ID: string;
    BucketID: string;
    Key: string;
    Size: number;
    Version: string;
    MimeType: string;
    ContentType: string;
    StorageClass: string;
    SHA256: string;
    Metadata: any;
    CreatedAt: string;
    UpdatedAt: string;
}

export interface FolderNode {
    name: string;
    size: number;
    files: FileNode[] | null;
    folders: FolderNode[] | null;
}

export interface RootData {
    folders: FolderNode[];
    files: FileNode[];
}

export interface BucketListResponse {
    code: number;
    message: string;
    data: {
        bucket_info: BucketInfo;
        root: RootData;
    };
}
