<script setup lang="ts">
import { ref } from 'vue'

const showModal = ref(false)
const activeSnippet = ref<any>(null)
const copied = ref(false)

const snippets = [
    {
        lang: 'Java',
        langColor: 'text-[#ff9900]',
        title: 'Java SDK',
        fullTitle: 'Connect using AWS SDK for Java (v2)',
        code: `import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.S3Object;

public class S3Example {
    public static void main(String[] args) {
        // Configure credentials
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
            "YOUR_ACCESS_KEY",
            "YOUR_SECRET_KEY"
        );

        // Create S3 client
        S3Client s3Client = S3Client.builder()
            .region(Region.US_EAST_1)
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .build();

        // List objects in bucket
        ListObjectsV2Request request = ListObjectsV2Request.builder()
            .bucket("YOUR_BUCKET_NAME")
            .build();

        ListObjectsV2Response response = s3Client.listObjectsV2(request);
        
        for (S3Object object : response.contents()) {
            System.out.println("Object key: " + object.key());
        }

        s3Client.close();
    }
}`
    }
]

const openSnippet = (snippet: any) => {
    activeSnippet.value = snippet
    showModal.value = true
    copied.value = false
}

const copyCode = () => {
    if (!activeSnippet.value) return
    navigator.clipboard.writeText(activeSnippet.value.code)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
    <div class="bg-white border-2 border-[#eaeded] shadow-sm overflow-hidden group p-8 relative">
        <div
            class="absolute -top-10 -right-10 w-32 h-32 bg-[#ff9900]/5 rounded-full blur-3xl transition-all group-hover:bg-[#ff9900]/10">
        </div>

        <div class="flex items-center gap-6 mb-8 relative z-10">
            <div
                class="w-14 h-14 bg-[#fafafa] border-2 border-[#eaeded] text-[#ff9900] flex items-center justify-center shadow-lg shadow-black/5 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            </div>
            <div>
                <h3 class="text-3xl font-black text-[#232f3e] tracking-tighter uppercase italic">Developer Quick Connect
                </h3>
                <p class="text-[10px] text-[#ff9900] font-black uppercase tracking-[0.2em] mt-0.5 italic">Rapid
                    Integration Snippets</p>
            </div>
        </div>

        <p class="text-[13px] text-[#545b64] mb-10 leading-relaxed font-bold uppercase tracking-tight italic">
            Select your preferred environment to get pre-configured code snippets for immediate bucket connectivity.
        </p>

        <div class="flex justify-center relative z-10">
            <div v-for="snippet in snippets" :key="snippet.lang" @click="openSnippet(snippet)"
                class="group border-2 border-[#eaeded] bg-[#fafafa] p-8 hover:border-[#ff9900] cursor-pointer transition-all active:scale-[0.98] shadow-sm hover:shadow-xl hover:shadow-[#ff9900]/10 italic w-full max-w-md">
                <div class="flex items-center justify-between mb-6">
                    <div
                        class="px-4 py-1.5 border-2 border-[#eaeded] bg-white font-black text-[10px] tracking-[0.2em] uppercase italic group-hover:border-[#ff9900] transition-colors">
                        <span :class="snippet.langColor">{{ snippet.lang }}</span>
                    </div>
                    <svg class="w-6 h-6 text-[#eaeded] group-hover:text-[#ff9900] transition-colors" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </div>
                <div
                    class="text-[11px] text-[#545b64] font-black uppercase tracking-widest group-hover:text-[#232f3e] transition-colors">
                    {{ snippet.title }}
                </div>
            </div>
        </div>

        <!-- Code Modal -->
        <div v-if="showModal"
            class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#232f3e]/60 backdrop-blur-sm transition-all">
            <div
                class="bg-white border-4 border-[#232f3e] shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden relative">
                <div class="absolute top-0 right-0 w-32 h-32 bg-[#ff9900]/5 -mr-16 -mt-16 rounded-full blur-3xl"></div>

                <!-- Modal Header -->
                <div class="p-10 border-b-2 border-[#eaeded] flex justify-between items-center bg-[#fafafa] relative">
                    <div>
                        <h3 class="text-3xl font-black text-[#232f3e] tracking-tighter uppercase italic">{{
                            activeSnippet?.fullTitle }}</h3>
                        <p class="text-[10px] text-[#ff9900] font-black uppercase tracking-[0.2em] mt-2 italic">
                            Deployment Boilerplate</p>
                    </div>
                    <button @click="showModal = false"
                        class="w-12 h-12 bg-white border-2 border-[#eaeded] flex items-center justify-center text-[#545b64] hover:text-[#ff9900] hover:border-[#ff9900] transition-all active:scale-95 italic">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Modal Content -->
                <div class="flex-1 overflow-auto p-0 bg-white">
                    <div class="relative group h-full">
                        <div class="absolute top-0 left-0 w-1 bg-[#ff9900] h-full"></div>
                        <pre
                            class="p-10 text-[13px] font-mono leading-relaxed text-[#232f3e] overflow-x-auto selection:bg-[#ff9900]/20 custom-scrollbar"><code>{{ activeSnippet?.code }}</code></pre>

                        <!-- Copy Button inside code area -->
                        <button @click="copyCode"
                            class="absolute top-8 right-8 px-8 py-3 text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl italic"
                            :class="copied ? 'bg-[#ff9900] text-[#232f3e]' : 'bg-[#232f3e] text-white hover:bg-black'">
                            <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            {{ copied ? 'Snippet Copied' : 'Copy Snippet' }}
                        </button>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="p-8 border-t-2 border-[#eaeded] bg-[#fafafa] flex justify-end">
                    <button @click="showModal = false"
                        class="px-12 py-3 text-[11px] font-black uppercase tracking-widest text-[#545b64] hover:text-[#ff9900] transition-colors italic">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #fafafa;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #eaeded;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #ff9900;
}
</style>
