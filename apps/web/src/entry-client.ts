/**
 * Vue 3 Client Entry Point (Hydration)
 *
 * This file runs in the browser and hydrates the server-rendered HTML,
 * making it interactive.
 */

import { createApp } from 'vue';
import App from './App.vue';
import './styles/main.css';
import type { LandingPageData } from './types';

// Get studio data injected by server
declare global {
  interface Window {
    __STUDIO_DATA__?: LandingPageData;
  }
}

const studioData = window.__STUDIO_DATA__;

// Create app and mount
const app = createApp(App, { studioData });
app.mount('#app');
