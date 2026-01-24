<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeRuntimeTabIndex = ref(2) // Default to Node.js

const runtimes = [
  { name: '.NET', code: 'public void Handler(Stream stream) {\n  Console.WriteLine("Hello from .NET!");\n}' },
  { name: 'Java', code: 'public class Handler implements RequestHandler<Map<String, String>, String> {\n  @Override\n  public String handleRequest(Map<String, String> event, Context context) {\n    return "Hello from Java!";\n  }\n}' },
  { name: 'Node.js', code: 'exports.handler = async (event) => {\n  console.log(event);\n  return "Hello from Lambda!";\n};' },
  { name: 'Python', code: 'import json\n\ndef lambda_handler(event, context):\n    print(event)\n    return {\n        \'statusCode\': 200,\n        \'body\': json.dumps(\'Hello from Python!\')\n    }' },
  { name: 'Ruby', code: 'require "json"\n\ndef lambda_handler(event:, context:)\n    puts event\n    { statusCode: 200, body: JSON.generate("Hello from Ruby!") }\nend' },
  { name: 'Custom runtime', code: '# Custom runtime example\n# bootstrap file\nwhile true; do\n  HEADERS="$(mktemp)"\n  EVENT_DATA=$(curl -sS -LD "$HEADERS" "http://${AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime/invocation/next")\n  # Process event...\n  curl -X POST "http://${AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime/invocation/$INVOCATION_ID/response" -d "Success"\ndone' }
]

const navigateToCreate = () => {
    router.push({ name: 'lambda-create' })
}
</script>

