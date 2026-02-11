# Polished - UX/UI Features Specification

**Prepared by:** Chief UX/UI Designer
**Date:** January 2026
**Status:** Design Complete, Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Customer-Facing Features](#customer-facing-features)
3. [Admin Dashboard Features](#admin-dashboard-features)
4. [Employee Portal Features](#employee-portal-features)
5. [Booking System](#booking-system)
6. [Template System](#template-system)
7. [User Journeys](#user-journeys)
8. [Design System](#design-system)

---

## Executive Summary

Polished is a conversion-optimized booking platform built on **mobile-first** principles with state-of-the-art UX patterns. Every element is designed for maximum conversion, usability, and accessibility.

**Core Design Principles:**
- **Conversion-First:** Every element optimized for bookings
- **Mobile-First:** 70%+ traffic expected from mobile
- **Speed:** <2s page load, instant interactions
- **Simplicity:** 3-click booking maximum
- **Accessibility:** WCAG 2.1 AA compliance

---

## Customer-Facing Features

### 1. Landing Page

#### Hero Section

**Layout (Mobile-First):**
```
┌────────────────────────────────┐
│ [Studio Logo]          [☰ Menu]│
├────────────────────────────────┤
│                                │
│ [Full-bleed Hero Image/Video]  │
│   Overlay Gradient             │
│                                │
│   "Perfect Nails in 60 Mins"   │
│   [32px, bold, white]          │
│                                │
│   "Same-day • 4.9★ 342 reviews"│
│   [16px, white, 0.9 opacity]   │
│                                │
│   [Book Now - Full-width CTA]  │
│   [View Services - Ghost btn]  │
│                                │
│ [Licensed • Insured • COVID-Safe]│
└────────────────────────────────┘
```

**Key Elements:**
- **Hero Image**: 1920x1080px WebP source, focal point selector for mobile crop
- **Value Proposition**: Outcome + Timeframe + Differentiator
- **Social Proof**: Star rating (4.8+) with review count above the fold
- **Trust Signals**: Licensed, Insured badges

**Performance:**
- LCP target: <1.5s
- Critical CSS inlined
- Hero image preloaded
- Font optimization (FOUT prevention)

#### Service Browsing

**Card Grid Layout:**
```
┌────────────────────────────────┐
│ [Service Image - 4:3 ratio]    │
│ "POPULAR" badge (if tagged)    │
├────────────────────────────────┤
│ Gel Manicure          [20px]   │
│ From $65 • 60 min     [14px]   │
│                                │
│ Long-lasting gel polish        │
│ with expert application...     │
│                                │
│ [Select Service →]             │
└────────────────────────────────┘
```

**Features:**
- Mobile: 1 column, Desktop: 3 columns
- Quick filters (tabs): All | Nails | Hair | Skincare | Massage
- Advanced filters (drawer): Price range, Duration, Availability
- Search with auto-suggest (300ms debounce)
- "Most Popular" badges (automated by booking count)

**Conversion Elements:**
- Package deals highlighted: "Save $45 with Spa Package"
- Add-on suggestions: "Add nail art for +$15"
- Scarcity (if true): "Only 2 slots left today"

#### Employee Profiles

**Gallery View (Homepage):**
```
┌─────┐  ┌─────┐  ┌─────┐
│ 👤  │  │ 👤  │  │ 👤  │  [120px circular]
│Sarah│  │Lisa │  │ Mike│
│4.9★ │  │4.8★ │  │5.0★ │
│127  │  │89   │  │45   │  [Review counts]
└─────┘  └─────┘  └─────┘
```

**Expanded Profile (Modal):**
- Large profile photo (240px circle)
- Name, title, years of experience
- Star rating with breakdown
- "Booked 342 times this month" social proof
- Tabbed content: About | Services | Portfolio | Reviews
- Primary CTA: "Book with [Name]"

**Selection UX:**
- Default: "Any Available Professional" (recommended)
- Shows earliest available time
- If preferred unavailable: "Notify me" waitlist

#### Pricing Display

**Transparency Strategy: All Prices Visible, No Login**

**Display Formats:**
```
Single Service:
Gel Manicure
$65 | 60 minutes
[Book Now]

Service with Tiers:
Haircut & Styling
○ Classic Cut ................ $75 (45 min)
● Premium Cut & Style ........ $120 (90 min)
○ Luxury Treatment ........... $185 (120 min)

Package Deal (Highlighted):
┌─────────────────────────────┐
│ 🎉 MOST POPULAR            │
│ Spa Package                 │
│ Manicure + Pedicure + Facial│
│ $199 (3 hours)              │ [Bold]
│ Regular: $244 | Save $45!   │ [Strikethrough]
│ [Book Package]              │
└─────────────────────────────┘
```

**Pricing Psychology:**
- Anchor pricing with strikethrough
- "From $X" for variable pricing
- Bundle incentives
- No hidden fees: "All prices include tax"

---

## Admin Dashboard Features

### Dashboard Home

**Layout (Desktop):**
```
┌────────────────────────────────────────────────────────┐
│ [Logo] Polished Admin                    [👤 Profile ▼]│
│ Dashboard | Bookings | Services | Team | Analytics     │
└────────────────────────────────────────────────────────┘

┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Today       │ This Week   │ Conversion  │ Next Appt   │
│ 12 bookings │ 48 bookings │ 18.5%       │ In 45 min   │
│ $840        │ $3,360      │ ↑ 2.3%      │ [View]      │
└─────────────┴─────────────┴─────────────┴─────────────┘

┌────────────────────────────────┬──────────────────────┐
│ Today's Schedule               │ Quick Actions        │
│ 9:00 AM Sarah → Emma           │ [+ New Booking]      │
│         Gel Manicure | $65     │ [+ Add Employee]     │
│ 10:30 AM Lisa → John           │ [⚙ Customize Page]  │
│         Haircut | $85          │ [📊 View Analytics]  │
└────────────────────────────────┴──────────────────────┘
```

**Key Metrics Cards:**
- Real-time updates (WebSocket)
- Trend indicators (↑↓ with %)
- Comparison to previous period
- Clickable to drill down

### Booking Management

**Calendar View (Week Grid):**
```
      Mon 7  Tue 8  Wed 9  Thu 10 Fri 11 Sat 12
9 AM  ┌────┐ ┌────┐        ┌────┐ ┌────┐ ┌────┐
      │Emma│ │John│        │Sue │ │Mary│ │Alex│
      │$65 │ │$85 │        │$120│ │$75 │ │$90 │
10 AM └────┘ └────┘        └────┘ └────┘ └────┘

[Color Legend: Confirmed █ Pending ░ Cancelled ▓]
```

**Interaction Features:**
- **Drag-and-drop**: Reschedule bookings
- **Click**: Open detail modal
- **Resize**: Adjust duration
- **Right-click**: Context menu (Mark Complete, Cancel)

**Booking Detail Modal:**
```
┌─────────────────────────────────┐
│ Booking #POL-4789          [✕]  │
│                                 │
│ Customer: Emma Johnson          │
│ 📞 (555) 123-4567              │
│ 💬 [Message on WhatsApp]       │
│                                 │
│ Service: Gel Manicure           │
│ Employee: Sarah Martinez        │
│ Date: Feb 7, 2026 at 9:00 AM   │
│ Price: $65                      │
│                                 │
│ Status: [Confirmed ▼]           │
│                                 │
│ [Edit] [Send Reminder]          │
│ [Cancel] [Mark Complete]        │
└─────────────────────────────────┘
```

### Service Management

**List View with Drag-to-Reorder:**
```
┌────────────────────────────────────────────────────────┐
│ Services                              [+ Add Service]  │
└────────────────────────────────────────────────────────┘

┌─────┬────────────────┬──────────┬──────────┬─────────┐
│ [≡] │ Gel Manicure   │ Nails    │ $65      │ [Edit]  │
│     │ 60 min         │          │ 60 min   │ [Delete]│
│     │ ★ Most Popular │          │          │         │
├─────┼────────────────┼──────────┼──────────┼─────────┤
│ [≡] │ Pedicure       │ Nails    │ $55      │ [Edit]  │
│     │ 45 min         │          │ 45 min   │ [Delete]│
└─────┴────────────────┴──────────┴──────────┴─────────┘

[≡] = Drag handle for reordering
```

**Add/Edit Service Form:**
- Service name, category, description
- Image upload (drag-and-drop)
- Pricing (fixed or "from" starting at)
- Duration and buffer time
- Employee assignment (checkboxes)
- Bookable online toggle

### Employee Management

**Team Directory:**
```
┌────────────────────────────────────────────────────────┐
│ Team                                  [+ Add Employee]  │
└────────────────────────────────────────────────────────┘

┌────┬─────────────────┬───────────────┬────────┬────────┐
│ 👤 │ Sarah Martinez  │ Nail Spec.    │ Active │ [Edit] │
│    │ sarah@studio.com│ 15 services   │ ●      │ [View] │
│    │ 4.9★ (127)      │ 342 bookings  │        │        │
└────┴─────────────────┴───────────────┴────────┴────────┘
```

**Add Employee Flow:**
1. Profile photo upload
2. Full name, email, phone
3. Role/title and bio
4. Years of experience, certifications
5. Service assignment with pricing
6. Permissions (View Only | Manage Own | Manage All)
7. Send email invite

### Theme Customization

**Split-View Customizer:**
```
┌─────────────────┬────────────────────────────────────┐
│ CUSTOMIZE       │ LIVE PREVIEW                       │
│                 │                                    │
│ Templates ▼     │ ┌────────────────────────────────┐ │
│ ┌──┐ ┌──┐ ┌──┐ │ │ [Landing page renders here     │ │
│ │Lx│ │Fr│ │Nt│ │ │  with real-time updates]       │ │
│ └──┘ └──┘ └──┘ │ │                                │ │
│                 │ │ [Interactive - click to        │ │
│ Colors          │ │  navigate, test booking]       │ │
│ Primary         │ │                                │ │
│ [#ff6b6b] 🎨    │ │                                │ │
│                 │ │                                │ │
│ Typography      │ │                                │ │
│ Heading Font    │ │                                │ │
│ [Poppins ▼]     │ │                                │ │
│                 │ │ Device Preview:                │ │
│ Layout          │ │ [📱] [💻] [🖥️]                 │ │
│ Button Style    │ │                                │ │
│ ○ Rounded       │ └────────────────────────────────┘ │
│ ● Pill          │                                    │
│                 │                                    │
│ [Publish]       │                                    │
└─────────────────┴────────────────────────────────────┘
```

**Customization Options:**
1. **Template Selection**: Visual gallery with previews
2. **Brand Colors**: Primary, Secondary, Accent with color picker
3. **Typography**: 30 curated Google Fonts with pairings
4. **Logo Upload**: PNG/SVG with crop tool
5. **Layout Options**: Header style, hero layout, button style
6. **Advanced**: Custom CSS editor (pro users)

**Features:**
- Real-time preview updates (<100ms)
- Responsive preview toggle (mobile/tablet/desktop)
- Accessibility warnings (contrast ratios)
- Version history with rollback

### Analytics Dashboard

**Overview:**
```
┌────────────────────────────────────────────────────────┐
│ Analytics                                              │
│ Date Range: [Last 30 Days ▼]  vs [Previous Period]    │
└────────────────────────────────────────────────────────┘

┌────────────┬────────────┬────────────┬────────────────┐
│ Bookings   │ Revenue    │ Avg Value  │ Conversion     │
│ 142        │ $9,230     │ $65        │ 18.5%          │
│ ↑ 12%      │ ↑ 15%      │ ↑ 3%       │ ↑ 2.3%         │
└────────────┴────────────┴────────────┴────────────────┘

[Bookings Over Time - Line chart with dual axis]
[Top Services - Bar chart]
[Top Employees - Leaderboard]
[Busiest Times - Heatmap]
[Customer Acquisition - Pie chart]

[Export Report (PDF/CSV)]  [Schedule Email Report]
```

---

## Employee Portal Features

### Employee Dashboard

**Mobile-First Layout:**
```
┌────────────────────────────────┐
│ 👤 Sarah Martinez    [☰ Menu]  │
└────────────────────────────────┘

Good morning, Sarah! ☀️

┌────────────────────────────────┐
│ TODAY'S SCHEDULE               │
│ 5 appointments • $325          │
│                                │
│ ⏰ NEXT APPOINTMENT            │
│ In 45 minutes                  │
│                                │
│ 👤 Emma Johnson                │
│ 💅 Gel Manicure • $65          │
│ 🕐 9:00 AM - 10:00 AM          │
│                                │
│ [View Details] [Call Customer] │
└────────────────────────────────┘

UPCOMING TODAY
9:00 AM  Emma • Gel Manicure
10:30 AM John • Pedicure
12:00 PM [Lunch Break]
2:00 PM  Sue • Nail Art

┌────────────────────────────────┐
│ QUICK ACTIONS                  │
│ [⏰ Block Time Off]            │
│ [📅 Update Availability]       │
│ [💰 View Earnings]             │
└────────────────────────────────┘
```

### Schedule Management

**Availability Settings:**
```
┌────────────────────────────────┐
│ Set Availability               │
│                                │
│ Default Weekly Schedule        │
│                                │
│ Monday    [9:00 AM ▼] - [6:00 PM ▼]  ☑│
│ Tuesday   [9:00 AM ▼] - [6:00 PM ▼]  ☑│
│ Wednesday [9:00 AM ▼] - [6:00 PM ▼]  ☑│
│ Thursday  [9:00 AM ▼] - [6:00 PM ▼]  ☑│
│ Friday    [9:00 AM ▼] - [6:00 PM ▼]  ☑│
│ Saturday  [10:00 AM ▼] - [4:00 PM ▼] ☑│
│ Sunday    Not available              ☐│
│                                │
│ Buffer Between Appointments    │
│ [15 ▼] minutes                 │
│                                │
│ [Save Changes]                 │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Request Time Off               │
│                                │
│ Dates: [Feb 15] to [Feb 17]   │
│ Reason: [Vacation ▼]           │
│ Notes: [Family trip]           │
│                                │
│ Status: Pending Approval       │
│ [Submit Request]               │
└────────────────────────────────┘
```

### Booking Management

**Booking Detail View:**
```
┌────────────────────────────────┐
│ Booking #POL-4789         [✕]  │
│                                │
│ 👤 Emma Johnson                │
│ First time customer            │
│                                │
│ 📞 (555) 123-4567              │
│ [Call] [Message on WhatsApp]   │
│                                │
│ 💅 Gel Manicure • $65          │
│ 📅 Monday, Feb 7, 2026         │
│ 🕐 9:00 AM - 10:00 AM          │
│                                │
│ 💬 Special Requests:           │
│ "Prefer pastel colors"         │
│                                │
│ 📝 My Notes (private):         │
│ [Emma prefers light pink...  ] │
│                                │
│ [Mark as Completed]            │
└────────────────────────────────┘
```

**Post-Appointment:**
- Mark completed/no-show
- Add private notes
- Flag for follow-up

### Earnings Dashboard

```
┌────────────────────────────────┐
│ My Earnings                    │
│ [This Week ▼]                  │
└────────────────────────────────┘

┌────────────────────────────────┐
│ THIS WEEK                      │
│ $1,450                         │
│ ↑ $120 vs last week            │
│                                │
│ 22 appointments                │
│ Avg: $65.91 per service        │
└────────────────────────────────┘

BREAKDOWN
💅 Gel Manicure       12x • $780
🦶 Pedicure            8x • $440
🎨 Nail Art            2x • $230

[Earnings trend chart over 4 weeks]

PAYOUT STATUS
Last Paid: Jan 31 • $1,200
Next Payout: Feb 15 (in 8 days)
```

### Profile Management

**Public Profile Editor:**
```
┌────────────────────────────────┐
│ My Public Profile              │
│ (Visible on landing page)      │
└────────────────────────────────┘

Profile Photo
[👤 Upload Photo]

Full Name: [Sarah Martinez]
Title: [Nail Specialist]

Bio (500 chars):
[10 years experience in nail art...]
243/500

Years of Experience: [10 ▼]
Certifications: [Licensed, Gel Certified]

PORTFOLIO
[+] [Photo] [Photo] [Photo]

VISIBILITY SETTINGS
☑ Show profile on landing page
☑ Accept new bookings
☑ Allow WhatsApp contact

[Save Changes]  [Preview Profile]
```

---

## Booking System

### 5-Step Booking Flow

**Design Philosophy: Linear, Mobile-First, 5 Steps Maximum**

#### Step 1: Service Selection

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1 of 5                    [✕]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Choose Your Service

[🔍 Search services...]

┌─────────────────────────────┐
│ [Image] Gel Manicure        │ ☐
│ $65 • 60 min                │
└─────────────────────────────┘

┌─────────────────────────────┐
│ [Image] Pedicure            │ ☑
│ $55 • 45 min                │
└─────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Selected: Pedicure • $55 • 45min
[Continue →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Features:**
- Multi-select enabled
- Running cart summary (sticky footer)
- Smart bundling suggestions
- "Continue" disabled until selection

#### Step 2: Employee Selection

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 2 of 5         [← Back] [✕]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Choose Your Professional

┌─────────────────────────────┐
│ ⚡ RECOMMENDED               │
│ Any Available Professional  │ ●
│ Next: Today 2:30PM          │
└─────────────────────────────┘

OR choose specific:

┌────┐ Sarah Martinez    4.9★  ○
│ 👤 │ Nail Specialist
│    │ Next: Today 4:00 PM
└────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Continue →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Features:**
- "Any Available" pre-selected (recommended)
- Shows earliest time
- Employee cards show next available slot

#### Step 3: Date & Time Selection

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 3 of 5         [← Back] [✕]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Choose Date & Time

[Today]  [Tomorrow]  [Weekend]

┌──────── February 2026 ────────┐
│  S   M   T   W   T   F   S    │
│      1   2   3   4   5   6    │
│  7   8  [9] 10  11  12  13    │
└────────────────────────────────┘

Available times for Feb 9:

Morning
[9:00 AM]  [9:30 AM]  [10:00 AM]

Afternoon
[2:00 PM]  [2:30 PM]  [3:00 PM]  ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Continue to Details →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Features:**
- Quick date shortcuts
- Calendar with availability indicators
- Time slots grouped by time of day
- Real-time updates

#### Step 4: Customer Information

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 4 of 5         [← Back] [✕]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your Information

Full Name *
[Sarah Johnson                  ] ✓

Phone Number *
[(555) 123-4567                 ] ✓

Email *
[sarah@example.com              ] ✓

Special Requests (Optional)
[Prefer pastel colors...        ]

☑ Send confirmation via WhatsApp
☐ Subscribe to offers & updates

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Review Booking →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Features:**
- 3 required fields only
- Auto-format phone as typing
- Inline validation on blur
- WhatsApp opt-in pre-checked

#### Step 5: Review & Confirm

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 5 of 5         [← Back] [✕]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Confirm Your Booking

┌─────────────────────────────┐
│ Pedicure                    │
│ $55 • 45 minutes            │
│                             │
│ 👤 Sarah Martinez           │
│ 📅 Wed, Feb 9 at 3:00 PM    │
│ 📍 Milan Beauty Studio      │
│    123 Main St, Milan       │
│                             │
│ Total: $55                  │
└─────────────────────────────┘

Customer: Sarah Johnson
(555) 123-4567              [Edit]

Payment: ● Pay at Studio

Cancellation Policy:
Free cancellation up to 24h

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Confirm Booking]            [56px]
🔒 Your information is secure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Features:**
- Complete booking summary
- Edit links return to relevant step
- Clear cancellation policy
- Security badge

### Success Screen

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          [✕]

      [Confetti! 🎉]

           ✓

    You're All Set! 💅

Confirmation #POL-4789

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[📅 Add to Calendar ▼]
  • Google Calendar
  • Apple Calendar
  • Outlook

[💬 Message Us on WhatsApp]

[↗️ Share with a Friend]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Features:**
- Confetti animation (3 seconds)
- Multi-calendar options
- WhatsApp deep link
- Social share with referral incentive

### WhatsApp Notifications

**Automated Messages:**

**1. Booking Confirmed (Immediate):**
```
✅ Booking Confirmed!

Pedicure with Sarah Martinez
📅 Wed, Feb 9 at 3:00 PM

Milan Beauty Studio
123 Main St, Milan

Confirmation: #POL-4789

View details: polished.app/booking/POL-4789
```

**2. Reminder (24 Hours Before):**
```
👋 Reminder: Your appointment is tomorrow!

Pedicure with Sarah Martinez
📅 Tomorrow at 3:00 PM

See you soon! 💅

Reply CANCEL if needed
```

**3. Reminder (2 Hours Before):**
```
Your appointment starts in 2 hours!

Pedicure with Sarah at 3:00 PM
123 Main St, Milan

Get directions: [Map link]

Running late? Reply to let us know
```

**4. Review Request (2 Hours After):**
```
Thank you for visiting us! 🌟

We hope you loved your Pedicure with Sarah.

Share your experience: [Review Link]

Book again: polished.app/milannails
```

---

## Template System

### 5 Template Styles

#### 1. Fresh (Modern & Trendy)

**Visual Identity:**
- **Colors**: Coral (#ff6b6b), Mint (#4ecdc4), Yellow (#ffe66d), White
- **Typography**: Poppins Bold + Inter
- **Style**: Pill-shaped buttons, bouncy animations, colorful gradients
- **Best For**: Nail salons, trendy beauty bars, millennial/Gen-Z focused

#### 2. Luxe (High-End Salons)

**Visual Identity:**
- **Colors**: Navy (#1a2332), Gold (#d4af37), Blush (#f8e5e5)
- **Typography**: Playfair Display + Montserrat
- **Style**: Generous white space, thin gold borders, elegant animations
- **Best For**: High-end spas, luxury salons, exclusive studios

#### 3. Natural (Eco/Wellness)

**Visual Identity:**
- **Colors**: Sage (#9caf88), Terracotta (#e07a5f), Cream (#f4f1de)
- **Typography**: Lora + Open Sans
- **Style**: Rounded corners, organic shapes, nature photography
- **Best For**: Organic spas, wellness centers, eco-conscious studios

#### 4. Bold (Barbershops/Edgy)

**Visual Identity:**
- **Colors**: Black (#000000), Red (#d32f2f), White
- **Typography**: Bebas Neue + Roboto
- **Style**: Sharp corners, strong contrasts, dramatic lighting
- **Best For**: Barbershops, men's grooming, edgy salons

#### 5. Minimal (Contemporary/Fashion)

**Visual Identity:**
- **Colors**: Charcoal (#333333), Gray (#e0e0e0), Blush (#ffc1cc)
- **Typography**: Helvetica Neue
- **Style**: Maximum white space, thin lines, outlined buttons
- **Best For**: Contemporary salons, minimalist aesthetic, high-fashion studios

### Customization Options

**All Templates Support:**
- Primary/Secondary/Accent color changes
- Logo upload (SVG/PNG)
- Font selection (30 Google Fonts)
- Hero image/video upload
- Layout adjustments (header style, button style)
- Custom CSS (pro users)

---

## User Journeys

### Customer Booking Journey

**Persona:** Emma, 32, booking gel manicure for wedding

**Journey:**
1. **Discovery** (Google search) → Landing page (impressed by design)
2. **Exploration** (15-60s) → Browse services, check reviews, build trust
3. **Booking Flow** (2-5min) → 5-step process, selects Sarah for tomorrow
4. **Confirmation** (<1min) → Success screen, adds to calendar
5. **Pre-Appointment** → Receives 24h and 2h reminders via WhatsApp
6. **Visit** → In-studio, excellent service
7. **Post-Visit** → Leaves 5★ review, books again 2 weeks later

**Metrics:**
- Landing → Booking initiated: 35%
- Booking initiated → Confirmed: 75%
- Overall conversion: 26%
- Show-up rate: 95%
- Repeat booking: 50%

### Admin Onboarding Journey

**Persona:** Marco, 38, studio owner, setting up Polished

**Journey:**
1. **Discovery & Sign-Up** (5min) → Finds Polished, signs up for trial
2. **Onboarding Wizard** (10min) → 5-step setup (studio info, logo, services, team, template)
3. **Publish** → Page goes live at polished.app/milanbeauty
4. **Exploration** (10min) → Tests booking flow, customizes colors
5. **Going Live** (next day) → Adds to Instagram, Google My Business
6. **First Booking** (Day 3) → Real customer books, validation!
7. **Upgrade** (Day 14) → Trial ends, converts to paid ($48/month)

**Metrics:**
- Sign-up → Published page: 85%
- Published → First booking: 70% (within 1 week)
- Trial → Paid: 35%

### Employee Daily Workflow

**Persona:** Sarah, 29, nail technician

**Daily Routine:**
1. **Morning** (7am) → WhatsApp summary: "5 appointments today"
2. **Pre-Appointment** (8:45am) → Portal shows Emma arriving in 15min
3. **During Day** → Serves customers, marks completed, adds notes
4. **New Booking** (10:15am) → WhatsApp alert: New 4pm booking
5. **Cancellation** (11am) → John cancels, sees gap in schedule
6. **End of Day** (5pm) → Reviews earnings: $325 today
7. **Weekly** (Sunday) → Sets availability, blocks Friday off

**Metrics:**
- Portal usage: 5-10 times/day
- Avg time per check: 30 seconds
- Notification open rate: 95%

---

## Design System

### Component Library (shadcn/ui + Custom)

**Core Components:**
1. **Buttons**: Primary, Secondary, Ghost, Destructive (3 sizes)
2. **Inputs**: Text, Email, Phone, Textarea, Select, Date, Time
3. **Cards**: Service card, Employee card, Booking card, Metric card
4. **Modals**: Centered, Full-screen, Side drawer, Bottom sheet
5. **Navigation**: Top nav, Hamburger menu, Breadcrumbs, Tabs
6. **Notifications**: Toast, Badge, Alert banner
7. **Loading**: Spinner, Skeleton, Progress bar
8. **Lists**: List item, Data table, Pagination
9. **Media**: Avatar, Gallery, Video player
10. **Feedback**: Star rating, Empty states, Error states

### Accessibility (WCAG 2.1 AA)

**Standards:**
- **Color Contrast**: Minimum 4.5:1 for text, 3:1 for UI components
- **Keyboard Navigation**: All interactive elements accessible, visible focus
- **Screen Reader**: Semantic HTML, ARIA labels, alt text for images
- **Forms**: Labels above inputs, specific error messages
- **Responsive**: 200% zoom without horizontal scroll

**Testing:**
- Automated: axe DevTools, Lighthouse
- Manual: Keyboard-only navigation
- Screen readers: VoiceOver, NVDA

### Mobile Responsiveness

**Philosophy: Mobile-First, Progressive Enhancement**

**Breakpoints:**
```
Mobile:  320px - 767px (base styles)
Tablet:  768px - 1023px
Desktop: 1024px+
```

**Patterns:**
- **Stacking** (mobile) → **Columns** (desktop)
- **Off-Canvas Navigation** → **Horizontal Menu**
- **Touch Targets**: 48px+ height on mobile

**Performance Targets:**
- LCP: <2.5s
- FID: <100ms
- CLS: <0.1
- Total JS: <200KB

---

## Implementation Priority

### Phase 1 (MVP)
1. ⏳ Customer landing page with Astro (1 template: Fresh)
2. ⏳ 5-step booking flow (Vue island component in Astro)
3. ⏳ Admin dashboard (Vue 3 SPA - bookings, services, team)
4. ⏳ Employee portal (Vue 3 SPA - schedule, notifications)
5. ⏳ WhatsApp notifications (basic)
6. ⏳ Rebuild trigger when studio data changes

### Phase 2 (Enhancement)
- All 5 templates (Astro components)
- Theme customizer with live preview (triggers rebuild)
- Analytics dashboard
- Review system

### Phase 3 (Scale)
- Multi-location support
- Advanced scheduling
- Payment processing
- Mobile apps

---

## Technical Notes

### Landing Pages (Astro)
- **Static Generation**: Pages are pre-built at build time
- **Data Fetching**: API calls during `getStaticPaths()` to generate pages for each studio
- **Interactive Parts**: Booking flow uses Vue islands for interactivity
- **Rebuild Strategy**: When admin updates studio settings, trigger Astro rebuild via webhook

### Admin/Employee Portals (Vue 3 SPAs)
- **Real-time**: WebSocket connections for live booking updates
- **State Management**: Pinia for complex state
- **API**: tRPC for type-safe API calls

---

**Document Version:** 1.1
**Last Updated:** January 2026
**Status:** Ready for Design & Development
**Frontend Architecture:** Astro (Landing) + Vue 3 (Admin/Employee)
