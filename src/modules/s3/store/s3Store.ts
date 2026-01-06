import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Bucket {
    name: string
    region: string
    creationDate: string
    access: 'Public' | 'Objects can be public' | 'Bucket and objects not public'
}

export const useS3Store = defineStore('s3', () => {
    const buckets = ref<Bucket[]>([])

    const addBucket = (bucket: Bucket) => {
        buckets.value.push(bucket)
    }

    return {
        buckets,
        addBucket
    }
})
