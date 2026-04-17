<template>
    <div class="mermaid-diagram" ref="mermaidContainer">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import mermaid from 'mermaid';

const props = defineProps<{
    content: string;
}>();

const mermaidContainer = ref<HTMLElement | null>(null);

const renderDiagram = async () => {
    if (!mermaidContainer.value || !props.content) return;

    try {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'neutral',
            securityLevel: 'loose',
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, props.content);
        mermaidContainer.value.innerHTML = svg;
    } catch (error) {
        console.error('Mermaid rendering failed:', error);
        mermaidContainer.value.innerHTML = '<pre class="text-red-500 p-4">Failed to render diagram</pre>';
    }
};

onMounted(renderDiagram);
watch(() => props.content, renderDiagram);
</script>

<style scoped>
.mermaid-diagram {
    @apply my-6 flex justify-center bg-white p-6 border border-gray-100 rounded-sm;
}
</style>
