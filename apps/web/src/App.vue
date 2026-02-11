<template>
  <div class="min-h-screen bg-white">
    <HeroSection :studio="pageData.studio" @book="openBooking" />
    <ServicesSection
      :services="pageData.services"
      :categories="pageData.categories"
      @select="handleServiceSelect"
    />
    <TeamSection :employees="pageData.employees" />
    <FooterSection :studio="pageData.studio" />

    <!-- Booking Wizard Modal -->
    <BookingWizard
      v-if="showBooking"
      :studio="fullStudio"
      :services="fullServices"
      :employees="fullEmployees"
      @close="closeBooking"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import HeroSection from './components/landing/HeroSection.vue';
import ServicesSection from './components/landing/ServicesSection.vue';
import TeamSection from './components/landing/TeamSection.vue';
import FooterSection from './components/landing/FooterSection.vue';
import BookingWizard from './components/booking/BookingWizard.vue';
import type { LandingPageData } from './types';
import type { Studio, ServiceWithPricing, Employee } from './types/index';

interface Props {
  studioData?: LandingPageData;
}

const props = defineProps<Props>();

// Default data for development/preview
const defaultData: LandingPageData = {
  studio: {
    id: 'demo',
    subdomain: 'demo',
    name: 'Milan Beauty Studio',
    slug: 'milan-beauty-studio',
    logoUrl: null,
    theme: {
      primaryColor: '#ff6b6b',
      secondaryColor: '#4ecdc4',
      font: 'Inter',
    },
    phone: '+1 (555) 123-4567',
    email: 'hello@milanbeauty.com',
    address: '123 Main Street, Milan, IT 20121',
  },
  services: [
    {
      id: '1',
      name: 'Gel Manicure',
      description: 'Long-lasting gel polish with expert application. Includes nail shaping, cuticle care, and your choice of color.',
      category: 'Nails',
      imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80',
      minPrice: 65,
      maxPrice: 65,
      minDuration: 60,
      maxDuration: 60,
      employeeCount: 3,
    },
    {
      id: '2',
      name: 'Classic Pedicure',
      description: 'Relaxing foot treatment with exfoliation, massage, and polish application.',
      category: 'Nails',
      imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&q=80',
      minPrice: 55,
      maxPrice: 55,
      minDuration: 45,
      maxDuration: 45,
      employeeCount: 2,
    },
    {
      id: '3',
      name: 'Nail Art',
      description: 'Custom nail art designs from simple accents to intricate patterns.',
      category: 'Nails',
      imageUrl: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&q=80',
      minPrice: 25,
      maxPrice: 75,
      minDuration: 30,
      maxDuration: 60,
      employeeCount: 2,
    },
    {
      id: '4',
      name: 'Haircut & Styling',
      description: 'Professional cut and style tailored to your face shape and lifestyle.',
      category: 'Hair',
      imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
      minPrice: 75,
      maxPrice: 120,
      minDuration: 45,
      maxDuration: 90,
      employeeCount: 2,
    },
    {
      id: '5',
      name: 'Facial Treatment',
      description: 'Deep cleansing facial with customized treatment for your skin type.',
      category: 'Skincare',
      imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80',
      minPrice: 95,
      maxPrice: 150,
      minDuration: 60,
      maxDuration: 90,
      employeeCount: 1,
    },
    {
      id: '6',
      name: 'Full Body Massage',
      description: 'Relaxing full body massage to relieve tension and stress.',
      category: 'Massage',
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80',
      minPrice: 120,
      maxPrice: 180,
      minDuration: 60,
      maxDuration: 90,
      employeeCount: 1,
    },
  ],
  employees: [
    {
      id: '1',
      title: 'Nail Specialist',
      bio: '10 years experience in nail art and gel applications',
      photoUrl: null,
      user: { name: 'Sarah Martinez', email: 'sarah@milanbeauty.com' },
    },
    {
      id: '2',
      title: 'Hair Stylist',
      bio: 'Expert in modern cuts and color techniques',
      photoUrl: null,
      user: { name: 'Lisa Chen', email: 'lisa@milanbeauty.com' },
    },
    {
      id: '3',
      title: 'Nail Technician',
      bio: 'Specialized in intricate nail art designs',
      photoUrl: null,
      user: { name: 'Mike Johnson', email: 'mike@milanbeauty.com' },
    },
    {
      id: '4',
      title: 'Esthetician',
      bio: 'Licensed skincare specialist',
      photoUrl: null,
      user: { name: 'Emma Wilson', email: 'emma@milanbeauty.com' },
    },
  ],
  categories: ['Nails', 'Hair', 'Skincare', 'Massage'],
};

// Use provided data or defaults
const pageData = props.studioData ?? defaultData;

// Booking state
const showBooking = ref(false);

// Convert page data to full types for booking wizard
const fullStudio = computed((): Studio => ({
  id: pageData.studio.id,
  name: pageData.studio.name,
  subdomain: pageData.studio.subdomain,
  email: pageData.studio.email ?? null,
  phone: pageData.studio.phone ?? null,
  address: pageData.studio.address ?? null,
  description: null,
  theme: pageData.studio.theme,
  timezone: 'Europe/Rome',
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const fullServices = computed((): ServiceWithPricing[] =>
  pageData.services.map(s => ({
    id: s.id,
    studioId: pageData.studio.id,
    name: s.name,
    description: s.description ?? null,
    category: s.category,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    minPrice: s.minPrice ?? null,
    maxPrice: s.maxPrice ?? null,
    minDuration: s.minDuration ?? null,
    maxDuration: s.maxDuration ?? null,
    employeeCount: s.employeeCount,
  }))
);

const fullEmployees = computed((): Employee[] =>
  pageData.employees.map(e => ({
    id: e.id,
    studioId: pageData.studio.id,
    userId: e.id,
    title: e.title,
    bio: e.bio ?? null,
    photoUrl: e.photoUrl ?? null,
    workingHours: {},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: e.id,
      email: e.user.email,
      name: e.user.name,
      role: 'EMPLOYEE' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }))
);

function openBooking() {
  showBooking.value = true;
  document.body.style.overflow = 'hidden';
}

function closeBooking() {
  showBooking.value = false;
  document.body.style.overflow = '';
}

function handleServiceSelect(service: ServiceWithPricing) {
  openBooking();
}
</script>

<style>
@import './styles/main.css';
</style>
