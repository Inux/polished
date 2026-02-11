<script setup lang="ts">
import { ref, computed } from 'vue';
import { User, Phone, Mail, MessageSquare } from 'lucide-vue-next';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const props = defineProps<{
  initial: CustomerInfo;
}>();

const emit = defineEmits<{
  (e: 'submit', info: CustomerInfo): void;
}>();

const form = ref<CustomerInfo>({
  name: props.initial.name,
  phone: props.initial.phone,
  email: props.initial.email,
  notes: props.initial.notes,
});

const errors = ref<Partial<Record<keyof CustomerInfo, string>>>({});

const isValid = computed(() => {
  return form.value.name.trim().length >= 2 && form.value.phone.trim().length >= 7;
});

function validateForm(): boolean {
  errors.value = {};

  if (!form.value.name.trim()) {
    errors.value.name = 'Name is required';
  } else if (form.value.name.trim().length < 2) {
    errors.value.name = 'Name must be at least 2 characters';
  }

  if (!form.value.phone.trim()) {
    errors.value.phone = 'Phone number is required';
  } else if (form.value.phone.trim().length < 7) {
    errors.value.phone = 'Please enter a valid phone number';
  }

  if (form.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address';
  }

  return Object.keys(errors.value).length === 0;
}

function handleSubmit() {
  if (validateForm()) {
    emit('submit', { ...form.value });
  }
}
</script>

<template>
  <div class="p-4">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User class="h-5 w-5 text-gray-400" />
          </div>
          <input
            v-model="form.name"
            type="text"
            placeholder="Your full name"
            :class="[
              'w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all',
              errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-primary-500',
            ]"
          />
        </div>
        <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
      </div>

      <!-- Phone -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Phone Number <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone class="h-5 w-5 text-gray-400" />
          </div>
          <input
            v-model="form.phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            :class="[
              'w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all',
              errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-primary-500',
            ]"
          />
        </div>
        <p v-if="errors.phone" class="mt-1 text-sm text-red-500">{{ errors.phone }}</p>
        <p class="mt-1 text-xs text-gray-500">We'll send booking confirmation via WhatsApp</p>
      </div>

      <!-- Email (Optional) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Email <span class="text-gray-400">(optional)</span>
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail class="h-5 w-5 text-gray-400" />
          </div>
          <input
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
            :class="[
              'w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all',
              errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-primary-500',
            ]"
          />
        </div>
        <p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
      </div>

      <!-- Notes (Optional) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Special Requests <span class="text-gray-400">(optional)</span>
        </label>
        <div class="relative">
          <div class="absolute top-3 left-3 pointer-events-none">
            <MessageSquare class="h-5 w-5 text-gray-400" />
          </div>
          <textarea
            v-model="form.notes"
            rows="3"
            placeholder="Any special requests or notes..."
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="!isValid"
        :class="[
          'w-full py-4 rounded-xl font-semibold transition-all',
          isValid
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed',
        ]"
      >
        Continue to Confirmation
      </button>

      <p class="text-xs text-center text-gray-500">
        By continuing, you agree to receive booking notifications
      </p>
    </form>
  </div>
</template>
