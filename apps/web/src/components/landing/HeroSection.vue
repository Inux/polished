<script setup lang="ts">
import type { Studio } from '../../types';
import { Menu } from 'lucide-vue-next';

defineProps<{
  studio: Studio;
}>();

const emit = defineEmits<{
  (e: 'book'): void;
}>();
</script>

<template>
  <section class="relative min-h-[90vh] flex flex-col">
    <!-- Hero Background -->
    <div class="absolute inset-0 z-0">
      <img
        src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80"
        alt="Beauty studio"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 hero-gradient" />
    </div>

    <!-- Navigation -->
    <nav class="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
      <div class="flex items-center gap-3">
        <img
          v-if="studio.logoUrl"
          :src="studio.logoUrl"
          :alt="studio.name"
          class="h-10 w-auto"
        />
        <span v-else class="text-2xl font-heading font-bold text-white">
          {{ studio.name }}
        </span>
      </div>
      <button class="p-2 text-white md:hidden">
        <Menu class="w-6 h-6" />
      </button>
      <div class="hidden md:flex items-center gap-6">
        <a href="#services" class="text-white/90 hover:text-white transition-colors">Services</a>
        <a href="#team" class="text-white/90 hover:text-white transition-colors">Team</a>
        <a href="#contact" class="text-white/90 hover:text-white transition-colors">Contact</a>
      </div>
    </nav>

    <!-- Hero Content -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
      <h1 class="text-4xl md:text-6xl font-heading font-bold text-white mb-4 animate-fade-in">
        Perfect Nails in 60 Mins
      </h1>
      <p class="text-lg md:text-xl text-white/90 mb-8 animate-slide-up">
        Same-day appointments available
      </p>

      <div class="flex flex-col sm:flex-row gap-4 animate-slide-up">
        <button @click="emit('book')" class="btn-primary text-lg px-8 py-4">
          Book Now
        </button>
        <a href="#services" class="btn-ghost text-white border-white/30 hover:bg-white/10">
          View Services
        </a>
      </div>

      <!-- Trust Signals -->
      <div class="flex items-center gap-6 mt-12 text-white/80 text-sm">
        <span class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          4.9 (342 reviews)
        </span>
        <span>Licensed</span>
        <span>Insured</span>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="relative z-10 flex justify-center pb-8">
      <div class="animate-bounce">
        <svg class="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </div>
    </div>
  </section>
</template>
