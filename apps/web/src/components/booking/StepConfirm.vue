<script setup lang="ts">
import type { ServiceWithPricing, Employee, Studio } from '../../types';
import { Calendar, Clock, User, MapPin, Scissors, CreditCard } from 'lucide-vue-next';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const props = defineProps<{
  studio: Studio;
  service: ServiceWithPricing;
  employee: Employee;
  dateTime: { date: Date; time: string; endTime: string };
  customer: CustomerInfo;
  price: number;
  duration: number;
  isSubmitting: boolean;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
}>();

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
</script>

<template>
  <div class="p-4">
    <div class="space-y-4">
      <!-- Service Details -->
      <div class="bg-gray-50 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Scissors class="w-5 h-5 text-primary-500" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">{{ service.name }}</h3>
            <p class="text-sm text-gray-500">{{ service.category }}</p>
          </div>
        </div>
      </div>

      <!-- Employee -->
      <div class="bg-gray-50 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <img
            :src="employee.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.id}`"
            :alt="employee.user.name"
            class="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
          />
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">{{ employee.user.name }}</h3>
            <p class="text-sm text-gray-500">{{ employee.title }}</p>
          </div>
        </div>
      </div>

      <!-- Date & Time -->
      <div class="bg-gray-50 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Calendar class="w-5 h-5 text-primary-500" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">{{ formatDate(dateTime.date) }}</h3>
            <p class="text-sm text-gray-500 flex items-center mt-0.5">
              <Clock class="w-4 h-4 mr-1" />
              {{ dateTime.time }} - {{ dateTime.endTime }} ({{ duration }} min)
            </p>
          </div>
        </div>
      </div>

      <!-- Location -->
      <div class="bg-gray-50 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <MapPin class="w-5 h-5 text-primary-500" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">{{ studio.name }}</h3>
            <p class="text-sm text-gray-500">{{ studio.address || 'Address not available' }}</p>
          </div>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="bg-gray-50 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <User class="w-5 h-5 text-primary-500" />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">{{ customer.name }}</h3>
            <p class="text-sm text-gray-500">{{ customer.phone }}</p>
            <p v-if="customer.email" class="text-sm text-gray-500">{{ customer.email }}</p>
            <p v-if="customer.notes" class="text-sm text-gray-400 mt-1 italic">"{{ customer.notes }}"</p>
          </div>
        </div>
      </div>

      <!-- Price Summary -->
      <div class="bg-primary-50 rounded-xl p-4 border-2 border-primary-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
              <CreditCard class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Total Amount</p>
              <p class="text-2xl font-bold text-primary-500">${{ price }}</p>
            </div>
          </div>
          <span class="text-xs bg-primary-200 text-primary-700 px-2 py-1 rounded-full font-medium">
            Pay at salon
          </span>
        </div>
      </div>

      <!-- Confirm Button -->
      <button
        @click="emit('confirm')"
        :disabled="isSubmitting"
        :class="[
          'w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
          isSubmitting
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary-500 text-white hover:bg-primary-600',
        ]"
      >
        <div v-if="isSubmitting" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        <span>{{ isSubmitting ? 'Booking...' : 'Confirm Booking' }}</span>
      </button>

      <p class="text-xs text-center text-gray-500">
        You'll receive a confirmation via WhatsApp
      </p>
    </div>
  </div>
</template>
