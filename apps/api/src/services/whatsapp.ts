/**
 * WhatsApp Notification Service
 *
 * Sends booking notifications via WhatsApp Business API.
 * Falls back to console logging in development mode.
 */

interface BookingNotification {
  customerName: string;
  customerPhone: string;
  serviceName: string;
  employeeName: string;
  studioName: string;
  studioPhone?: string;
  date: Date;
  time: string;
  duration: number;
  price: number;
  bookingId: string;
}

interface StatusChangeNotification {
  customerName: string;
  customerPhone: string;
  serviceName: string;
  studioName: string;
  date: Date;
  time: string;
  oldStatus: string;
  newStatus: string;
  bookingId: string;
}

// WhatsApp Business API configuration
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

const isProduction = process.env.NODE_ENV === 'production';
const isWhatsAppConfigured = WHATSAPP_PHONE_ID && WHATSAPP_ACCESS_TOKEN;

/**
 * Format phone number for WhatsApp API (remove non-digits, ensure country code)
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');

  // If starts with 0, assume it needs country code (default to US +1)
  if (digits.startsWith('0')) {
    digits = '1' + digits.substring(1);
  }

  // If less than 10 digits, assume US and prepend 1
  if (digits.length === 10) {
    digits = '1' + digits;
  }

  return digits;
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Send WhatsApp message via Business API
 */
async function sendWhatsAppMessage(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!isWhatsAppConfigured) {
    // Log to console in development
    console.log('\n📱 WhatsApp Notification (DEV MODE)');
    console.log(`   To: ${to}`);
    console.log(`   Message:\n${message.split('\n').map(l => '   ' + l).join('\n')}`);
    console.log('');
    return { success: true, messageId: 'dev-' + Date.now() };
  }

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formatPhoneNumber(to),
        type: 'text',
        text: { body: message },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      return { success: false, error: data.error?.message || 'Failed to send message' };
    }

    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send booking confirmation to customer
 */
export async function sendBookingConfirmation(booking: BookingNotification): Promise<{ success: boolean; messageId?: string }> {
  const message = `✅ *Booking Confirmed!*

Hi ${booking.customerName}!

Your appointment at *${booking.studioName}* has been booked.

📅 *Date:* ${formatDate(booking.date)}
🕐 *Time:* ${booking.time}
💇 *Service:* ${booking.serviceName}
👤 *With:* ${booking.employeeName}
⏱️ *Duration:* ${booking.duration} minutes
💰 *Price:* $${booking.price}

📍 Please arrive 5 minutes early.

Need to reschedule? Contact us${booking.studioPhone ? ` at ${booking.studioPhone}` : ''}.

Ref: #${booking.bookingId.slice(0, 8).toUpperCase()}`;

  return sendWhatsAppMessage(booking.customerPhone, message);
}

/**
 * Send booking notification to studio
 */
export async function sendStudioNotification(booking: BookingNotification, studioPhone: string): Promise<{ success: boolean; messageId?: string }> {
  const message = `🔔 *New Booking!*

*Customer:* ${booking.customerName}
*Phone:* ${booking.customerPhone}

📅 ${formatDate(booking.date)} at ${booking.time}
💇 ${booking.serviceName} with ${booking.employeeName}
💰 $${booking.price}

Ref: #${booking.bookingId.slice(0, 8).toUpperCase()}`;

  return sendWhatsAppMessage(studioPhone, message);
}

/**
 * Send status change notification to customer
 */
export async function sendStatusChangeNotification(notification: StatusChangeNotification): Promise<{ success: boolean; messageId?: string }> {
  const statusMessages: Record<string, string> = {
    CONFIRMED: `✅ *Booking Confirmed!*

Hi ${notification.customerName}!

Great news! Your appointment at *${notification.studioName}* has been confirmed.

📅 *Date:* ${formatDate(notification.date)}
🕐 *Time:* ${notification.time}
💇 *Service:* ${notification.serviceName}

See you soon!`,

    CANCELLED: `❌ *Booking Cancelled*

Hi ${notification.customerName},

Your appointment at *${notification.studioName}* on ${formatDate(notification.date)} at ${notification.time} has been cancelled.

We'd love to see you again! Book a new appointment anytime.`,

    DECLINED: `😔 *Booking Declined*

Hi ${notification.customerName},

Unfortunately, we couldn't accommodate your booking request at *${notification.studioName}* for ${formatDate(notification.date)} at ${notification.time}.

Please try booking a different time slot. We apologize for any inconvenience.`,

    COMPLETED: `⭐ *Thanks for visiting!*

Hi ${notification.customerName}!

Thank you for your visit to *${notification.studioName}*!

We hope you loved your ${notification.serviceName}. We'd love to see you again soon!`,

    NO_SHOW: `📝 *Missed Appointment*

Hi ${notification.customerName},

We noticed you couldn't make it to your appointment at *${notification.studioName}* today.

No worries! Feel free to book again when you're available.`,
  };

  const message = statusMessages[notification.newStatus];
  if (!message) {
    console.log(`No notification template for status: ${notification.newStatus}`);
    return { success: true };
  }

  return sendWhatsAppMessage(notification.customerPhone, message);
}

/**
 * Check if WhatsApp is configured
 */
export function isWhatsAppEnabled(): boolean {
  return isWhatsAppConfigured || !isProduction;
}
