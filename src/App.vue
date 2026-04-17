<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import Navbar from '@/shared/components/Navbar.vue'
import ToastContainer from '@/shared/components/ToastContainer.vue'
import { useAuthStore } from '@/modules/auth/store/authStore'

const authStore = useAuthStore()
const route = useRoute()
</script>

<template>
  <!-- Global Loading/Splash Screen -->
  <div v-if="authStore.isAuthenticated === null"
    class="fixed inset-0 bg-[#232f3e] flex items-center justify-center z-[9999]">
    <div class="text-center space-y-4">
      <div
        class="w-16 h-16 bg-[#ff9900] flex items-center justify-center text-white font-black text-3xl italic shadow-[0_0_30px_rgba(255,153,0,0.3)] animate-pulse">
        S
      </div>
      <div class="text-[10px] text-[#ff9900] font-black uppercase tracking-[0.3em]">Serwin Systems</div>
    </div>
  </div>

  <div v-else class="min-h-screen transition-colors duration-150">
    <Navbar v-if="!route.meta.hideNavbar" />
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
