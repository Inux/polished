<script setup lang="ts">
import { ref } from 'vue';

interface NavItem {
  href: string;
  label: string;
}

defineProps<{
  navItems: NavItem[];
  bookLabel: string;
}>();

const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
  document.body.style.overflow = isOpen.value ? 'hidden' : '';
};

const closeMenu = () => {
  isOpen.value = false;
  document.body.style.overflow = '';
};
</script>

<template>
  <div class="md:hidden">
    <!-- Menu Toggle Button -->
    <button
      @click="toggleMenu"
      class="p-2 text-gray-600 hover:text-gray-900 transition-colors"
      :aria-expanded="isOpen"
      aria-label="Toggle menu"
    >
      <svg
        v-if="!isOpen"
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
      <svg
        v-else
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <!-- Mobile Menu Overlay -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-black/50"
        @click="closeMenu"
      />
    </Transition>

    <!-- Mobile Menu Panel -->
    <Transition name="slide">
      <div
        v-if="isOpen"
        class="fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl"
      >
        <div class="flex flex-col h-full">
          <!-- Close button -->
          <div class="flex justify-end p-4">
            <button
              @click="closeMenu"
              class="p-2 text-gray-600 hover:text-gray-900"
              aria-label="Close menu"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Navigation Links -->
          <nav class="flex-1 px-4">
            <ul class="space-y-2">
              <li v-for="item in navItems" :key="item.href">
                <a
                  :href="item.href"
                  class="block px-4 py-3 text-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  @click="closeMenu"
                >
                  {{ item.label }}
                </a>
              </li>
            </ul>
          </nav>

          <!-- CTA Button -->
          <div class="p-4 border-t">
            <a
              href="/#calendar"
              class="block w-full py-3 text-center text-white bg-gray-900 rounded-full font-medium hover:bg-gray-800 transition-colors"
              @click="closeMenu"
            >
              {{ bookLabel }}
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
