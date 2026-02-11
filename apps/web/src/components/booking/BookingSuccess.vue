<script setup lang="ts">
import type { Studio } from '../../types';
import { CheckCircle, Calendar, MapPin, Phone, MessageCircle } from 'lucide-vue-next';

interface BookingResult {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  service?: {
    name: string;
  };
  employee?: {
    user: {
      name: string;
    };
  };
}

const props = defineProps<{
  booking: BookingResult;
  studio: Studio;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function addToCalendar() {
  const start = new Date(props.booking.startTime);
  const end = new Date(props.booking.endTime);

  const event = {
    title: `${props.booking.service?.name || 'Appointment'} at ${props.studio.name}`,
    start: start.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
    end: end.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
    location: props.studio.address || '',
  };

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&location=${encodeURIComponent(event.location)}`;

  window.open(url, '_blank');
}
</script>

<template>
  <div class="p-6 text-center">
    <!-- Success Icon -->
    <div class="mb-6">
      <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <CheckCircle class="w-12 h-12 text-green-500" />
      </div>
    </div>

    <!-- Success Message -->
    <h2 class="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
    <p class="text-gray-600 mb-6">
      Your appointment has been successfully booked. We've sent a confirmation to your phone.
    </p>

    <!-- Booking Details Card -->
    <div class="bg-gray-50 rounded-xl p-4 mb-6 text-left">
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <Calendar class="w-5 h-5 text-primary-500" />
          <div>
            <p class="font-medium text-gray-900">{{ formatDate(booking.startTime) }}</p>
            <p class="text-sm text-gray-500">{{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <MapPin class="w-5 h-5 text-primary-500" />
          <div>
            <p class="font-medium text-gray-900">{{ studio.name }}</p>
            <p class="text-sm text-gray-500">{{ studio.address || 'Address available at salon' }}</p>
          </div>
        </div>

        <div v-if="booking.service" class="pt-2 border-t border-gray-200">
          <p class="text-sm text-gray-500">
            <span class="font-medium text-gray-900">{{ booking.service.name }}</span>
            <span v-if="booking.employee"> with {{ booking.employee.user.name }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Booking Reference -->
    <div class="mb-6 p-3 bg-primary-50 rounded-lg">
      <p class="text-xs text-gray-500 mb-1">Booking Reference</p>
      <p class="font-mono text-sm font-semibold text-primary-600">{{ booking.id.slice(0, 8).toUpperCase() }}</p>
    </div>

    <!-- Action Buttons -->
    <div class="space-y-3">
      <button
        @click="addToCalendar"
        class="w-full py-3 px-4 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
      >
        <Calendar class="w-5 h-5" />
        Add to Calendar
      </button>

      <a
        v-if="studio.phone"
        :href="`https://wa.me/${studio.phone.replace(/\D/g, '')}`"
        target="_blank"
        class="w-full py-3 px-4 bg-green-500 rounded-xl font-medium text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2"
      >
        <MessageCircle class="w-5 h-5" />
        Contact via WhatsApp
      </a>

      <button
        @click="emit('close')"
        class="w-full py-3 px-4 bg-primary-500 rounded-xl font-medium text-white hover:bg-primary-600 transition-all"
      >
        Done
      </button>
    </div>

    <!-- Help Text -->
    <p class="mt-6 text-xs text-gray-400">
      Need to make changes? Contact the salon directly or book a new appointment.
    </p>
  </div>
</template>
