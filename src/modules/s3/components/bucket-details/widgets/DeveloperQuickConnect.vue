<script setup lang="ts">
const snippets = [
    {
        lang: 'JS',
        langColor: 'text-orange-500',
        title: 'Node.js / React',
        code: "const s3 = new S3Client({ region: '..."
    },
    {
        lang: 'Dart',
        langColor: 'text-blue-500',
        title: 'Flutter',
        code: "final s3 = S3Client(region: 'eu-nor..."
    },
    {
        lang: 'PHP',
        langColor: 'text-red-500',
        title: 'Laravel',
        code: "'driver' => 's3', 'region' => 'eu..."
    }
]
</script>

<template>
    <div class="border border-[var(--aws-blue)] bg-blue-50/10 rounded-sm p-4">
        <h3 class="text-lg font-bold text-[var(--aws-blue)] mb-2">Developer Quick Connect</h3>
        <p class="text-xs text-gray-600 mb-4">Copy pre-configured code snippets to connect your application instantly.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="snippet in snippets" :key="snippet.lang"
                class="border border-gray-300 rounded-sm bg-white p-3 hover:shadow-md cursor-pointer transition-shadow">
                <div class="flex items-center gap-2 font-bold text-gray-800 text-sm mb-2">
                    <span class="font-mono" :class="snippet.langColor">{{ snippet.lang }}</span> {{ snippet.title }}
                </div>
                <div class="text-[10px] bg-gray-900 text-green-400 p-2 rounded-sm font-mono truncate">
                    {{ snippet.code }}
                </div>
            </div>
        </div>
    </div>
</template>
