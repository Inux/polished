<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Employee, ServiceWithPricing } from '../../types';
import { ChevronLeft, ChevronRight, Clock, Check } from 'lucide-vue-next';

const props = defineProps<{
  employee: Employee;
  service: ServiceWithPricing;
  duration: number;
}>();

const emit = defineEmits<{
  (e: 'select', data: { date: Date; time: string; endTime: string }): void;
}>();

const today = new Date();
today.setHours(0, 0, 0, 0);

const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1));
const selectedDate = ref<Date | null>(null);
const selectedTime = ref<string | null>(null);
const availableSlots = ref<string[]>([]);
const loadingSlots = ref(false);

// Generate calendar days
const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days: (Date | null)[] = [];

  // Add empty slots for days before the first day of the month
  const startPadding = firstDay.getDay();
  for (let i = 0; i < startPadding; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
});

const monthName = computed(() => {
  return currentMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});

function previousMonth() {
  const newMonth = new Date(currentMonth.value);
  newMonth.setMonth(newMonth.getMonth() - 1);
  if (newMonth >= new Date(today.getFullYear(), today.getMonth(), 1)) {
    currentMonth.value = newMonth;
  }
}

function nextMonth() {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + 1,
    1
  );
}

function isDateSelectable(date: Date | null): boolean {
  if (!date) return false;
  return date >= today;
}

function isDateSelected(date: Date | null): boolean {
  if (!date || !selectedDate.value) return false;
  return date.toDateString() === selectedDate.value.toDateString();
}

function selectDate(date: Date | null) {
  if (!date || !isDateSelectable(date)) return;
  selectedDate.value = date;
  selectedTime.value = null;
  fetchAvailableSlots(date);
}

async function fetchAvailableSlots(date: Date) {
  loadingSlots.value = true;
  availableSlots.value = [];

  try {
    const dateStr = date.toISOString().split('T')[0];
    const response = await fetch(
      `/api/available-slots?employeeId=${props.employee.id}&serviceId=${props.service.id}&date=${dateStr}`
    );
    const data = await response.json();
    availableSlots.value = data.slots || [];
  } catch (error) {
    console.error('Failed to fetch available slots:', error);
  } finally {
    loadingSlots.value = false;
  }
}

function selectTime(time: string) {
  selectedTime.value = time;

  if (selectedDate.value) {
    // Calculate end time
    const [hours, minutes] = time.split(':').map(Number);
    const endDate = new Date(selectedDate.value);
    endDate.setHours(hours, minutes + props.duration, 0, 0);
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    emit('select', {
      date: selectedDate.value,
      time,
      endTime,
    });
  }
}

function formatDateHeader(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
</script>

<template>
  <div class="p-4">
    <!-- Calendar -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <!-- Month Navigation -->
      <div class="flex items-center justify-between mb-4">
        <button
          @click="previousMonth"
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <h3 class="font-semibold text-gray-900">{{ monthName }}</h3>
        <button
          @click="nextMonth"
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>

      <!-- Day Headers -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
          :key="day"
          class="text-center text-xs font-medium text-gray-500 py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="(date, index) in calendarDays"
          :key="index"
          @click="selectDate(date)"
          :disabled="!isDateSelectable(date)"
          :class="[
            'aspect-square flex items-center justify-center text-sm rounded-lg transition-all',
            !date ? 'invisible' : '',
            isDateSelected(date)
              ? 'bg-primary-500 text-white font-semibold'
              : isDateSelectable(date)
                ? 'hover:bg-gray-100 text-gray-900'
                : 'text-gray-300 cursor-not-allowed',
          ]"
        >
          {{ date?.getDate() }}
        </button>
      </div>
    </div>

    <!-- Time Slots -->
    <div v-if="selectedDate" class="bg-white rounded-xl border border-gray-200 p-4">
      <h3 class="font-semibold text-gray-900 mb-1">{{ formatDateHeader(selectedDate) }}</h3>
      <p class="text-sm text-gray-500 mb-4 flex items-center">
        <Clock class="w-4 h-4 mr-1" />
        {{ duration }} minutes with {{ employee.user.name }}
      </p>

      <!-- Loading -->
      <div v-if="loadingSlots" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
      </div>

      <!-- Slots Grid -->
      <div v-else-if="availableSlots.length > 0" class="grid grid-cols-3 gap-2">
        <button
          v-for="slot in availableSlots"
          :key="slot"
          @click="selectTime(slot)"
          :class="[
            'py-3 px-4 rounded-lg text-sm font-medium transition-all',
            selectedTime === slot
              ? 'bg-primary-500 text-white'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100',
          ]"
        >
          {{ slot }}
        </button>
      </div>

      <!-- No Slots -->
      <div v-else class="text-center py-8">
        <p class="text-gray-500">No available times for this date</p>
        <p class="text-sm text-gray-400 mt-1">Try selecting a different day</p>
      </div>
    </div>

    <!-- Instructions -->
    <div v-else class="text-center py-8 text-gray-500">
      <p>Select a date to see available times</p>
    </div>
  </div>
</template>
