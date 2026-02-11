<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getTranslations, getLocalizedValue, type Locale } from '../../i18n';
import testimonials from '../../data/testimonials.json';

const props = defineProps<{
  locale: Locale;
}>();

const t = getTranslations(props.locale);

const currentIndex = ref(0);
const isAutoPlaying = ref(true);
let intervalId: ReturnType<typeof setInterval> | null = null;

const localizedTestimonials = computed(() =>
  testimonials.testimonials.map((item) => ({
    ...item,
    text: getLocalizedValue(item.text, props.locale),
  }))
);

const displayCount = testimonials.settings.displayCount;
const visibleTestimonials = computed(() =>
  localizedTestimonials.value.slice(0, displayCount)
);

const nextSlide = () => {
  currentIndex.value =
    (currentIndex.value + 1) % visibleTestimonials.value.length;
};

const prevSlide = () => {
  currentIndex.value =
    (currentIndex.value - 1 + visibleTestimonials.value.length) %
    visibleTestimonials.value.length;
};

const goToSlide = (index: number) => {
  currentIndex.value = index;
  resetAutoPlay();
};

const resetAutoPlay = () => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  if (isAutoPlaying.value) {
    intervalId = setInterval(nextSlide, testimonials.settings.autoRotateSeconds * 1000);
  }
};

onMounted(() => {
  resetAutoPlay();
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

const renderStars = (rating: number) => {
  return Array(5)
    .fill(0)
    .map((_, i) => i < rating);
};
</script>

<template>
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
          {{ t.testimonials.title }}
        </h2>
        <p class="text-lg text-gray-500 max-w-2xl mx-auto">
          {{ t.testimonials.subtitle }}
        </p>
      </div>

      <!-- Carousel -->
      <div class="relative max-w-4xl mx-auto">
        <!-- Testimonial Cards -->
        <div class="overflow-hidden">
          <div
            class="flex transition-transform duration-500 ease-out"
            :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
          >
            <div
              v-for="testimonial in visibleTestimonials"
              :key="testimonial.id"
              class="w-full flex-shrink-0 px-4"
            >
              <div class="bg-white rounded-2xl p-8 shadow-sm">
                <!-- Stars -->
                <div
                  v-if="testimonials.settings.showRatings"
                  class="flex gap-1 mb-4"
                >
                  <svg
                    v-for="(filled, i) in renderStars(testimonial.rating)"
                    :key="i"
                    class="w-5 h-5"
                    :class="filled ? 'text-amber-400' : 'text-gray-200'"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                </div>

                <!-- Quote -->
                <blockquote class="text-lg text-gray-700 mb-6 leading-relaxed">
                  "{{ testimonial.text }}"
                </blockquote>

                <!-- Author -->
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold text-gray-900">
                      {{ testimonial.author }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ testimonial.location }}
                    </p>
                  </div>
                  <div
                    v-if="testimonials.settings.showDates"
                    class="text-sm text-gray-400"
                  >
                    {{
                      new Date(testimonial.date).toLocaleDateString(
                        props.locale === 'de'
                          ? 'de-CH'
                          : props.locale === 'fr'
                            ? 'fr-CH'
                            : 'en-US',
                        { month: 'short', year: 'numeric' }
                      )
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Arrows -->
        <button
          @click="prevSlide"
          class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Previous testimonial"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          @click="nextSlide"
          class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Next testimonial"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <!-- Dots -->
        <div class="flex justify-center gap-2 mt-8">
          <button
            v-for="(_, index) in visibleTestimonials"
            :key="index"
            @click="goToSlide(index)"
            class="w-2 h-2 rounded-full transition-all"
            :class="
              index === currentIndex
                ? 'bg-gray-900 w-6'
                : 'bg-gray-300 hover:bg-gray-400'
            "
            :aria-label="`Go to testimonial ${index + 1}`"
          />
        </div>
      </div>
    </div>
  </section>
</template>
