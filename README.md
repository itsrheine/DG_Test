# Home Inspection App
Practice home inspection app using Next.js + Supabase

---

## Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Lucide Icons

### Backend & Database
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage
  - Inspection photos
  - Company logo storage

### State & UI
- React Hooks
- Global Theme Context (Light/Dark mode)

---

## Features

### Dashboard
- Create and manage inspection projects
- View project details (client, address, inspection date)
- Archive and delete projects
- Toggle between Active and Archived projects
- Status tracking (Draft / Completed)
- Compact mobile-friendly project cards

---

### Inspection Workflow
- Section-based inspection system
- Select materials, condition, and issue types
- Add inspector notes
- Auto-save section data
- Persistent project state

---

### Photo Upload
- Upload multiple photos per section
- Stored in Supabase Storage
- Add captions to each photo
- Remove photos
- (In progress) Drag-to-reorder photos

---

### Company Branding
- Upload company logo (Supabase Storage)
- Logo displayed in:
  - Report preview
  - PDF export
- Company information:
  - Name
  - Address
  - Phone
  - Email

---

### Auto Report Generator
- Real-time report preview
- Combines all saved sections into a structured report
- Auto-generated inspection comments
- Styled output:
  - Materials
  - Condition
  - Issue types
  - Notes
- Photo grid with captions

---

### PDF Export (Print-Based)
- Clean print layout optimized for inspectors
- Header + footer system
- Company branding included (logo + info)
- Page header (address + page number)
- Smart layout behavior:
  - On screen: user-friendly layout
  - On print: professional report layout
- Print-only + screen-only UI control using Tailwind (`print:` utilities)

---

### Report UI Enhancements
- Inline action icons (Print / Download)
- Removed floating buttons → integrated into header
- Metadata restructuring:
  - “Generated on” shown under Inspection Date (screen)
  - Automatically moves to header in print/PDF
- Improved spacing and typography for readability

---

### Shareable Reports
- Generate public share link for each project
- View report without login
- Secure token-based access
- Client-friendly report viewing

---

### Navigation & App Layout
- Mobile-style bottom navigation
- Sticky app header with back navigation
- Reusable layout components
- Optimized for phone experience

---

### Settings (Upgraded)
- Mobile-style settings UI
- Structured sections:
  - Account (Inspector info)
  - Company (Branding + logo)
  - Report (Header & Footer)
- Theme toggle (Light / Dark mode)
- Logout functionality

---

### Theme System
- Global theme (Light / Dark)
- Instant UI updates across app
- Stored in localStorage
- Shared via React context

---

## How It Works

- Project + report data stored in Supabase
- Section data saved per project
- Photos + logos stored in Supabase Storage
- Reports dynamically generated from saved data
- Share links fetch public project data securely

Projects can be:
- Active
- Completed
- Archived
- Deleted

---

## Design

- Mobile-first UI
- App-style navigation
- Clean, minimal interface
- Built for future mobile app conversion
- Print-friendly report formatting

---

## In Progress (Upcoming Features)

### Data & Sync
- Move all section data fully to Supabase
- Real-time syncing across devices
- Offline mode support

---

### Reporting
- True PDF generation (not print-based)
- Export to Word format
- Custom report templates
- Advanced branding customization
- Client portal for report access

---

### Billing & Payments
- Subscription plans (monthly/yearly)
- A la carte pricing model
- Payment integration:
  - Stripe
  - Square
  - Apple Pay / PayPal
- Invoice generation & history

---

### Inspection Expansion
- Add full inspection categories:
  - Exterior
  - Roofing
  - Plumbing
  - Electrical
  - HVAC
  - Interior
  - Foundation
  - Attic / Crawlspace
- Dynamic "if/then" comment logic

---

### App Experience
- Swipe actions (archive/delete)
- Improved section navigation
- Faster inspection input flow
- Dark/light mode polish

---

### Settings & User Control
- Profile management
- Company branding enhancements
- Advanced report customization
- Notification preferences

---

### AI Features (Future)
- Voice-to-text inspection input
- AI-assisted comment generation
- Smart inspection suggestions
- Conversational assistant (hands-free workflow)

---

## Known Issues & Improvements

This project is actively being developed.

Issues and feature requests:
https://github.com/itsrheine/DG_Test/issues

---

## Get Started

```bash
npm install
npm run dev

```

---

## Screenshots

### Log In Page
<img src="./screenshots/login page.jpg" width="300" />

### Settings Page (In Progress)
<img src="./screenshots/settings page.jpg" width="300" />