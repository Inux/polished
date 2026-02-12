<script setup lang="ts">
import { ref, computed } from 'vue';
import { getTranslations, getLocalizedValue, type Locale } from '../../i18n';
import { getAllSpecialists, getBookingSettings, getHolidays } from '../../utils/specialists';

const props = defineProps<{
  locale: Locale;
}>();

const t = getTranslations(props.locale);

const specialists = getAllSpecialists();
const bookingSettings = getBookingSettings();
const holidays = getHolidays();

const selectedOwner = ref<'massage-wellness' | 'nail-art'>('massage-wellness');
const selectedDate = ref<string>('');

const owners = specialists.map((specialist) => ({
  id: specialist.id as 'massage-wellness' | 'nail-art',
  name: getLocalizedValue(specialist.name, props.locale),
  whatsapp: specialist.contact.whatsapp,
  availability: specialist.availability,
}));

const today = new Date();
const minDate = computed(() => {
  const date = new Date(today);
  date.setHours(date.getHours() + bookingSettings.minAdvanceHours);
  return date.toISOString().split('T')[0];
});

const maxDate = computed(() => {
  const date = new Date(today);
  date.setDate(date.getDate() + bookingSettings.maxAdvanceDays);
  return date.toISOString().split('T')[0];
});

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

const getWorkingHoursForDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const dayName = dayNames[date.getDay()];
  const owner = owners.find((o) => o.id === selectedOwner.value);

  if (!owner) return null;

  // Check for exceptions (holidays)
  const exception = holidays.find(
    (e) => e.date === dateStr && (e.owner === 'all' || e.owner === selectedOwner.value)
  );

  if (exception) {
    if (exception.type === 'closed') {
      return null;
    }
  }

  return owner.availability.defaultWorkingHours[dayName];
};

const selectedDateHours = computed(() => {
  if (!selectedDate.value) return null;
  return getWorkingHoursForDate(selectedDate.value);
});

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(
    props.locale === 'de' ? 'de-CH' : props.locale === 'fr' ? 'fr-CH' : 'en-US',
    { weekday: 'long', day: 'numeric', month: 'long' }
  );
};

const selectedOwnerData = computed(() => owners.find((o) => o.id === selectedOwner.value)!);

const whatsappUrl = computed(() => {
  const phone = selectedOwnerData.value.whatsapp.replace(/[^0-9]/g, '');
  let message = t.whatsapp.greeting;

  if (selectedDate.value && selectedDateHours.value) {
    const formattedDate = formatDate(selectedDate.value);
    message = `${t.whatsapp.greeting} (${formattedDate})`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
});
</script>

<template>
  <section id="calendar" class="py-20 bg-white">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
          {{ t.calendar.title }}
        </h2>
        <p class="text-lg text-gray-500 max-w-2xl mx-auto">
          {{ t.calendar.subtitle }}
        </p>
      </div>

      <div class="max-w-2xl mx-auto">
        <div class="bg-gray-50 rounded-2xl p-8">
          <!-- Owner Selection -->
          <div class="mb-8">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              {{ t.calendar.selectOwner }}
            </label>
            <div class="grid grid-cols-2 gap-4">
              <button
                v-for="owner in owners"
                :key="owner.id"
                @click="selectedOwner = owner.id"
                class="p-4 rounded-xl border-2 transition-all text-left"
                :class="
                  selectedOwner === owner.id
                    ? owner.id === 'massage-wellness'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                "
              >
                <span class="font-medium text-gray-900">{{ owner.name }}</span>
              </button>
            </div>
          </div>

          <!-- Date Selection -->
          <div class="mb-8">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              {{ t.calendar.selectDate }}
            </label>
            <input
              type="date"
              v-model="selectedDate"
              :min="minDate"
              :max="maxDate"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
            />
          </div>

          <!-- Availability Display -->
          <div v-if="selectedDate" class="mb-8">
            <div
              v-if="selectedDateHours"
              class="p-4 bg-green-50 border border-green-200 rounded-xl"
            >
              <div class="flex items-center gap-2 text-green-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium">{{ t.calendar.available }}</span>
              </div>
              <p class="mt-2 text-green-600 text-sm">
                {{ formatDate(selectedDate) }}: {{ selectedDateHours.start }} - {{ selectedDateHours.end }}
              </p>
            </div>
            <div
              v-else
              class="p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <div class="flex items-center gap-2 text-red-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium">{{ t.calendar.closed }}</span>
              </div>
              <p class="mt-2 text-red-600 text-sm">
                {{ formatDate(selectedDate) }}
              </p>
            </div>
          </div>

          <!-- Book Button -->
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-white rounded-xl font-medium transition-all hover:scale-[1.02]"
            :class="
              selectedOwner === 'massage-wellness'
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-purple-500 hover:bg-purple-600'
            "
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {{ t.calendar.bookViaWhatsApp }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
