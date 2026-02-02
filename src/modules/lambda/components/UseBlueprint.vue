<script setup lang="ts">
import { ref } from 'vue'

const blueprintName = ref('Hello world function')
const functionName = ref('')
const architecture = ref('x86_64')
const executionRole = ref('create-new')

const blueprints = [
    { name: 'Hello world function', desc: 'A starter AWS Lambda function.', runtime: 'nodejs22.x' },
    { name: 'Microservice-http-endpoint', desc: 'A starter AWS Lambda function with HTTP endpoint.', runtime: 'nodejs22.x' }
]

const codeSnippet = `// console.log('Loading function');

export const handler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('value1 =', event.key1);
    console.log('value2 =', event.key2);
    console.log('value3 =', event.key3);
    return event.key1; // Echo back the first key value
    // throw new Error('Something went wrong');
};`
</script>

<template>
  <div class="space-y-6">
    <div class="aws-card p-6 rounded-sm">
      <div class="flex items-center gap-1.5 mb-6">
        <h3 class="text-xl font-bold text-gray-900">Basic information</h3>
        <span class="text-[var(--aws-blue)] cursor-help">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </div>

      <div class="space-y-6 max-w-4xl">
         <!-- Blueprint Name -->
         <div>
          <label class="aws-label">Blueprint name</label>
          <div class="relative group max-w-2xl">
              <select v-model="blueprintName" class="aws-input pr-10 appearance-none bg-white">
                <option v-for="b in blueprints" :key="b.name" :value="b.name">{{ b.name }}</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
          </div>
          <p class="text-[10px] text-gray-500 mt-1">A starter AWS Lambda function. <span class="ml-4 font-bold text-gray-900">nodejs22.x</span></p>
          <div class="mt-2 flex items-center gap-2 text-[11px] text-gray-600">
             <svg class="w-4 h-4 text-[var(--aws-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
             Last fetched 1/23/2026, 8:25:14 PM
          </div>
        </div>

        <!-- Function Name -->
        <div class="max-w-2xl">
          <label class="aws-label">Function name</label>
          <p class="text-[11px] text-gray-500 mb-2">Enter a name that describes the purpose of your function.</p>
          <input 
            v-model="functionName"
            type="text" 
            placeholder="myFunctionName" 
            class="aws-input"
          />
          <p class="text-[10px] text-gray-500 mt-1">Function name must be 1 to 64 characters, must be unique to the Region, and can't include spaces. Valid characters are a-z, A-Z, 0-9, hyphens (-), and underscores (_).</p>
        </div>

        <!-- Static Info -->
        <div class="grid grid-cols-2 gap-8 max-w-lg">
            <div>
                <label class="aws-label mb-1">Runtime</label>
                <p class="text-xs text-gray-900 font-bold">nodejs22.x</p>
            </div>
            <div>
                 <label class="aws-label mb-1">Architecture</label>
                 <p class="text-xs text-gray-900 font-bold">x86_64</p>
            </div>
        </div>

        <!-- Execution Role -->
        <div>
            <label class="aws-label">Execution role</label>
            <p class="text-[11px] text-gray-500 mb-3">Choose a role that defines the permissions of your function. To create a custom role, go to the <a href="#" class="text-[var(--aws-blue)] hover:underline inline-flex items-center gap-0.5">IAM console <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>.</p>
            <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" value="create-new" v-model="executionRole" class="w-4 h-4 text-[var(--aws-blue)] focus:ring-0">
                    <span class="text-xs font-bold text-gray-700 group-hover:text-gray-900">Create a new role with basic Lambda permissions</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" value="existing" v-model="executionRole" class="w-4 h-4 text-[var(--aws-blue)] focus:ring-0">
                    <span class="text-xs font-bold text-gray-700 group-hover:text-gray-900">Use an existing role</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" value="policy-template" v-model="executionRole" class="w-4 h-4 text-[var(--aws-blue)] focus:ring-0">
                    <span class="text-xs font-bold text-gray-700 group-hover:text-gray-900">Create a new role from AWS policy templates</span>
                </label>
            </div>

            <!-- Banner Info -->
            <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-sm flex gap-3 text-blue-900 max-w-4xl">
                 <svg class="w-5 h-5 flex-shrink-0 text-[var(--aws-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                 <p class="text-xs font-medium">Role creation might take a few minutes. Do not delete the role or edit the trust or permissions policies in this role.</p>
            </div>
            
            <p class="mt-4 text-[11px] text-gray-600">Lambda will create an execution role named &lt;myFunctionName&gt;-role-ggii59de, with permission to upload logs to Amazon CloudWatch Logs.</p>
        </div>
      </div>
    </div>

    <!-- Lambda Function Code -->
    <div class="aws-card p-0 rounded-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="font-bold text-gray-900 text-lg">Lambda function code</h3>
            <p class="text-xs text-gray-500 mt-1">Code is preconfigured by the chosen blueprint. You can configure it after you create the function. <a href="#" class="text-[var(--aws-blue)] hover:underline inline-flex items-center gap-0.5 ml-1">Learn more <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a> about deploying Lambda functions.</p>
        </div>
        <div class="bg-[#f0f1f3] p-0 flex flex-col min-h-[400px]">
             <!-- Minimal Mock Editor -->
             <div class="bg-gray-50 border-b border-gray-300 px-4 py-1.5 flex justify-end">
                <span class="w-4 h-4 border border-gray-400 flex items-center justify-center rounded-sm">
                   <svg class="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
             </div>
             <pre class="bg-white p-6 font-mono text-xs leading-relaxed flex-grow text-gray-700 overflow-x-auto"><code>{{ codeSnippet }}</code></pre>
             <div class="bg-gray-50 border-t border-gray-200 px-4 py-1 text-[10px] text-gray-500 font-mono text-right italic">
                 1:1 JavaScript
             </div>
        </div>
    </div>
  </div>
</template>
