<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { locales, localeNames, getLocalizedUrl, type Locale } from '../../i18n';

const props = defineProps<{
  locale: Locale;
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};

const switchLanguage = (newLocale: Locale) => {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    const newUrl = getLocalizedUrl(url, newLocale);
    window.location.href = newUrl;
  }
  closeDropdown();
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="toggleDropdown"
      class="flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
      :aria-expanded="isOpen"
      aria-haspopup="true"
    >
      <span class="uppercase">{{ locale }}</span>
      <svg
        class="w-4 h-4 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
      >
        <button
          v-for="loc in locales"
          :key="loc"
          @click="switchLanguage(loc)"
          class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
          :class="{
            'text-gray-900 font-medium': loc === locale,
            'text-gray-600': loc !== locale,
          }"
        >
          {{ localeNames[loc] }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
