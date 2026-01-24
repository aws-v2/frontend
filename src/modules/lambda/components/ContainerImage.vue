<script setup lang="ts">
import { ref } from 'vue'

const functionName = ref('')
const containerUri = ref('')
const architecture = ref('x86_64')
const enableDurableExecution = ref(false)

// Additional configurations state
const additionalConfigExpanded = ref(false)
const computeType = ref('standard')
const launchInfrastructure = ref(false)
const vpcEnabled = ref(false)
const trustedLocationMode = ref('off')
</script>

<template>
  <div class="space-y-6">
    <!-- Basic Information -->
    <div class="aws-card p-6 rounded-sm">
      <div class="flex items-center gap-1.5 mb-6">
        <h3 class="text-xl font-bold text-gray-900">Basic information</h3>
        <span class="text-[var(--aws-blue)] cursor-help">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </span>
      </div>

      <div class="space-y-6 max-w-2xl">
        <!-- Function Name -->
        <div>
          <label class="aws-label">Function name</label>
          <p class="text-[11px] text-gray-500 mb-2">Enter a name that describes the purpose of your function.</p>
          <input v-model="functionName" type="text" placeholder="myFunctionName" class="aws-input" />
          <p class="text-[10px] text-gray-500 mt-1">Function name must be 1 to 64 characters, must be unique to the
            Region, and can't include spaces. Valid characters are a-z, A-Z, 0-9, hyphens (-), and underscores (_).</p>
        </div>

        <!-- Container Image URI -->
        <div>
          <div class="flex items-center gap-1.5">
            <label class="aws-label mb-0">Container image URI</label>
            <span class="text-[var(--aws-blue)] cursor-help">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
          <p class="text-[11px] text-gray-500 mb-2">The location of the container image to use for your function.</p>
          <div class="flex gap-3">
            <input v-model="containerUri" type="text" placeholder="Enter an Amazon ECR image URI"
              class="aws-input flex-grow" />
            <button class="btn-aws-secondary whitespace-nowrap px-6">Browse images</button>
          </div>
          <p class="text-[10px] text-gray-500 mt-1">Requires a valid Amazon ECR image URI.</p>
        </div>

        <!-- Overrides Expandable -->
        <div class="py-3 cursor-pointer hover:bg-gray-50 flex items-center gap-2 text-xs font-bold text-gray-800">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Container image overrides
        </div>

        <div class="h-px bg-gray-200"></div>

        <!-- Durable Execution -->
        <div>
          <div class="flex items-center gap-1.5">
            <label class="aws-label mb-0 font-bold">Durable execution - <span
                class="text-xs italic bg-blue-100 text-blue-700 px-1 rounded">new</span></label>
            <span class="text-[var(--aws-blue)] cursor-help">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
          <p class="text-[11px] text-gray-500 mb-2">Enable durable execution to simplify building resilient multi-step
            applications that checkpoint progress and resume after interruptions. Supports Python and Node.js runtimes.
            <a href="#" class="text-[var(--aws-blue)] hover:underline flex-inline items-center gap-0.5">View pricing
              <svg class="inline-block w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg></a>
          </p>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="enableDurableExecution"
              class="w-4 h-4 rounded-sm border-gray-300 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]">
            <span class="text-xs font-bold text-gray-700">Enable</span>
          </label>
        </div>

        <!-- Architecture -->
        <div>
          <div class="flex items-center gap-1.5">
            <label class="aws-label mb-0">Architecture</label>
            <span class="text-[var(--aws-blue)] cursor-help">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
          <p class="text-[11px] text-gray-500 mb-3">Choose the instruction set architecture you want for your function
            code.</p>
          <div class="space-y-2">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input type="radio" value="arm64" v-model="architecture"
                class="w-4 h-4 border-gray-300 text-[var(--aws-blue)] focus:ring-0">
              <span class="text-xs font-bold text-gray-700 group-hover:text-gray-900">arm64</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer group">
              <input type="radio" value="x86_64" v-model="architecture"
                class="w-4 h-4 border-gray-300 text-[var(--aws-blue)] focus:ring-0">
              <span class="text-xs font-bold text-gray-700 group-hover:text-gray-900">x86_64</span>
            </label>
          </div>
        </div>

        <!-- Permissions -->
        <div>
          <div class="flex items-center gap-1.5">
            <label class="aws-label mb-0">Permissions</label>
            <span class="text-[var(--aws-blue)] cursor-help">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
          <p class="text-[11px] text-gray-500 mb-4">By default, Lambda will create an execution role with permissions to
            upload logs to Amazon CloudWatch Logs. You can customize this default role later when adding triggers.</p>

          <div
            class="border-t border-gray-200 py-3 cursor-pointer hover:bg-gray-50 flex items-center gap-2 text-xs font-bold text-gray-800">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Change default execution role
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Configurations --\u003e
    <div class="aws-card rounded-sm">
      <div 
        @click="additionalConfigExpanded = !additionalConfigExpanded"
        class="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3"
      >
        <svg 
          class="w-4 h-4 transition-transform" 
          :class="additionalConfigExpanded ? 'rotate-90' : ''"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div class="flex-grow">
          <h3 class="font-bold text-gray-900 text-sm">Additional configurations</h3>
          <p class="text-[11px] text-gray-500 font-normal mt-0.5">Use additional configurations to set up networking, security,
            and governance for your function. These settings help secure and customize your Lambda function deployment.
          </p>
        </div>
      </div>

      <!-- Expanded Content -->
    <div v-if="additionalConfigExpanded" class="px-6 pb-6 space-y-6 max-w-2xl">
      <!-- Compute type -->
      <div>
        <div class="flex items-center gap-1.5">
          <label class="aws-label mb-0">Compute type</label>
          <span class="text-[var(--aws-blue)] cursor-help">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </div>
        <p class="text-[11px] text-gray-500 mb-3">Choose how you want to run your function. Lambda standard is the
          default setting, or you can choose Lambda SnapStart to improve cold start performance.</p>
        <div class="space-y-2">
          <label class="flex items-start gap-2 cursor-pointer group">
            <input type="radio" value="standard" v-model="computeType"
              class="w-4 h-4 mt-0.5 border-gray-300 text-[var(--aws-blue)] focus:ring-0">
            <div>
              <span class="text-xs font-bold text-gray-700 group-hover:text-gray-900 block">Lambda standard</span>
              <span class="text-[10px] text-gray-500">Default compute option for Lambda functions</span>
            </div>
          </label>
          <label class="flex items-start gap-2 cursor-pointer group">
            <input type="radio" value="snapstart" v-model="computeType"
              class="w-4 h-4 mt-0.5 border-gray-300 text-[var(--aws-blue)] focus:ring-0">
            <div>
              <span class="text-xs font-bold text-gray-700 group-hover:text-gray-900 block">Lambda SnapStart</span>
              <span class="text-[10px] text-gray-500">Improve cold start performance. Currently supports Java 11 and
                later managed runtimes. <a href="#" class="text-[var(--aws-blue)] hover:underline">View
                  pricing</a></span>
            </div>
          </label>
        </div>
      </div>

      <!-- Launch managed infrastructure -->
      <div>
        <div class="flex items-center gap-1.5">
          <label class="aws-label mb-0">Launch managed infrastructure - <span
              class="text-xs italic bg-blue-100 text-blue-700 px-1 rounded">new</span></label>
          <span class="text-[var(--aws-blue)] cursor-help">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </div>
        <p class="text-[11px] text-gray-500 mb-2">Set up a Lambda function with internet connectivity that runs in a
          VPC, without having to manually configure a NAT gateway or VPC endpoints. For more information, see <a
            href="#" class="text-[var(--aws-blue)] hover:underline">Configuring a Lambda function to access resources in
            a
            VPC</a>. You can also create a VPC with internet connectivity that runs in a VPC, without having to manually
          configure a NAT gateway or VPC endpoints. This will incur charges. <a href="#"
            class="text-[var(--aws-blue)] hover:underline">View pricing <svg class="inline-block w-2.5 h-2.5"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg></a></p>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="launchInfrastructure"
            class="w-4 h-4 rounded-sm border-gray-300 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]">
          <span class="text-xs font-bold text-gray-700">Launch managed infrastructure</span>
        </label>
      </div>

      <!-- Networking -->
      <div>
        <label class="aws-label">Networking</label>
        <p class="text-[11px] text-gray-500 mb-3">Configure networking for your Lambda function.</p>

        <!-- Function URL -->
        <div class="mb-4">
          <div class="flex items-center gap-1.5 mb-2">
            <span class="text-xs font-bold text-gray-700">Function URL</span>
            <span class="text-[var(--aws-blue)] cursor-help">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
          <p class="text-[10px] text-gray-500 mb-2">Enable a unique HTTPS endpoint for your Lambda function.</p>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox"
              class="w-4 h-4 rounded-sm border-gray-300 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]">
            <span class="text-xs text-gray-700">Enable</span>
          </label>
        </div>

        <!-- VPC -->
        <div>
          <div class="flex items-center gap-1.5 mb-2">
            <span class="text-xs font-bold text-gray-700">VPC</span>
            <span class="text-[var(--aws-blue)] cursor-help">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
          <p class="text-[10px] text-gray-500 mb-3">By default, Lambda runs your function code securely within a VPC.
            Alternatively, you can enable your function to access resources in a VPC that you specify.</p>
          <div class="space-y-2">
            <label class="flex items-center gap-2 cursor-pointer group">
              <input type="radio" :value="false" v-model="vpcEnabled"
                class="w-4 h-4 border-gray-300 text-[var(--aws-blue)] focus:ring-0">
              <span class="text-xs text-gray-700 group-hover:text-gray-900">Disable</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer group">
              <input type="radio" :value="true" v-model="vpcEnabled"
                class="w-4 h-4 border-gray-300 text-[var(--aws-blue)] focus:ring-0">
              <span class="text-xs text-gray-700 group-hover:text-gray-900">Enable</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Security & governance -->
      <div>
        <label class="aws-label">Security & governance</label>

        <!-- Trusted location mode -->
        <div class="mb-4">
          <div class="flex items-center gap-1.5 mb-2">
            <span class="text-xs font-bold text-gray-700">Trusted location mode</span>
            <span class="text-xs italic bg-blue-100 text-blue-700 px-1 rounded">new</span>
            <span class="text-[var(--aws-blue)] cursor-help">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
          <p class="text-[10px] text-gray-500 mb-3">Enforce that your Lambda function code is signed by a trusted
            location. Trusted locations include AWS-owned locations and locations that you specify. You can also specify
            which AWS services can invoke your function. <a href="#" class="text-[var(--aws-blue)] hover:underline">View
              pricing <svg class="inline-block w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg></a></p>
          <div class="space-y-2">
            <label class="flex items-start gap-2 cursor-pointer group">
              <input type="radio" value="off" v-model="trustedLocationMode"
                class="w-4 h-4 mt-0.5 border-gray-300 text-[var(--aws-blue)] focus:ring-0">
              <div>
                <span class="text-xs text-gray-700 group-hover:text-gray-900 block">Off</span>
                <span class="text-[10px] text-gray-500">Do not enforce trusted location mode</span>
              </div>
            </label>
            <label class="flex items-start gap-2 cursor-pointer group">
              <input type="radio" value="enforce" v-model="trustedLocationMode"
                class="w-4 h-4 mt-0.5 border-gray-300 text-[var(--aws-blue)] focus:ring-0">
              <div>
                <span class="text-xs text-gray-700 group-hover:text-gray-900 block">Enforce</span>
                <span class="text-[10px] text-gray-500">Enforce that your Lambda function code is signed by a trusted
                  location</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Tags -->
        <div>
          <div class="flex items-center gap-1.5 mb-2">
            <span class="text-xs font-bold text-gray-700">Tags</span>
            <span class="text-[var(--aws-blue)] cursor-help">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
          <p class="text-[10px] text-gray-500 mb-2">A tag is a label that you assign (or AWS assigns) to an AWS
            resource. Each tag consists of a key and a value. You can use tags to search and filter your resources or
            track your AWS costs.</p>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox"
              class="w-4 h-4 rounded-sm border-gray-300 text-[var(--aws-blue)] focus:ring-[var(--aws-blue)]">
            <span class="text-xs text-gray-700">Enable</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
