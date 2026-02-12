<script setup lang="ts">
import { ref, computed } from 'vue';
import { getLocalizedValue, getTranslations, type Locale } from '../../i18n';
import type { LocalizedString } from '../../types/specialist';

interface PortfolioItem {
  src: string;
  alt: LocalizedString | string;
  tags: string[];
}

const props = defineProps<{
  portfolio: PortfolioItem[];
  locale: Locale;
}>();

const selectedTag = ref<string | null>(null);
const currentIndex = ref(0);

const t = computed(() => getTranslations(props.locale));

const allTags = computed(() => {
  const tags = new Set<string>();
  props.portfolio.forEach((item) => {
    item.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags);
});

const filteredPortfolio = computed(() => {
  if (!selectedTag.value) return props.portfolio;
  return props.portfolio.filter((item) => item.tags.includes(selectedTag.value!));
});

const selectTag = (tag: string | null) => {
  selectedTag.value = tag;
  currentIndex.value = 0;
};

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % filteredPortfolio.value.length;
};

const prevSlide = () => {
  currentIndex.value =
    (currentIndex.value - 1 + filteredPortfolio.value.length) %
    filteredPortfolio.value.length;
};
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Tag Filters -->
    <div class="flex flex-wrap gap-2 justify-center mb-8">
      <button
        @click="selectTag(null)"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all"
        :class="
          selectedTag === null
            ? 'bg-purple-600 text-white'
            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
        "
      >
        {{ t.common.all }}
      </button>
      <button
        v-for="tag in allTags"
        :key="tag"
        @click="selectTag(tag)"
        class="tag cursor-pointer transition-all"
        :class="
          selectedTag === tag
            ? 'bg-purple-600 text-white'
            : ''
        "
      >
        {{ tag }}
      </button>
    </div>

    <!-- Main Carousel -->
    <div class="relative">
      <!-- Image Display -->
      <div class="relative aspect-square max-w-lg mx-auto rounded-2xl overflow-hidden bg-gray-100">
        <TransitionGroup name="fade">
          <img
            v-for="(item, index) in filteredPortfolio"
            v-show="index === currentIndex"
            :key="item.src"
            :src="item.src"
            :alt="getLocalizedValue(item.alt, locale)"
            class="absolute inset-0 w-full h-full object-cover"
          />
        </TransitionGroup>

        <!-- Tags overlay -->
        <div class="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
          <span
            v-for="tag in filteredPortfolio[currentIndex]?.tags"
            :key="tag"
            class="tag bg-white/90 backdrop-blur-sm"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Navigation Arrows -->
      <button
        v-if="filteredPortfolio.length > 1"
        @click="prevSlide"
        class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-purple-600 transition-colors"
        aria-label="Previous image"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-if="filteredPortfolio.length > 1"
        @click="nextSlide"
        class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-purple-600 transition-colors"
        aria-label="Next image"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Thumbnail Grid -->
    <div class="mt-6 grid grid-cols-6 gap-2 max-w-lg mx-auto">
      <button
        v-for="(item, index) in filteredPortfolio"
        :key="item.src"
        @click="currentIndex = index"
        class="aspect-square rounded-lg overflow-hidden transition-all"
        :class="
          index === currentIndex
            ? 'ring-2 ring-purple-600 ring-offset-2'
            : 'opacity-60 hover:opacity-100'
        "
      >
        <img
          :src="item.src"
          :alt="getLocalizedValue(item.alt, locale)"
          class="w-full h-full object-cover"
        />
      </button>
    </div>

    <!-- Counter -->
    <p class="text-center mt-4 text-sm text-gray-500">
      {{ currentIndex + 1 }} / {{ filteredPortfolio.length }}
    </p>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
