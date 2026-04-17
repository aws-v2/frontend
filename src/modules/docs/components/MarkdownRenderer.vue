<template>
    <div class="markdown-container font-urbanist">
        <div v-for="(chunk, index) in chunks" :key="index">
            <!-- Standard Markdown Chunk -->
            <div v-if="chunk.type === 'html'" v-html="chunk.content" class="prose prose-slate max-w-none"></div>

            <!-- Mermaid Diagram -->
            <MermaidDiagram v-else-if="chunk.type === 'mermaid'" :content="chunk.content" />

            <!-- Fallback for unknown blocks -->
            <pre v-else class="bg-gray-50 p-4 border rounded-sm text-sm overflow-x-auto">{{ chunk.content }}</pre>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import MermaidDiagram from './MermaidDiagram.vue';
import { useDocsStore } from '../store/docsStore';

const props = defineProps<{
    content: string;
    service?: string; // Optional service override
}>();

const docsStore = useDocsStore();
const activeService = computed(() => props.service || docsStore.activeService || 's3');

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
});

// Custom logic to split markdown into renderable chunks
const chunks = computed(() => {
    if (!props.content) return [];

    const result: Array<{ type: 'html' | 'mermaid' | 'code', content: any }> = [];

    // Regex to find fenced code blocks
    const fenceRegex = /```(mermaid|[\w-]+)\n([\s\S]*?)```/g;

    let lastIndex = 0;
    let match;

    while ((match = fenceRegex.exec(props.content)) !== null) {
        const [fullMatch, lang, code] = match;
        const startIndex = match.index;

        // Add preceding text as HTML
        if (startIndex > lastIndex) {
            const text = props.content.substring(lastIndex, startIndex);
            result.push({
                type: 'html',
                content: md.render(resolveAssets(text))
            });
        }

        // Add specialized block
        if (lang === 'mermaid') {
            result.push({ type: 'mermaid', content: (code || '').trim() });
        } else {
            // Standard code block - render it normally through markdown-it
            result.push({ type: 'html', content: md.render(fullMatch) });
        }

        lastIndex = fenceRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < props.content.length) {
        const text = props.content.substring(lastIndex);
        result.push({
            type: 'html',
            content: md.render(resolveAssets(text))
        });
    }

    return result;
});

// Helper to resolve asset paths in the markdown content
function resolveAssets(text: string): string {
    // Replace ![text](./assets/...)
    return text.replace(/(\!\[.*?\]\()(\.\/assets\/)(.*?\))/g, (match, p1, p2, p3) => {
        const filename = p3.replace(')', '');
        return `${p1}${docsStore.getAssetUrl(activeService.value, filename)})`;
    }).replace(/(<img.*?src=")(\.\/assets\/)(.*?".*?>)/g, (match, p1, p2, p3) => {
        const filename = p3.split('"')[0];
        return `${p1}${docsStore.getAssetUrl(activeService.value, filename)}"${p3.substring(p3.indexOf('"') + 1)}`;
    });
}
</script>

<style>
/* Urbanist Font Integration */
@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&display=swap');

.font-urbanist {
    font-family: 'Urbanist', sans-serif;
}

/* GitHub-style alerts */
.markdown-container .prose blockquote {
    @apply border-l-4 pl-4 py-1 my-4 bg-gray-50 border-gray-300 italic text-gray-700;
}

.markdown-container .prose blockquote p:first-child {
    @apply font-bold not-italic mb-1;
}

/* Alert variants */
.markdown-container .prose blockquote:has(strong:contains('!NOTE')) {
    @apply border-blue-500 bg-blue-50 text-blue-900;
}

.markdown-container .prose blockquote:has(strong:contains('!WARNING')) {
    @apply border-yellow-500 bg-yellow-50 text-yellow-900;
}

.markdown-container .prose blockquote:has(strong:contains('!IMPORTANT')) {
    @apply border-purple-500 bg-purple-50 text-purple-900;
}

/* General Typography adjustments for Serwin aesthetic */
.prose h1 {
    @apply text-3xl font-bold text-gray-900 mb-8 border-b pb-4;
}

.prose h2 {
    @apply text-2xl font-semibold text-gray-800 mt-10 mb-4;
}

.prose h3 {
    @apply text-xl font-medium text-gray-800 mt-8 mb-3;
}

.prose p {
    @apply text-gray-600 leading-relaxed mb-4;
}

.prose code {
    @apply bg-gray-100 px-1.5 py-0.5 rounded text-sm text-pink-600 font-mono;
}

.prose pre {
    @apply bg-gray-900 text-gray-100 p-6 rounded-sm my-6 overflow-x-auto;
}

.prose pre code {
    @apply bg-transparent p-0 text-inherit;
}

.prose ul {
    @apply list-disc pl-6 mb-4;
}

.prose ol {
    @apply list-decimal pl-6 mb-4;
}

.prose li {
    @apply mb-2;
}
</style>
