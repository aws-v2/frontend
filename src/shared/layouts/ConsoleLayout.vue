<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/shared/components/Navbar.vue'
</script>

<template>
  <div class="console-layout min-h-screen bg-[var(--bg-console)] text-[var(--text-main)] overflow-hidden flex flex-col">
    <Navbar />
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar can go here -->
      <main class="flex-1 overflow-y-auto custom-scrollbar p-6">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
