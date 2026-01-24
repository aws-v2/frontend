<script setup lang="ts">
import { ref } from 'vue'

const showModal = ref(false)
const activeSnippet = ref<any>(null)
const copied = ref(false)

const snippets = [
    {
        lang: 'Node',
        langColor: 'text-green-600',
        title: 'Node.js SDK',
        fullTitle: 'Connect using AWS SDK for JavaScript (v3)',
        code: `import { S3Client, ListObjectsV3Command } from "@aws-sdk/client-s3";

const client = new S3Client({ 
  region: "us-east-1",
  credentials: {
    accessKeyId: "YOUR_ACCESS_KEY",
    secretAccessKey: "YOUR_SECRET_KEY"
  }
});

const command = new ListObjectsV3Command({
  Bucket: "YOUR_BUCKET_NAME",
});

try {
  const data = await client.send(command);
  console.log(data);
} catch (error) {
  console.error(error);
}`
    },
    {
        lang: 'Python',
        langColor: 'text-blue-600',
        title: 'Boto3',
        fullTitle: 'Connect using Boto3 (Python)',
        code: `import boto3

s3 = boto3.client(
    's3',
    region_name='us-east-1',
    aws_access_key_id='YOUR_ACCESS_KEY',
    aws_secret_access_key='YOUR_SECRET_KEY'
)

# List objects in the bucket
response = s3.list_objects_v2(Bucket='YOUR_BUCKET_NAME')

for obj in response.get('Contents', []):
    print(obj['Key'])`
    },
    {
        lang: 'Flutter',
        langColor: 'text-cyan-500',
        title: 'Amplify',
        fullTitle: 'Connect using AWS Amplify for Flutter',
        code: "import 'package:amplify_flutter/amplify_flutter.dart';\n" +
              "import 'package:amplify_storage_s3/amplify_storage_s3.dart';\n\n" +
              "Future<void> listS3Objects() async {\n" +
              "  try {\n" +
              "    final result = await Amplify.Storage.list();\n" +
              "    for (var item in result.items) {\n" +
              "      print('Found item: ${item.key}');\n" +
              "    }\n" +
              "  } on StorageException catch (e) {\n" +
              "    print('Error listing items: ${e.message}');\n" +
              "  }\n" +
              "}"
    },
    {
        lang: 'Kotlin',
        langColor: 'text-purple-600',
        title: 'Android',
        fullTitle: 'Connect using AWS SDK for Kotlin (Android)',
        code: `import aws.sdk.kotlin.services.s3.S3Client
import aws.sdk.kotlin.services.s3.model.ListObjectsV2Request

suspend fun listObjects(bucketName: String) {
    S3Client { region = "us-east-1" }.use { s3 ->
        val request = ListObjectsV2Request {
            bucket = bucketName
        }
        val response = s3.listObjectsV2(request)
        response.contents?.forEach {
            println("Object key: \${it.key}")
        }
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
    <div class="border border-[var(--aws-blue)] bg-blue-50/10 rounded-sm p-4">
        <div class="flex items-center gap-2 mb-2">
            <h3 class="text-lg font-bold text-[var(--aws-blue)]">Developer Quick Connect</h3>
            <span
                class="text-[10px] bg-[var(--aws-blue)] text-white px-1.5 py-0.5 rounded font-bold uppercase">New</span>
        </div>
        <p class="text-xs text-gray-600 mb-4">Select a language to get pre-configured code snippets for this bucket.</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="snippet in snippets" :key="snippet.lang" @click="openSnippet(snippet)"
                class="group border border-gray-300 rounded-sm bg-white p-3 hover:border-[var(--aws-blue)] hover:shadow-sm cursor-pointer transition-all">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2 font-bold text-gray-800 text-sm">
                        <span class="font-mono" :class="snippet.langColor">{{ snippet.lang }}</span>
                    </div>
                    <svg class="w-3 h-3 text-gray-400 group-hover:text-[var(--aws-blue)] transition-colors" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </div>
                <div class="text-[10px] text-gray-500 font-medium">
                    {{ snippet.title }}
                </div>
            </div>
        </div>

        <!-- Code Modal -->
        <div v-if="showModal"
            class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div class="bg-white rounded-sm shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <!-- Modal Header -->
                <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 class="text-base font-bold text-gray-900">{{ activeSnippet?.fullTitle }}</h3>
                        <p class="text-[11px] text-gray-500">Ready-to-use boilerplate for your application</p>
                    </div>
                    <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 p-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Modal Content -->
                <div class="flex-1 overflow-auto p-0 bg-[#1e1e1e]">
                    <div class="relative group">
                        <pre
                            class="p-6 text-[11px] font-mono leading-relaxed text-blue-300 overflow-x-auto"><code>{{ activeSnippet?.code }}</code></pre>

                        <!-- Copy Button inside code area -->
                        <button @click="copyCode"
                            class="absolute top-4 right-4 px-3 py-1.5 rounded-sm text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-lg"
                            :class="copied ? 'bg-green-600 text-white' : 'bg-gray-700/80 text-gray-200 hover:bg-gray-600'">
                            <svg v-if="!copied" class="w-3.5 h-3.5" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            {{ copied ? 'Copied!' : 'Copy Code' }}
                        </button>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="p-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 text-[11px]">
                    <button @click="showModal = false"
                        class="px-4 py-1.5 font-bold text-gray-600 hover:text-gray-900 border border-gray-300 rounded-sm bg-white shadow-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
