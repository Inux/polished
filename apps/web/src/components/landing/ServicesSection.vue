<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ServiceWithPricing } from '../../types';
import { Clock, Users, ArrowRight } from 'lucide-vue-next';

const props = defineProps<{
  services: ServiceWithPricing[];
  categories: string[];
}>();

const emit = defineEmits<{
  (e: 'select', service: ServiceWithPricing): void;
}>();

const activeCategory = ref<string | null>(null);

const filteredServices = computed(() => {
  if (!activeCategory.value) return props.services;
  return props.services.filter(s => s.category === activeCategory.value);
});

function formatPrice(service: ServiceWithPricing): string {
  if (!service.minPrice) return 'Price on request';
  if (service.minPrice === service.maxPrice) {
    return `$${service.minPrice}`;
  }
  return `From $${service.minPrice}`;
}

function formatDuration(service: ServiceWithPricing): string {
  if (!service.minDuration) return '';
  if (service.minDuration === service.maxDuration) {
    return `${service.minDuration} min`;
  }
  return `${service.minDuration}-${service.maxDuration} min`;
}
</script>

<template>
  <section id="services" class="py-16 md:py-24 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
          Our Services
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose from our range of professional beauty services
        </p>
      </div>

      <!-- Category Tabs -->
      <div class="flex flex-wrap justify-center gap-2 mb-12">
        <button
          @click="activeCategory = null"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-all',
            !activeCategory
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          ]"
        >
          All
        </button>
        <button
          v-for="category in categories"
          :key="category"
          @click="activeCategory = category"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-all',
            activeCategory === category
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          ]"
        >
          {{ category }}
        </button>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="service in filteredServices"
          :key="service.id"
          class="card group cursor-pointer"
        >
          <!-- Service Image -->
          <div class="relative h-48 overflow-hidden">
            <img
              :src="service.imageUrl || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80'"
              :alt="service.name"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span
              v-if="service.employeeCount > 2"
              class="absolute top-3 left-3 badge badge-popular"
            >
              POPULAR
            </span>
          </div>

          <!-- Service Details -->
          <div class="p-5">
            <h3 class="text-xl font-heading font-bold text-gray-900 mb-2">
              {{ service.name }}
            </h3>

            <p class="text-gray-600 text-sm mb-4 line-clamp-2">
              {{ service.description || 'Professional service by our expert team' }}
            </p>

            <div class="flex items-center justify-between">
              <div>
                <span class="text-xl font-bold text-primary-500">
                  {{ formatPrice(service) }}
                </span>
                <span v-if="formatDuration(service)" class="text-sm text-gray-500 ml-2">
                  <Clock class="inline w-4 h-4 mr-1" />
                  {{ formatDuration(service) }}
                </span>
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <Users class="w-4 h-4 mr-1" />
                {{ service.employeeCount }}
              </div>
            </div>

            <button @click="emit('select', service)" class="mt-4 w-full btn-primary group">
              Select Service
              <ArrowRight class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div v-if="filteredServices.length === 0" class="text-center py-12">
        <p class="text-gray-500">No services found in this category</p>
      </div>
    </div>
  </section>
</template>