<template>
  <div class="min-h-screen bg-[var(--bg-console)]">
    <!-- Hero Section -->
    <div class="bg-[#16191f] text-white px-8 py-12 flex justify-between items-start">
      <div class="max-w-3xl">
        <p class="text-gray-400 text-sm font-medium mb-1">Compute</p>
        <h1 class="text-4xl font-light mb-4">AWS Lambda</h1>
        <h2 class="text-3xl font-light text-gray-300 mb-6">lets you run code without thinking about servers.</h2>
        <p class="text-gray-400 max-w-2xl leading-relaxed">
          You pay only for the compute time that you consume — there is no charge when your code is not running. 
          With Lambda, you can run code for virtually any type of application or backend service, all with zero administration.
        </p>
      </div>

      <!-- Get Started Card -->
      <div class="bg-white text-[var(--text-main)] p-6 rounded-sm shadow-lg w-80">
        <h3 class="font-bold text-lg mb-4">Get started</h3>
        <p class="text-sm text-gray-600 mb-6">
          Author a Lambda function from scratch, or choose from one of many preconfigured examples.
        </p>
        <button @click="navigateToCreate" class="btn-aws-primary w-full py-2 bg-[#ec7211] hover:bg-[#eb5f07] transition-colors">
          Create a function
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-8 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      <!-- Left Column: How it works & Related Services -->
      <div class="lg:col-span-3 space-y-8">
        
        <!-- How it works -->
        <div class="aws-card p-0 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-white">
            <h3 class="font-bold text-lg">How it works</h3>
          </div>
          <div class="p-6 bg-white">
            <!-- Tabs -->
            <div class="flex border-b border-gray-200 mb-4 overflow-x-auto">
              <button 
                v-for="(runtime, index) in runtimes" 
                :key="runtime.name"
                @click="activeRuntimeTabIndex = index"
                class="px-5 py-2.5 text-sm font-bold transition-all whitespace-nowrap border-b-2"
                :class="activeRuntimeTabIndex === index ? 'border-[var(--aws-blue)] text-[var(--aws-blue)]' : 'border-transparent text-gray-500 hover:text-gray-700'"
              >
                {{ runtime.name }}
              </button>
            </div>

            <!-- Code Editor Area -->
            <div class="bg-[#f2f3f3] border border-gray-300 rounded-sm p-0 flex flex-col min-h-[300px]">
              <div class="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300">
                <div class="flex gap-2">
                  <div class="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
                <div class="flex items-center gap-3">
                    <button class="bg-[#ec7211] text-white px-6 py-1 text-xs font-bold rounded-sm shadow-sm hover:bg-[#d4660f]">Run</button>
                    <button class="text-gray-500 text-xs font-bold flex items-center gap-1">
                        Next: Lambda responds to events
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
              </div>
              <pre class="p-6 font-mono text-sm overflow-x-auto flex-grow bg-white"><code>{{ runtimes[activeRuntimeTabIndex].code }}</code></pre>
              <div class="px-4 py-2 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                <span>1:1 JavaScript</span>
                <span class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                </span>
              </div>
            </div>

            <div class="mt-6">
                <h4 class="font-bold text-sm mb-1">Just write the code</h4>
                <p class="text-xs text-gray-600">Above is a simple Lambda function. Click "Run" to see function output before going to the next step.</p>
            </div>
          </div>
        </div>

        <!-- Related Services -->
        <div class="space-y-4">
            <h3 class="font-bold text-lg px-2">Related services</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="aws-card p-6">
                    <h4 class="text-[var(--aws-blue)] font-bold mb-2 flex items-center gap-1 underline underline-offset-2">
                        AWS Step Functions
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </h4>
                    <p class="text-xs text-gray-600 leading-relaxed">
                        AWS Step Functions makes it easy to coordinate the components of distributed applications and microservices using visual workflows.
                    </p>
                </div>
                <div class="aws-card p-6">
                    <h4 class="text-[var(--aws-blue)] font-bold mb-2 flex items-center gap-1 underline underline-offset-2">
                        Amazon SNS
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </h4>
                    <p class="text-xs text-gray-600 leading-relaxed">
                        Amazon SNS is a flexible, fully managed pub/sub messaging and mobile notifications service for coordinating the delivery of messages to subscribing endpoints and clients.
                    </p>
                </div>
            </div>
            <a href="#" class="text-xs text-[var(--aws-blue)] hover:underline px-2">See more related services</a>
        </div>

        <!-- Use Cases -->
        <div class="space-y-4">
            <h3 class="font-bold text-lg px-2">Use cases</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="aws-card p-6 flex flex-col h-full">
                    <div class="flex-grow">
                        <h4 class="text-3xl font-black mb-4 tracking-tighter italic">BU S T L E</h4>
                        <h5 class="font-bold text-sm mb-2">Mobile backends</h5>
                        <p class="text-xs text-gray-600 leading-relaxed max-w-sm">
                            You can build serverless web applications and backends using AWS Lambda, Amazon API Gateway, Amazon S3, and Amazon DynamoDB to handle web, mobile, Internet of Things (IoT), and chatbot requests.
                        </p>
                    </div>
                    <a href="#" class="text-xs text-[var(--aws-blue)] hover:underline mt-4">Learn more</a>
                </div>
                <div class="aws-card p-6 flex flex-col h-full">
                    <div class="flex-grow">
                        <div class="flex items-center gap-1.5 mb-4">
                            <div class="w-6 h-6 bg-[#ff9900] rounded-sm"></div>
                            <span class="text-xl font-bold tracking-tight">Localytics</span>
                        </div>
                        <h5 class="font-bold text-sm mb-2">Data processing</h5>
                        <p class="text-xs text-gray-600 leading-relaxed max-w-sm">
                            You can build a variety of real-time data processing systems using AWS Lambda, Amazon Kinesis, Amazon S3, and Amazon DynamoDB.
                        </p>
                    </div>
                    <a href="#" class="text-xs text-[var(--aws-blue)] hover:underline mt-4">Learn more</a>
                </div>
            </div>
            <a href="#" class="text-xs text-[var(--aws-blue)] hover:underline px-2">View more use cases</a>
        </div>

      </div>

      <!-- Right Column: Resources & Pricing -->
      <div class="space-y-6">
        <!-- More resources -->
        <div class="aws-card overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 class="font-bold text-sm">More resources</h3>
                <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="p-4 space-y-3">
                <a href="#" class="block text-xs text-[var(--aws-blue)] hover:underline">Documentation</a>
                <a href="#" class="block text-xs text-[var(--aws-blue)] hover:underline">API reference</a>
                <a href="#" class="block text-xs text-[var(--aws-blue)] hover:underline">AWS Serverless Application Model (SAM)</a>
                <a href="#" class="block text-xs text-[var(--aws-blue)] hover:underline">SAM CLI</a>
                <a href="#" class="block text-xs text-[var(--aws-blue)] hover:underline">Forums</a>
            </div>
        </div>

        <!-- Pricing -->
        <div class="aws-card overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 class="font-bold text-sm">Pricing (US)</h3>
            </div>
            <div class="p-4">
                <table class="w-full text-xs">
                    <tbody class="divide-y divide-gray-100">
                        <tr>
                            <td class="py-2 text-gray-600">First 1M requests / month</td>
                            <td class="py-2 text-right font-bold">Free</td>
                        </tr>
                        <tr>
                            <td class="py-2 text-gray-600">First 400K GB-sec / month</td>
                            <td class="py-2 text-right font-bold">Free</td>
                        </tr>
                        <tr>
                            <td class="py-2 text-gray-600">Requests / month</td>
                            <td class="py-2 text-right font-bold">$0.20 per 1M</td>
                        </tr>
                        <tr>
                            <td class="py-2 text-gray-600">GB-sec / month</td>
                            <td class="py-2 text-right font-bold">$16.67 per 1M</td>
                        </tr>
                    </tbody>
                </table>
                <p class="mt-4 text-[10px] text-gray-500 leading-tight">
                    Pricing may vary by region. See 
                    <a href="#" class="text-[var(--aws-blue)] hover:underline">AWS Lambda Pricing</a>
                    for more information. Use the 
                    <a href="#" class="text-[var(--aws-blue)] hover:underline">AWS Pricing Calculator</a>
                    to estimate costs for your use case.
                </p>
            </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.aws-card {
  border-radius: 2px;
}
</style>
