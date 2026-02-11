<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ServiceWithPricing, Employee } from '../../types';
import { Star, Check, Zap } from 'lucide-vue-next';

interface EmployeeWithPricing {
  employee: Employee;
  price: number;
  duration: number;
}

const props = defineProps<{
  employees: Employee[];
  service: ServiceWithPricing;
  selected: Employee | null;
}>();

const emit = defineEmits<{
  (e: 'select', employee: Employee, price: number, duration: number): void;
}>();

const loading = ref(true);
const employeesWithPricing = ref<EmployeeWithPricing[]>([]);
const anyAvailable = ref(true);

onMounted(async () => {
  loading.value = true;

  try {
    // Fetch employees who offer this service
    const response = await fetch(`/api/service-employees?serviceId=${props.service.id}`);
    const data = await response.json();

    // Map to employees with pricing
    employeesWithPricing.value = data.employees.map((es: any) => {
      const employee = props.employees.find(e => e.id === es.employeeId);
      return employee ? { employee, price: es.price, duration: es.duration } : null;
    }).filter(Boolean);

    anyAvailable.value = employeesWithPricing.value.length > 0;
  } catch (error) {
    console.error('Failed to fetch employee services:', error);
    anyAvailable.value = false;
  } finally {
    loading.value = false;
  }
});

function selectAnyAvailable() {
  if (employeesWithPricing.value.length > 0) {
    const first = employeesWithPricing.value[0];
    emit('select', first.employee, first.price, first.duration);
  }
}
</script>

<template>
  <div class="p-4">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>

    <template v-else>
      <!-- Any Available Option -->
      <button
        v-if="anyAvailable"
        @click="selectAnyAvailable"
        class="w-full p-4 mb-4 rounded-xl border-2 border-primary-500 bg-primary-50 text-left transition-all hover:bg-primary-100"
      >
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
            <Zap class="w-6 h-6 text-white" />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-gray-900">Any Available Professional</h3>
              <span class="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">RECOMMENDED</span>
            </div>
            <p class="text-sm text-gray-600 mt-0.5">Get the earliest available time</p>
          </div>
        </div>
      </button>

      <p v-if="anyAvailable" class="text-sm text-gray-500 text-center mb-4">Or choose a specific professional:</p>

      <!-- Employee List -->
      <div class="space-y-3">
        <button
          v-for="{ employee, price, duration } in employeesWithPricing"
          :key="employee.id"
          @click="emit('select', employee, price, duration)"
          :class="[
            'w-full text-left p-4 rounded-xl border-2 transition-all',
            selected?.id === employee.id
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          ]"
        >
          <div class="flex items-center gap-3">
            <img
              :src="employee.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.id}`"
              :alt="employee.user.name"
              class="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-gray-900">{{ employee.user.name }}</h3>
                <div class="flex items-center text-yellow-500">
                  <Star class="w-4 h-4 fill-current" />
                  <span class="text-sm ml-0.5">4.9</span>
                </div>
              </div>
              <p class="text-sm text-gray-500">{{ employee.title }}</p>
              <div class="flex items-center gap-3 mt-1 text-sm">
                <span class="font-semibold text-primary-500">${{ price }}</span>
                <span class="text-gray-400">{{ duration }} min</span>
              </div>
            </div>
            <div
              v-if="selected?.id === employee.id"
              class="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center"
            >
              <Check class="w-4 h-4 text-white" />
            </div>
          </div>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="!anyAvailable" class="text-center py-8">
        <p class="text-gray-500">No professionals available for this service</p>
      </div>
    </template>
  </div>
</template>
