<script setup lang="ts">
import { RouterView } from 'vue-router'
// We will move the landing page's custom navbar/footer here in the future
</script>

<template>
  <div class="public-layout min-h-screen bg-white font-sans overflow-x-hidden">
    <slot name="header">
      <!-- Placeholder for Public Navbar -->
    </slot>
    
    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <slot name="footer">
      <!-- Placeholder for Public Footer -->
    </slot>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
