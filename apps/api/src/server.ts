/**
 * Polished API Server (Bun)
 *
 * Main server that handles:
 * - tRPC API endpoints
 * - Vue 3 SSR for public landing pages
 * - Static file serving for SPAs
 */

import { serve } from 'bun';
import {
  db,
  testConnection,
  getStudioBySubdomain,
  getEmployeesByStudioId,
  getServicesWithPricing,
  getServiceCategories,
  getAvailableSlots,
  getEmployeeService,
  getEmployeesForService,
  createBooking,
  getBookingWithDetails,
  type CreateBookingInput,
} from '@polished/database';
import {
  sendBookingConfirmation,
  sendStudioNotification,
  sendStatusChangeNotification,
} from './services/whatsapp';

const PORT = Number(process.env.API_PORT) || 3001;

// Test database connection on startup
await testConnection();

/**
 * Get landing page data for a studio
 */
async function getLandingPageData(subdomain: string) {
  const studio = await getStudioBySubdomain(subdomain);
  if (!studio) return null;

  const [employees, services, categories] = await Promise.all([
    getEmployeesByStudioId(studio.id),
    getServicesWithPricing(studio.id),
    getServiceCategories(studio.id),
  ]);

  return {
    studio,
    employees,
    services,
    categories,
  };
}

/**
 * Generate HTML for landing page
 */
