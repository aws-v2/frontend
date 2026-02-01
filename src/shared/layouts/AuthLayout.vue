<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="auth-layout min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center p-6">
    <div class="w-full max-w-md">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
      
      <div class="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-medium">
        &copy; 2026 Serwin Technologies or its affiliates.
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
