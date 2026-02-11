<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ServiceWithPricing, Employee, Studio } from '../../types';
import StepService from './StepService.vue';
import StepEmployee from './StepEmployee.vue';
import StepDateTime from './StepDateTime.vue';
import StepCustomerInfo from './StepCustomerInfo.vue';
import StepConfirm from './StepConfirm.vue';
import BookingSuccess from './BookingSuccess.vue';
import { X, ChevronLeft } from 'lucide-vue-next';

const props = defineProps<{
  studio: Studio;
  services: ServiceWithPricing[];
  employees: Employee[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// Booking state
const currentStep = ref(1);
const selectedService = ref<ServiceWithPricing | null>(null);
const selectedEmployee = ref<Employee | null>(null);
const selectedDateTime = ref<{ date: Date; time: string; endTime: string } | null>(null);
const customerInfo = ref({
  name: '',
  phone: '',
  email: '',
  notes: '',
});
const bookingPrice = ref(0);
const bookingDuration = ref(0);
const bookingResult = ref<any>(null);
const isSubmitting = ref(false);
const error = ref<string | null>(null);

const totalSteps = 5;

const stepTitles = [
  'Choose Service',
  'Choose Professional',
  'Select Date & Time',
  'Your Information',
  'Confirm Booking',
];

// Computed
const canGoNext = computed(() => {
  switch (currentStep.value) {
    case 1: return selectedService.value !== null;
    case 2: return selectedEmployee.value !== null;
    case 3: return selectedDateTime.value !== null;
    case 4: return customerInfo.value.name && customerInfo.value.phone;
    case 5: return true;
    default: return false;
  }
});

// Methods
function goBack() {
  if (currentStep.value > 1) {
    currentStep.value--;
    error.value = null;
  }
}

function goNext() {
  if (canGoNext.value && currentStep.value < totalSteps) {
    currentStep.value++;
    error.value = null;
  }
}

function handleServiceSelect(service: ServiceWithPricing) {
  selectedService.value = service;
  // Reset downstream selections
  selectedEmployee.value = null;
  selectedDateTime.value = null;
  goNext();
}

function handleEmployeeSelect(employee: Employee, price: number, duration: number) {
  selectedEmployee.value = employee;
  bookingPrice.value = price;
  bookingDuration.value = duration;
  goNext();
}

function handleDateTimeSelect(dateTime: { date: Date; time: string; endTime: string }) {
  selectedDateTime.value = dateTime;
  goNext();
}

function handleCustomerInfoSubmit(info: typeof customerInfo.value) {
  customerInfo.value = info;
  goNext();
}

async function handleConfirmBooking() {
  if (!selectedService.value || !selectedEmployee.value || !selectedDateTime.value) {
    return;
  }

  isSubmitting.value = true;
  error.value = null;

  try {
    // Parse the time string to create full datetime
    const [hours, minutes] = selectedDateTime.value.time.split(':').map(Number);
    const startTime = new Date(selectedDateTime.value.date);
    startTime.setHours(hours, minutes, 0, 0);

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studioId: props.studio.id,
        serviceId: selectedService.value.id,
        employeeId: selectedEmployee.value.id,
        startTime: startTime.toISOString(),
        customerName: customerInfo.value.name,
        customerPhone: customerInfo.value.phone,
        customerEmail: customerInfo.value.email || undefined,
        notes: customerInfo.value.notes || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create booking');
    }

    bookingResult.value = data.booking;
    currentStep.value = 6; // Success step
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Something went wrong';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
    <div class="bg-white w-full max-w-lg max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <button
          v-if="currentStep > 1 && currentStep <= 5"
          @click="goBack"
          class="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div v-else class="w-9" />

        <div class="text-center">
          <p class="text-sm text-gray-500" v-if="currentStep <= 5">Step {{ currentStep }} of {{ totalSteps }}</p>
          <h2 class="font-semibold text-gray-900" v-if="currentStep <= 5">{{ stepTitles[currentStep - 1] }}</h2>
        </div>

        <button @click="emit('close')" class="p-2 -mr-2 text-gray-600 hover:text-gray-900">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Progress Bar -->
      <div v-if="currentStep <= 5" class="h-1 bg-gray-200">
        <div
          class="h-full bg-primary-500 transition-all duration-300"
          :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
        />
      </div>

      <!-- Error Message -->
      <div v-if="error" class="px-4 py-3 bg-red-50 border-b border-red-100">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto">
        <StepService
          v-if="currentStep === 1"
          :services="services"
          :selected="selectedService"
          @select="handleServiceSelect"
        />

        <StepEmployee
          v-else-if="currentStep === 2"
          :employees="employees"
          :service="selectedService!"
          :selected="selectedEmployee"
          @select="handleEmployeeSelect"
        />

        <StepDateTime
          v-else-if="currentStep === 3"
          :employee="selectedEmployee!"
          :service="selectedService!"
          :duration="bookingDuration"
          @select="handleDateTimeSelect"
        />

        <StepCustomerInfo
          v-else-if="currentStep === 4"
          :initial="customerInfo"
          @submit="handleCustomerInfoSubmit"
        />

        <StepConfirm
          v-else-if="currentStep === 5"
          :studio="studio"
          :service="selectedService!"
          :employee="selectedEmployee!"
          :date-time="selectedDateTime!"
          :customer="customerInfo"
          :price="bookingPrice"
          :duration="bookingDuration"
          :is-submitting="isSubmitting"
          @confirm="handleConfirmBooking"
        />

        <BookingSuccess
          v-else-if="currentStep === 6"
          :booking="bookingResult"
          :studio="studio"
          @close="emit('close')"
        />
      </div>
    </div>
  </div>
</template>
