<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getTranslations, type Locale } from '../../i18n';

const props = defineProps<{
  locale: Locale;
}>();

const t = getTranslations(props.locale);

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const showBanner = ref(false);
const showDetails = ref(false);
const preferences = ref<CookiePreferences>({
  necessary: true,
  analytics: false,
  marketing: false,
});

const COOKIE_KEY = 'polished_cookie_consent';

onMounted(() => {
  const stored = localStorage.getItem(COOKIE_KEY);
  if (!stored) {
    showBanner.value = true;
  } else {
    try {
      preferences.value = JSON.parse(stored);
    } catch {
      showBanner.value = true;
    }
  }
});

const acceptAll = () => {
  preferences.value = {
    necessary: true,
    analytics: true,
    marketing: true,
  };
  saveAndClose();
};

const rejectAll = () => {
  preferences.value = {
    necessary: true,
    analytics: false,
    marketing: false,
  };
  saveAndClose();
};

const savePreferences = () => {
  saveAndClose();
};

const saveAndClose = () => {
  localStorage.setItem(COOKIE_KEY, JSON.stringify(preferences.value));
  showBanner.value = false;
  window.dispatchEvent(
    new CustomEvent('cookie-consent', {
      detail: preferences.value,
    })
  );
};
</script>

<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div
        v-if="showBanner"
        class="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl border-t border-gray-200"
        role="dialog"
        aria-labelledby="cookie-title"
        aria-modal="true"
      >
        <div class="container mx-auto px-4 py-6">
          <div class="flex flex-col lg:flex-row lg:items-center gap-4">
            <div class="flex-1">
              <h2
                id="cookie-title"
                class="text-lg font-semibold text-gray-900 mb-2"
              >
                {{ t.cookies.title }}
              </h2>
              <p class="text-gray-600 text-sm">
                {{ t.cookies.description }}
                <button
                  @click="showDetails = !showDetails"
                  class="text-gray-900 underline ml-1 hover:no-underline"
                >
                  {{ showDetails ? t.cookies.hideDetails : t.cookies.learnMore }}
                </button>
              </p>

              <!-- Detailed preferences -->
              <Transition name="fade">
                <div v-if="showDetails" class="mt-4 space-y-3">
                  <label class="flex items-start gap-3 cursor-not-allowed">
                    <input
                      type="checkbox"
                      :checked="true"
                      disabled
                      class="mt-1 rounded border-gray-300"
                    />
                    <span class="text-sm">
                      <strong class="text-gray-900">{{
                        t.cookies.necessary
                      }}</strong>
                      <span class="text-gray-500 block">{{
                        t.cookies.necessaryDesc
                      }}</span>
                    </span>
                  </label>
                  <label class="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="preferences.analytics"
                      class="mt-1 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    <span class="text-sm">
                      <strong class="text-gray-900">{{
                        t.cookies.analytics
                      }}</strong>
                      <span class="text-gray-500 block">{{
                        t.cookies.analyticsDesc
                      }}</span>
                    </span>
                  </label>
                  <label class="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="preferences.marketing"
                      class="mt-1 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    <span class="text-sm">
                      <strong class="text-gray-900">{{
                        t.cookies.marketing
                      }}</strong>
                      <span class="text-gray-500 block">{{
                        t.cookies.marketingDesc
                      }}</span>
                    </span>
                  </label>
                </div>
              </Transition>
            </div>

            <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                @click="rejectAll"
                class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                {{ t.cookies.rejectAll }}
              </button>
              <button
                v-if="showDetails"
                @click="savePreferences"
                class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                {{ t.cookies.savePreferences }}
              </button>
              <button
                @click="acceptAll"
                class="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                {{ t.cookies.acceptAll }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