function generateLandingHTML(data: Awaited<ReturnType<typeof getLandingPageData>>) {
  if (!data) {
    return `<!DOCTYPE html>
    <html>
      <head><title>Studio Not Found</title></head>
      <body>
        <h1>Studio Not Found</h1>
        <p>The studio you're looking for doesn't exist.</p>
      </body>
    </html>`;
  }

  const { studio, services, employees, categories } = data;

  // Generate service cards HTML
  const serviceCards = services.map(s => `
    <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 16px;">
      <div style="padding: 20px;">
        <h3 style="margin: 0 0 8px; font-size: 18px;">${s.name}</h3>
        <p style="color: #666; font-size: 14px; margin: 0 0 12px;">${s.description || ''}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: bold; color: #ff6b6b; font-size: 18px;">
            ${s.minPrice ? `$${s.minPrice}` : 'Price on request'}
          </span>
          <span style="color: #888; font-size: 14px;">
            ${s.minDuration ? `${s.minDuration} min` : ''}
          </span>
        </div>
      </div>
    </div>
  `).join('');

  // Generate employee cards HTML
  const employeeCards = employees.map(e => `
    <div style="text-align: center; padding: 16px;">
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${e.id}"
           alt="${e.user.name}"
           style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 12px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h4 style="margin: 0 0 4px; font-size: 16px;">${e.user.name}</h4>
      <p style="color: #666; font-size: 14px; margin: 0;">${e.title}</p>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${studio.name} - Book Your Appointment</title>
  <meta name="description" content="Book your next beauty appointment at ${studio.name}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; color: #1a1a1a; line-height: 1.6; }
    h1, h2, h3 { font-family: 'Poppins', sans-serif; }
    .hero {
      background: linear-gradient(135deg, ${studio.theme.primaryColor} 0%, ${studio.theme.secondaryColor} 100%);
      color: white;
      padding: 80px 20px;
      text-align: center;
    }
    .hero h1 { font-size: 48px; margin-bottom: 16px; }
    .hero p { font-size: 20px; opacity: 0.9; margin-bottom: 32px; }
    .btn {
      display: inline-block;
      padding: 16px 32px;
      background: white;
      color: ${studio.theme.primaryColor};
      border-radius: 50px;
      font-weight: 600;
      text-decoration: none;
      transition: transform 0.2s;
    }
    .btn:hover { transform: translateY(-2px); }
    section { padding: 60px 20px; max-width: 1200px; margin: 0 auto; }
    .section-title { text-align: center; font-size: 32px; margin-bottom: 40px; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }
    footer { background: #1a1a1a; color: white; padding: 40px 20px; text-align: center; }
    footer a { color: ${studio.theme.primaryColor}; }
  </style>
</head>
<body>
  <!-- Hero Section -->
  <section class="hero">
    <h1>${studio.name}</h1>
    <p>Book your next beauty appointment online</p>
    <a href="#services" class="btn">View Services</a>
  </section>

  <!-- Services Section -->
  <section id="services">
    <h2 class="section-title">Our Services</h2>
    <p style="text-align: center; color: #666; margin-bottom: 32px;">
      Categories: ${categories.join(' • ')}
    </p>
    <div class="services-grid">
      ${serviceCards}
    </div>
  </section>

  <!-- Team Section -->
  <section id="team" style="background: #f8f9fa;">
    <h2 class="section-title">Meet Our Team</h2>
    <div class="team-grid">
      ${employeeCards}
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contact">
    <h2 class="section-title">Contact Us</h2>
    <div style="text-align: center; color: #666;">
      ${studio.address ? `<p>📍 ${studio.address}</p>` : ''}
      ${studio.phone ? `<p>📞 ${studio.phone}</p>` : ''}
      ${studio.email ? `<p>✉️ ${studio.email}</p>` : ''}
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <p>&copy; ${new Date().getFullYear()} ${studio.name}. All rights reserved.</p>
    <p style="margin-top: 8px; opacity: 0.7;">Powered by <a href="https://polished.app">Polished</a></p>
  </footer>

  <script>
    window.__STUDIO_DATA__ = ${JSON.stringify(data)};
  </script>
</body>
</html>`;
}

/**
 * Generate HTML for admin dashboard
 */
function generateAdminHTML(subdomain: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard - Polished</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#fef2f2',
              100: '#fee2e2',
              200: '#fecaca',
              300: '#fca5a5',
              400: '#f87171',
              500: '#ff6b6b',
              600: '#dc2626',
              700: '#b91c1c',
              800: '#991b1b',
              900: '#7f1d1d',
            },
          },
        },
      },
    }
  </script>
  <style>
    @keyframes spin { to { transform: rotate(360deg); } }
    .animate-spin { animation: spin 1s linear infinite; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div id="app"></div>

  <script type="module">
    const subdomain = '${subdomain}';

    // Simple reactive state
    let state = {
      loading: true,
      error: null,
      stats: null,
      activeTab: 'today',
      allBookings: [],
      loadingAll: false,
    };

    // Status configurations
    const statusConfig = {
      PENDING: { label: 'Pending', color: 'yellow' },
      CONFIRMED: { label: 'Confirmed', color: 'blue' },
      COMPLETED: { label: 'Completed', color: 'green' },
      CANCELLED: { label: 'Cancelled', color: 'gray' },
      NO_SHOW: { label: 'No Show', color: 'red' },
      DECLINED: { label: 'Declined', color: 'red' },
    };

    function getStatusBadgeClass(status) {
      const colors = {
        yellow: 'bg-yellow-100 text-yellow-800',
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        gray: 'bg-gray-100 text-gray-800',
        red: 'bg-red-100 text-red-800',
      };
      const config = statusConfig[status] || statusConfig.PENDING;
      return colors[config.color];
    }

    function formatTime(dateStr) {
      return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    function formatDate(dateStr) {
      const date = new Date(dateStr);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    async function fetchStats() {
      state.loading = true;
      state.error = null;
      try {
        const response = await fetch('/api/admin/stats?subdomain=' + subdomain);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        state.stats = data;
      } catch (err) {
        state.error = err.message;
      } finally {
        state.loading = false;
        render();
      }
    }

    async function fetchAllBookings() {
      state.loadingAll = true;
      render();
      try {
        const response = await fetch('/api/admin/bookings?subdomain=' + subdomain);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        state.allBookings = data.bookings;
      } catch (err) {
        console.error(err);
      } finally {
        state.loadingAll = false;
        render();
      }
    }

    async function updateStatus(bookingId, newStatus) {
      try {
        const response = await fetch('/api/admin/bookings/' + bookingId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) throw new Error('Failed to update');
        await fetchStats();
        if (state.activeTab === 'all') await fetchAllBookings();
      } catch (err) {
        console.error(err);
      }
    }

    function switchTab(tab) {
      state.activeTab = tab;
      if (tab === 'all' && state.allBookings.length === 0) {
        fetchAllBookings();
      }
      render();
    }

    function getDisplayedBookings() {
      if (state.activeTab === 'today') return state.stats?.todaysBookings || [];
      if (state.activeTab === 'upcoming') return state.stats?.upcomingBookings || [];
      return state.allBookings;
    }

    function renderBookingCard(booking) {
      const config = statusConfig[booking.status] || statusConfig.PENDING;
      const actions = [];

      if (booking.status === 'PENDING') {
        actions.push({ label: 'Confirm', status: 'CONFIRMED', class: 'text-green-600 hover:bg-green-50' });
        actions.push({ label: 'Decline', status: 'DECLINED', class: 'text-red-600 hover:bg-red-50' });
      }
      if (booking.status === 'CONFIRMED') {
        actions.push({ label: 'Complete', status: 'COMPLETED', class: 'text-green-600 hover:bg-green-50' });
        actions.push({ label: 'No Show', status: 'NO_SHOW', class: 'text-orange-600 hover:bg-orange-50' });
      }
      if (['PENDING', 'CONFIRMED'].includes(booking.status)) {
        actions.push({ label: 'Cancel', status: 'CANCELLED', class: 'text-gray-600 hover:bg-gray-50' });
      }

      return \`
        <div class="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-all">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium \${getStatusBadgeClass(booking.status)}">
                  \${config.label}
                </span>
                <span class="text-sm text-gray-500">
                  \${formatDate(booking.startTime)} at \${formatTime(booking.startTime)}
                </span>
              </div>
              <div class="flex items-center gap-2 mb-2">
                <span class="font-medium text-gray-900">\${booking.customerName}</span>
                <a href="tel:\${booking.customerPhone}" class="text-sm text-primary-600 hover:underline">\${booking.customerPhone}</a>
              </div>
              <div class="flex items-center gap-4 text-sm text-gray-600">
                <span>\${booking.service?.name || 'Service'}</span>
                <span>with \${booking.employee?.user?.name || 'Employee'}</span>
                \${booking.price ? \`<span class="font-semibold text-primary-600">$\${booking.price}</span>\` : ''}
              </div>
              \${booking.notes ? \`<p class="mt-2 text-sm text-gray-500 italic">"\${booking.notes}"</p>\` : ''}
            </div>
            \${actions.length > 0 ? \`
              <div class="flex gap-2">
                \${actions.map(a => \`
                  <button onclick="updateStatus('\${booking.id}', '\${a.status}')"
                    class="px-3 py-1 text-sm rounded-lg \${a.class}">
                    \${a.label}
                  </button>
                \`).join('')}
              </div>
            \` : ''}
          </div>
        </div>
      \`;
    }

    function render() {
      const app = document.getElementById('app');
      const bookings = getDisplayedBookings();

      if (state.loading && !state.stats) {
        app.innerHTML = \`
          <div class="flex items-center justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
          </div>
        \`;
        return;
      }

      if (state.error) {
        app.innerHTML = \`
          <div class="max-w-2xl mx-auto mt-10 p-6 bg-red-50 rounded-xl text-center">
            <p class="text-red-700">\${state.error}</p>
            <button onclick="fetchStats()" class="mt-4 text-red-600 underline">Try again</button>
          </div>
        \`;
        return;
      }

      app.innerHTML = \`
        <header class="bg-white border-b border-gray-200 px-6 py-4">
          <div class="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p class="text-sm text-gray-500">\${subdomain}.polished.app</p>
            </div>
            <button onclick="fetchStats()" class="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
              Refresh
            </button>
          </div>
        </header>

        <main class="max-w-6xl mx-auto px-6 py-8">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p class="text-sm text-gray-500">Today's Bookings</p>
              <p class="text-3xl font-bold text-gray-900">\${state.stats?.todayCount || 0}</p>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p class="text-sm text-gray-500">Upcoming</p>
              <p class="text-3xl font-bold text-gray-900">\${state.stats?.upcomingCount || 0}</p>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p class="text-sm text-gray-500">Total Bookings</p>
              <p class="text-3xl font-bold text-gray-900">\${state.allBookings.length || '-'}</p>
            </div>
          </div>

          <!-- Tabs -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="flex border-b border-gray-200">
              <button onclick="switchTab('today')" class="flex-1 px-6 py-4 text-sm font-medium \${state.activeTab === 'today' ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}">
                Today (\${state.stats?.todayCount || 0})
              </button>
              <button onclick="switchTab('upcoming')" class="flex-1 px-6 py-4 text-sm font-medium \${state.activeTab === 'upcoming' ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}">
                Upcoming (\${state.stats?.upcomingCount || 0})
              </button>
              <button onclick="switchTab('all')" class="flex-1 px-6 py-4 text-sm font-medium \${state.activeTab === 'all' ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}">
                All Bookings
              </button>
            </div>

            <div class="p-6">
              \${state.loadingAll && state.activeTab === 'all' ? \`
                <div class="flex justify-center py-10">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              \` : bookings.length === 0 ? \`
                <div class="text-center py-10">
                  <p class="text-gray-500">No bookings found</p>
                </div>
              \` : \`
                <div class="space-y-4">
                  \${bookings.map(renderBookingCard).join('')}
                </div>
              \`}
            </div>
          </div>
        </main>
      \`;
    }

    // Make functions globally available
    window.fetchStats = fetchStats;
    window.switchTab = switchTab;
    window.updateStatus = updateStatus;

    // Initial load
    fetchStats();
  </script>
</body>
</html>`;
}

/**
 * Main Bun HTTP server
 */
const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Extract subdomain from host header or X-Subdomain
    const host = req.headers.get('Host') || '';
    let subdomain = req.headers.get('X-Subdomain');

    // Parse subdomain from host (e.g., milan-beauty.localhost:3001)
    if (!subdomain) {
      const hostParts = host.split('.');
      if (hostParts.length > 1 && hostParts[0] !== 'www' && hostParts[0] !== 'api') {
        subdomain = hostParts[0];
      }
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: 'polished-api',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // API endpoint to get studio data (for client-side fetching)
    if (url.pathname === '/api/studio') {
      const studioSubdomain = url.searchParams.get('subdomain') || subdomain;
      if (!studioSubdomain) {
        return new Response(JSON.stringify({ error: 'Subdomain required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const data = await getLandingPageData(studioSubdomain);
      if (!data) {
        return new Response(JSON.stringify({ error: 'Studio not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get available time slots for booking
    if (url.pathname === '/api/available-slots' && req.method === 'GET') {
      const employeeId = url.searchParams.get('employeeId');
      const serviceId = url.searchParams.get('serviceId');
      const dateStr = url.searchParams.get('date');

      if (!employeeId || !serviceId || !dateStr) {
        return new Response(
          JSON.stringify({ error: 'employeeId, serviceId, and date are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Get service duration from employee_services
      const employeeService = await getEmployeeService(employeeId, serviceId);
      if (!employeeService) {
        return new Response(
          JSON.stringify({ error: 'Service not offered by this employee' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const date = new Date(dateStr);
      const slotObjects = await getAvailableSlots(employeeId, date, employeeService.duration);

      // Convert slot objects to simple time strings for the frontend
      const slots = slotObjects.map((slot) => {
        const hours = slot.startTime.getHours().toString().padStart(2, '0');
        const minutes = slot.startTime.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      });

      return new Response(JSON.stringify({ slots, duration: employeeService.duration, price: employeeService.price }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Get employees who offer a specific service
    if (url.pathname === '/api/service-employees' && req.method === 'GET') {
      const serviceId = url.searchParams.get('serviceId');

      if (!serviceId) {
        return new Response(
          JSON.stringify({ error: 'serviceId is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const employeeServices = await getEmployeesForService(serviceId);

      return new Response(JSON.stringify({ employees: employeeServices }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Create a new booking
    if (url.pathname === '/api/bookings' && req.method === 'POST') {
      try {
        const body = await req.json() as CreateBookingInput;

        // Validate required fields
        if (!body.studioId || !body.serviceId || !body.employeeId || !body.startTime || !body.customerName || !body.customerPhone) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Create the booking
        const booking = await createBooking({
          ...body,
          startTime: new Date(body.startTime),
        });

        // Get full booking details
        const bookingDetails = await getBookingWithDetails(booking.id);

        // Send WhatsApp notification to customer (async, don't block response)
        if (bookingDetails) {
          const startTime = new Date(bookingDetails.startTime);
          const notificationData = {
            customerName: bookingDetails.customerName,
            customerPhone: bookingDetails.customerPhone,
            serviceName: bookingDetails.service?.name || 'Service',
            employeeName: bookingDetails.employee?.user?.name || 'Staff',
            studioName: 'Studio', // Will be fetched below
            date: startTime,
            time: startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            duration: Math.round((new Date(bookingDetails.endTime).getTime() - startTime.getTime()) / 60000),
            price: Number(bookingDetails.price) || 0,
            bookingId: bookingDetails.id,
          };

          // Get studio info for notification
          const { getStudioById } = await import('@polished/database');
          const studio = await getStudioById(body.studioId);
          if (studio) {
            notificationData.studioName = studio.name;
            (notificationData as any).studioPhone = studio.phone || undefined;
          }

          // Send customer confirmation (don't await to not block response)
          sendBookingConfirmation(notificationData).catch(err => {
            console.error('Failed to send customer notification:', err);
          });

          // Send studio notification if studio has phone
          if (studio?.phone) {
            sendStudioNotification(notificationData, studio.phone).catch(err => {
              console.error('Failed to send studio notification:', err);
            });
          }
        }

        return new Response(JSON.stringify({ booking: bookingDetails }), {
          status: 201,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      } catch (error) {
        console.error('Booking creation error:', error);
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to create booking' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Admin: Get bookings for a studio
    if (url.pathname === '/api/admin/bookings' && req.method === 'GET') {
      const studioSubdomain = url.searchParams.get('subdomain') || subdomain;
      if (!studioSubdomain) {
        return new Response(JSON.stringify({ error: 'Subdomain required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const studio = await getStudioBySubdomain(studioSubdomain);
      if (!studio) {
        return new Response(JSON.stringify({ error: 'Studio not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Parse query params for filtering
      const status = url.searchParams.get('status')?.split(',') as any;
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      const { getBookingsByStudioId } = await import('@polished/database');
      const bookings = await getBookingsByStudioId(studio.id, {
        status: status || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit,
        offset,
      });

      return new Response(JSON.stringify({ bookings, studio }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Admin: Update booking status
    if (url.pathname.startsWith('/api/admin/bookings/') && req.method === 'PATCH') {
      const bookingId = url.pathname.split('/').pop();
      if (!bookingId) {
        return new Response(JSON.stringify({ error: 'Booking ID required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        const body = await req.json() as { status: string; privateNotes?: string };
        const { updateBookingStatus, getBookingWithDetails, getStudioById } = await import('@polished/database');

        // Get old status before update
        const oldBooking = await getBookingWithDetails(bookingId);
        const oldStatus = oldBooking?.status;

        await updateBookingStatus(bookingId, {
          status: body.status as any,
          privateNotes: body.privateNotes,
        });

        const booking = await getBookingWithDetails(bookingId);

        // Send status change notification (async, don't block response)
        if (booking && oldStatus !== body.status) {
          const startTime = new Date(booking.startTime);
          const studio = await getStudioById(booking.studioId);

          sendStatusChangeNotification({
            customerName: booking.customerName,
            customerPhone: booking.customerPhone,
            serviceName: booking.service?.name || 'Service',
            studioName: studio?.name || 'Studio',
            date: startTime,
            time: startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            oldStatus: oldStatus || 'PENDING',
            newStatus: body.status,
            bookingId: booking.id,
          }).catch(err => {
            console.error('Failed to send status change notification:', err);
          });
        }

        return new Response(JSON.stringify({ booking }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to update booking' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Admin: Get dashboard stats
    if (url.pathname === '/api/admin/stats' && req.method === 'GET') {
      const studioSubdomain = url.searchParams.get('subdomain') || subdomain;
      if (!studioSubdomain) {
        return new Response(JSON.stringify({ error: 'Subdomain required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const studio = await getStudioBySubdomain(studioSubdomain);
      if (!studio) {
        return new Response(JSON.stringify({ error: 'Studio not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const { getTodaysBookings, getUpcomingBookings } = await import('@polished/database');
      const [todaysBookings, upcomingBookings] = await Promise.all([
        getTodaysBookings(studio.id),
        getUpcomingBookings(studio.id, 5),
      ]);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return new Response(JSON.stringify({
        todayCount: todaysBookings.length,
        upcomingCount: upcomingBookings.length,
        todaysBookings,
        upcomingBookings,
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // tRPC API endpoints (TODO: implement tRPC router)
    if (url.pathname.startsWith('/api/trpc')) {
      return new Response(
        JSON.stringify({ error: 'tRPC router not implemented yet' }),
        { status: 501, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Serve landing page for studio subdomains
    if (subdomain) {
      const data = await getLandingPageData(subdomain);
      const html = generateLandingHTML(data);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Serve admin dashboard
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
      const studioSubdomain = url.searchParams.get('subdomain') || subdomain || 'milan-beauty';
      return new Response(generateAdminHTML(studioSubdomain), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Default response (API root)
    return new Response(
      JSON.stringify({
        message: 'Polished API Server',
        version: '0.1.0',
        endpoints: {
          health: '/health',
          studio: '/api/studio?subdomain=milan-beauty',
          admin: '/admin?subdomain=milan-beauty',
          api: '/api/trpc',
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  },
});

console.log(`
🚀 Polished API Server running!

   Port:     ${PORT}
   URL:      http://localhost:${PORT}
   Health:   http://localhost:${PORT}/health

   Environment: ${process.env.NODE_ENV || 'development'}
`);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  server.stop();
  process.exit(0);
});
