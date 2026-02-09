<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/shared/components/Navbar.vue'
import ToastContainer from '@/shared/components/ToastContainer.vue'
</script>

<template>
  <div class="min-h-screen transition-colors duration-150">
    <Navbar />
    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <ToastContainer />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
