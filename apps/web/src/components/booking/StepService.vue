<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ServiceWithPricing } from '../../types';
import { Clock, Users, Check } from 'lucide-vue-next';

const props = defineProps<{
  services: ServiceWithPricing[];
  selected: ServiceWithPricing | null;
}>();

const emit = defineEmits<{
  (e: 'select', service: ServiceWithPricing): void;
}>();

const searchQuery = ref('');
const activeCategory = ref<string | null>(null);

const categories = computed(() => {
  const cats = new Set(props.services.map(s => s.category));
  return Array.from(cats).sort();
});

const filteredServices = computed(() => {
  let result = props.services;

  if (activeCategory.value) {
    result = result.filter(s => s.category === activeCategory.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.description?.toLowerCase().includes(query)
    );
  }

  return result;
});

function formatPrice(service: ServiceWithPricing): string {
  if (!service.minPrice) return 'Price on request';
  if (service.minPrice === service.maxPrice) return `$${service.minPrice}`;
  return `From $${service.minPrice}`;
}

function formatDuration(service: ServiceWithPricing): string {
  if (!service.minDuration) return '';
  if (service.minDuration === service.maxDuration) return `${service.minDuration} min`;
  return `${service.minDuration}-${service.maxDuration} min`;
}
</script>

<template>
  <div class="p-4">
    <!-- Search -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search services..."
        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
      />
    </div>

    <!-- Category Tabs -->
    <div class="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4">
      <button
        @click="activeCategory = null"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
          !activeCategory ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        All
      </button>
      <button
        v-for="category in categories"
        :key="category"
        @click="activeCategory = category"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
          activeCategory === category ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        {{ category }}
      </button>
    </div>

    <!-- Services List -->
    <div class="space-y-3">
      <button
        v-for="service in filteredServices"
        :key="service.id"
        @click="emit('select', service)"
        :class="[
          'w-full text-left p-4 rounded-xl border-2 transition-all',
          selected?.id === service.id
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        ]"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">{{ service.name }}</h3>
            <p class="text-sm text-gray-500 mt-1 line-clamp-2">
              {{ service.description || 'Professional service' }}
            </p>
            <div class="flex items-center gap-4 mt-2 text-sm">
              <span class="font-semibold text-primary-500">{{ formatPrice(service) }}</span>
              <span v-if="formatDuration(service)" class="flex items-center text-gray-500">
                <Clock class="w-4 h-4 mr-1" />
                {{ formatDuration(service) }}
              </span>
              <span class="flex items-center text-gray-500">
                <Users class="w-4 h-4 mr-1" />
                {{ service.employeeCount }}
              </span>
            </div>
          </div>
          <div
            v-if="selected?.id === service.id"
            class="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 ml-3"
          >
            <Check class="w-4 h-4 text-white" />
          </div>
        </div>
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="filteredServices.length === 0" class="text-center py-8 text-gray-500">
      No services found
    </div>
  </div>
</template>
