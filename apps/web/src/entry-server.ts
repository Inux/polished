/**
 * Vue 3 SSR Entry Point (Server)
 *
 * This file is used by the Bun server to render Vue components server-side.
 * The rendered HTML is sent to the client, then hydrated for interactivity.
 */

import { createSSRApp } from 'vue';
import App from './App.vue';

export interface StudioData {
  name: string;
  subdomain: string;
}

export function createApp(studioData?: StudioData) {
  const app = createSSRApp(App, { studioData });
  return app;
}
