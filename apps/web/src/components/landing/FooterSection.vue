<script setup lang="ts">
import type { Studio } from '../../types';
import { MapPin, Phone, Mail, Clock } from 'lucide-vue-next';

defineProps<{
  studio: Studio;
}>();
</script>

<template>
  <footer id="contact" class="bg-gray-900 text-white py-16">
    <div class="max-w-7xl mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <!-- Brand -->
        <div>
          <h3 class="text-2xl font-heading font-bold mb-4">{{ studio.name }}</h3>
          <p class="text-gray-400 mb-6">
            Your destination for professional beauty services. Book online 24/7.
          </p>
          <a href="#services" class="btn-primary">
            Book Now
          </a>
        </div>

        <!-- Contact Info -->
        <div>
          <h4 class="text-lg font-semibold mb-4">Contact Us</h4>
          <ul class="space-y-3 text-gray-400">
            <li v-if="studio.address" class="flex items-start gap-3">
              <MapPin class="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <span>{{ studio.address }}</span>
            </li>
            <li v-if="studio.phone" class="flex items-center gap-3">
              <Phone class="w-5 h-5 text-primary-500 flex-shrink-0" />
              <a :href="`tel:${studio.phone}`" class="hover:text-white transition-colors">
                {{ studio.phone }}
              </a>
            </li>
            <li v-if="studio.email" class="flex items-center gap-3">
              <Mail class="w-5 h-5 text-primary-500 flex-shrink-0" />
              <a :href="`mailto:${studio.email}`" class="hover:text-white transition-colors">
                {{ studio.email }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Hours -->
        <div>
          <h4 class="text-lg font-semibold mb-4">Opening Hours</h4>
          <ul class="space-y-2 text-gray-400">
            <li class="flex justify-between">
              <span>Monday - Friday</span>
              <span>9:00 AM - 6:00 PM</span>
            </li>
            <li class="flex justify-between">
              <span>Saturday</span>
              <span>10:00 AM - 4:00 PM</span>
            </li>
            <li class="flex justify-between">
              <span>Sunday</span>
              <span>Closed</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
        <p>&copy; {{ new Date().getFullYear() }} {{ studio.name }}. All rights reserved.</p>
        <p class="mt-2">
          Powered by <a href="https://polished.app" class="text-primary-500 hover:underline">Polished</a>
        </p>
      </div>
    </div>
  </footer>
</template>
