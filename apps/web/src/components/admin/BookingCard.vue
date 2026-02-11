<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Clock,
  User,
  Phone,
  Scissors,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
} from 'lucide-vue-next';

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  price?: number;
  service: { name: string; category: string };
  employee: { title: string; user: { name: string } };
}

const props = defineProps<{
  booking: Booking;
}>();

const emit = defineEmits<{
  (e: 'update-status', bookingId: string, status: string): void;
}>();

const showActions = ref(false);

const statusConfig = {
  PENDING: { label: 'Pending', color: 'yellow', icon: AlertCircle },
  CONFIRMED: { label: 'Confirmed', color: 'blue', icon: CheckCircle },
  COMPLETED: { label: 'Completed', color: 'green', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'gray', icon: XCircle },
  NO_SHOW: { label: 'No Show', color: 'red', icon: XCircle },
  DECLINED: { label: 'Declined', color: 'red', icon: XCircle },
};

const currentStatus = computed(() => {
  return statusConfig[props.booking.status as keyof typeof statusConfig] || statusConfig.PENDING;
});

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function handleStatusChange(status: string) {
  emit('update-status', props.booking.id, status);
  showActions.value = false;
}
</script>

<template>
  <div class="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-all">
    <div class="flex items-start justify-between gap-4">
      <!-- Main Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 mb-2">
          <!-- Status Badge -->
          <span
            :class="[
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              currentStatus.color === 'yellow' && 'bg-yellow-100 text-yellow-800',
              currentStatus.color === 'blue' && 'bg-blue-100 text-blue-800',
              currentStatus.color === 'green' && 'bg-green-100 text-green-800',
              currentStatus.color === 'gray' && 'bg-gray-100 text-gray-800',
              currentStatus.color === 'red' && 'bg-red-100 text-red-800',
            ]"
          >
            <component :is="currentStatus.icon" class="w-3 h-3" />
            {{ currentStatus.label }}
          </span>

          <!-- Date & Time -->
          <span class="text-sm text-gray-500 flex items-center gap-1">
            <Clock class="w-4 h-4" />
            {{ formatDate(booking.startTime) }} at {{ formatTime(booking.startTime) }}
          </span>
        </div>

        <!-- Customer -->
        <div class="flex items-center gap-2 mb-2">
          <User class="w-4 h-4 text-gray-400" />
          <span class="font-medium text-gray-900">{{ booking.customerName }}</span>
          <a
            :href="`tel:${booking.customerPhone}`"
            class="text-sm text-primary-600 hover:underline flex items-center gap-1"
          >
            <Phone class="w-3 h-3" />
            {{ booking.customerPhone }}
          </a>
        </div>

        <!-- Service & Employee -->
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <span class="flex items-center gap-1">
            <Scissors class="w-4 h-4 text-gray-400" />
            {{ booking.service.name }}
          </span>
          <span>with {{ booking.employee.user.name }}</span>
          <span v-if="booking.price" class="font-semibold text-primary-600">
            ${{ booking.price }}
          </span>
        </div>

        <!-- Notes -->
        <p v-if="booking.notes" class="mt-2 text-sm text-gray-500 italic">
          "{{ booking.notes }}"
        </p>
      </div>

      <!-- Actions -->
      <div class="relative">
        <button
          @click="showActions = !showActions"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical class="w-5 h-5" />
        </button>

        <!-- Dropdown -->
        <div
          v-if="showActions"
          class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10"
        >
          <button
            v-if="booking.status === 'PENDING'"
            @click="handleStatusChange('CONFIRMED')"
            class="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
          >
            <CheckCircle class="w-4 h-4" />
            Confirm
          </button>
          <button
            v-if="booking.status === 'CONFIRMED'"
            @click="handleStatusChange('COMPLETED')"
            class="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
          >
            <CheckCircle class="w-4 h-4" />
            Mark Complete
          </button>
          <button
            v-if="booking.status === 'CONFIRMED'"
            @click="handleStatusChange('NO_SHOW')"
            class="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
          >
            <AlertCircle class="w-4 h-4" />
            No Show
          </button>
          <button
            v-if="booking.status === 'PENDING'"
            @click="handleStatusChange('DECLINED')"
            class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <XCircle class="w-4 h-4" />
            Decline
          </button>
          <button
            v-if="['PENDING', 'CONFIRMED'].includes(booking.status)"
            @click="handleStatusChange('CANCELLED')"
            class="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
          >
            <XCircle class="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
