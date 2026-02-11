<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-vue-next';
import BookingCard from './BookingCard.vue';

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  customerName: string;
  customerPhone: string;
  service: { name: string; category: string };
  employee: { title: string; user: { name: string } };
}

interface Stats {
  todayCount: number;
  upcomingCount: number;
  todaysBookings: Booking[];
  upcomingBookings: Booking[];
}

const props = defineProps<{
  subdomain: string;
}>();

const loading = ref(true);
const error = ref<string | null>(null);
const stats = ref<Stats | null>(null);
const activeTab = ref<'today' | 'upcoming' | 'all'>('today');
const allBookings = ref<Booking[]>([]);
const loadingAll = ref(false);

async function fetchStats() {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`/api/admin/stats?subdomain=${props.subdomain}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch stats');
    }

    stats.value = data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Something went wrong';
  } finally {
    loading.value = false;
  }
}

async function fetchAllBookings() {
  loadingAll.value = true;

  try {
    const response = await fetch(`/api/admin/bookings?subdomain=${props.subdomain}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch bookings');
    }

    allBookings.value = data.bookings;
  } catch (err) {
    console.error('Failed to fetch all bookings:', err);
  } finally {
    loadingAll.value = false;
  }
}

async function updateBookingStatus(bookingId: string, status: string) {
  try {
    const response = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update booking');
    }

    // Refresh data
    await fetchStats();
    if (activeTab.value === 'all') {
      await fetchAllBookings();
    }
  } catch (err) {
    console.error('Failed to update booking:', err);
  }
}

const displayedBookings = computed(() => {
  if (activeTab.value === 'today') {
    return stats.value?.todaysBookings || [];
  } else if (activeTab.value === 'upcoming') {
    return stats.value?.upcomingBookings || [];
  }
  return allBookings.value;
});

function switchTab(tab: 'today' | 'upcoming' | 'all') {
  activeTab.value = tab;
  if (tab === 'all' && allBookings.value.length === 0) {
    fetchAllBookings();
  }
}

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p class="text-sm text-gray-500">{{ subdomain }}.polished.app</p>
        </div>
        <button
          @click="fetchStats"
          :disabled="loading"
          class="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          <RefreshCw :class="['w-4 h-4', loading && 'animate-spin']" />
          Refresh
        </button>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading && !stats" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-2xl mx-auto mt-10 p-6 bg-red-50 rounded-xl text-center">
      <AlertCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p class="text-red-700">{{ error }}</p>
      <button @click="fetchStats" class="mt-4 text-red-600 underline">Try again</button>
    </div>

    <!-- Dashboard Content -->
    <main v-else class="max-w-6xl mx-auto px-6 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Today's Bookings</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats?.todayCount || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Clock class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Upcoming</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats?.upcomingCount || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Users class="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Total Bookings</p>
              <p class="text-3xl font-bold text-gray-900">{{ allBookings.length || '-' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="flex border-b border-gray-200">
          <button
            @click="switchTab('today')"
            :class="[
              'flex-1 px-6 py-4 text-sm font-medium transition-colors',
              activeTab === 'today'
                ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
            ]"
          >
            Today ({{ stats?.todayCount || 0 }})
          </button>
          <button
            @click="switchTab('upcoming')"
            :class="[
              'flex-1 px-6 py-4 text-sm font-medium transition-colors',
              activeTab === 'upcoming'
                ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
            ]"
          >
            Upcoming ({{ stats?.upcomingCount || 0 }})
          </button>
          <button
            @click="switchTab('all')"
            :class="[
              'flex-1 px-6 py-4 text-sm font-medium transition-colors',
              activeTab === 'all'
                ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
            ]"
          >
            All Bookings
          </button>
        </div>

        <!-- Bookings List -->
        <div class="p-6">
          <div v-if="loadingAll && activeTab === 'all'" class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>

          <div v-else-if="displayedBookings.length === 0" class="text-center py-10">
            <Calendar class="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">No bookings found</p>
          </div>

          <div v-else class="space-y-4">
            <BookingCard
              v-for="booking in displayedBookings"
              :key="booking.id"
              :booking="booking"
              @update-status="updateBookingStatus"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
