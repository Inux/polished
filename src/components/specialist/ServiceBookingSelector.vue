<script setup lang="ts">
import { ref, computed } from 'vue';
import { getLocalizedValue, type Locale } from '../../i18n';
import type { Service, Specialist, ServiceVariant, ServiceExtra } from '../../types/specialist';
import { getServiceVariants } from '../../utils/specialists';

const props = defineProps<{
  service: Service;
  specialist: Specialist;
  locale: Locale;
  translations: {
    duration: string;
    extras: string;
    total: string;
    bookNow: string;
    minutes: string;
  };
}>();

const variants = getServiceVariants(props.service);
const extras = props.service.extras || [];

const selectedVariantIndex = ref(0);
const selectedExtras = ref<string[]>([]);

const selectedVariant = computed<ServiceVariant | undefined>(() => variants[selectedVariantIndex.value]);

const extrasTotal = computed(() => {
  return extras
    .filter((e) => selectedExtras.value.includes(e.id))
    .reduce((sum, e) => sum + e.price, 0);
});

const totalPrice = computed(() => {
  return (selectedVariant.value?.price || 0) + extrasTotal.value;
});

const toggleExtra = (extraId: string) => {
  const index = selectedExtras.value.indexOf(extraId);
  if (index === -1) {
    selectedExtras.value.push(extraId);
  } else {
    selectedExtras.value.splice(index, 1);
  }
};

const serviceName = computed(() => getLocalizedValue(props.service.name, props.locale));

const whatsappMessage = computed(() => {
  const lines = [
    `Hallo! Ich möchte einen Termin buchen:`,
    ``,
    `Service: ${serviceName.value}`,
    `Dauer: ${selectedVariant.value?.duration} ${props.translations.minutes}`,
  ];

  if (selectedExtras.value.length > 0) {
    const extraNames = extras
      .filter((e) => selectedExtras.value.includes(e.id))
      .map((e) => getLocalizedValue(e.name, props.locale))
      .join(', ');
    lines.push(`Extras: ${extraNames}`);
  }

  lines.push(`Geschätzter Preis: ${props.service.currency} ${totalPrice.value}`);
  lines.push(``);
  lines.push(`Vielen Dank!`);

  return lines.join('\n');
});

const whatsappUrl = computed(() => {
  const phone = props.specialist.contact.whatsapp.replace(/[^0-9]/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage.value)}`;
});
</script>

<template>
  <div class="service-booking-selector p-4 rounded-xl" style="background: var(--color-bg-secondary);">
    <!-- Duration Selection -->
    <div v-if="variants.length > 1" class="mb-4">
      <label class="block text-sm font-medium mb-2" style="color: var(--color-text-secondary);">
        {{ translations.duration }}
      </label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="(variant, index) in variants"
          :key="index"
          @click="selectedVariantIndex = index"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          :style="{
            background: selectedVariantIndex === index ? 'var(--color-primary-500)' : 'var(--color-bg-primary)',
            color: selectedVariantIndex === index ? 'white' : 'var(--color-text-primary)',
            border: `1px solid ${selectedVariantIndex === index ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
          }"
        >
          {{ variant.duration }} {{ translations.minutes }} - {{ service.currency }} {{ variant.price }}
        </button>
      </div>
    </div>

    <!-- Single variant display -->
    <div v-else class="mb-4 p-3 rounded-lg" style="background: var(--color-bg-primary);">
      <div class="flex justify-between items-center">
        <span class="text-sm" style="color: var(--color-text-muted);">
          {{ variants[0]?.duration }} {{ translations.minutes }}
        </span>
        <span class="font-bold" style="color: var(--color-primary-600);">
          {{ service.currency }} {{ variants[0]?.price }}
        </span>
      </div>
    </div>

    <!-- Extras Selection -->
    <div v-if="extras.length > 0" class="mb-4">
      <label class="block text-sm font-medium mb-2" style="color: var(--color-text-secondary);">
        {{ translations.extras }}
      </label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="extra in extras"
          :key="extra.id"
          @click="toggleExtra(extra.id)"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          :style="{
            background: selectedExtras.includes(extra.id) ? 'var(--color-primary-100)' : 'var(--color-bg-primary)',
            color: selectedExtras.includes(extra.id) ? 'var(--color-primary-700)' : 'var(--color-text-secondary)',
            border: `1px solid ${selectedExtras.includes(extra.id) ? 'var(--color-primary-300)' : 'var(--color-border)'}`,
          }"
        >
          {{ getLocalizedValue(extra.name, locale) }} +{{ extra.price }}
        </button>
      </div>
    </div>

    <!-- Total & Book Button -->
    <div class="flex items-center justify-between pt-4" style="border-top: 1px solid var(--color-border);">
      <div>
        <span class="text-xs" style="color: var(--color-text-muted);">{{ translations.total }}</span>
        <span class="text-xl font-bold ml-2" style="color: var(--color-primary-600);">
          {{ service.currency }} {{ totalPrice }}
        </span>
      </div>
      <a
        :href="whatsappUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
        style="background: var(--color-primary-500); color: white;"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        {{ translations.bookNow }}
      </a>
    </div>
  </div>
</template>
