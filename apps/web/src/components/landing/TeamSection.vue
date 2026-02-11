<script setup lang="ts">
import type { Employee } from '../../types';
import { Star, Calendar } from 'lucide-vue-next';

defineProps<{
  employees: Employee[];
}>();
</script>

<template>
  <section id="team" class="py-16 md:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
          Meet Our Team
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Our experienced professionals are here to make you look and feel amazing
        </p>
      </div>

      <!-- Team Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <article
          v-for="employee in employees"
          :key="employee.id"
          class="group text-center"
        >
          <!-- Avatar -->
          <div class="relative mb-4 mx-auto w-32 h-32 md:w-40 md:h-40">
            <img
              :src="employee.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.id}`"
              :alt="employee.user.name"
              class="w-full h-full rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
            <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-md">
              <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span class="text-sm font-semibold">4.9</span>
            </div>
          </div>

          <!-- Info -->
          <h3 class="text-lg font-heading font-bold text-gray-900">
            {{ employee.user.name }}
          </h3>
          <p class="text-sm text-gray-500 mb-2">
            {{ employee.title }}
          </p>
          <p class="text-xs text-gray-400 mb-4">
            127 appointments
          </p>

          <!-- Book Button -->
          <button class="btn-secondary text-sm px-4 py-2">
            <Calendar class="w-4 h-4 mr-1" />
            Book
          </button>
        </article>
      </div>
    </div>
  </section>
</template>
