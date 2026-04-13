# Home Inspection App
Practice home inspection app using Next.js + Supabase

---

## Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Lucide React Icons

### Backend & Database
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage
  - Inspection photos
  - Company logos

### State & UI
- React Hooks
- Global Theme Context (Light/Dark mode)
- Global Toast Notification System (ToastProvider)

---

## Features

### UX Direction
- Designed to feel like iOS
- Code-heavy on speed, simplicity, and minimal UI
- Tap-first interactions instead of buttons
- Clean editing for notes

### Dashboard
- Create and manage inspection projects
- View project details (client, address, inspection date)
- Archive and delete projects
- Toggle between Active and Archived projects
- Status tracking (Draft / Completed)
- Compact mobile-friendly project cards
- Short project ID display for quick reference
- Due date tracking for each project
- Visual alerts for:
  - Upcoming due dates (within 24 hours)
  - Overdue reports
- Toast notifications for deadlines
- Smart upgrade prompts when nearing project limit
- Free plan usage progress bar

---

### Inspection Workflow
- Section-based inspection system
- Select materials, condition, and issue types
- Add inspector notes
- Auto-save section data
- Persistent project state
- Progress tracking across inspection sections

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

### Plan Limits & Usage
- Free plan inclused up to 3 active projects
- Real-time project usage tracking
- Smart UI states:
  - Normal state (under limit)
  - "Almost at limit" warning (2 of 3 projects)
  - Hard limit reached (3 of 3 projects)
- Upgrade prompts integrated directly into dashboard
- Visual usage progress bar for plan tracking

---

### Report UI Enhancements
- Inline action icons (Print / Download)
- Removed floating buttons → integrated into header
- Metadata restructuring:
  - “Generated on” shown under Inspection Date (screen)
  - Automatically moves to header in print/PDF
- Improved spacing, alignment and typography for readability
- Cleaner export + print experience

---

### Shareable Reports
- Generate public share link for each project
- View report without login
- Secure token-based access
- Client-friendly report viewing

---

### Notes

- Project-linked notes system
- Notes displayed in iOS-mobile UX
- Tap a note to open full-screen editor
- Auto-save while typing
- Project selector inside note editor (iOS)
- Simplified UI:
  - Removed edit/delete buttons
  - Focus on tap-to-edit workflow
---

### Navigation & App Layout
- Mobile-style bottom navigation
- Sticky app header with back navigation
- Inline action icons (no floating buttons)
- Reusable layout components
- Optimized for phone experience
- iOs interaction patterns

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

###
- Dedicated pricing page
- Free plan with enforced project limits
- Upgrade flow integrated into:
  - Dashboard
  - Settings
- Soft paywall experience:
  - Encourages upgrade before blocking
- Scalable structure for future Stripe integration

---

### Theme System
- Global theme (Light / Dark)
- Instant UI updates across app
- Stored in localStorage
- Shared via React context
- Applied across dashboard, notes, reports, and settings

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

### Current Status
- Fully functional inspection workflow
- Real-time report generation
- Project lifecycle management (Draft → Completed → Archived)
- Free plan with enforced usage limits
- Upgrade-ready SaaS structure (no payments yet)

---

## In Progress (Roadmap)

### Phase 1 - Core Experience (Current Focus)
- Finalize inspection workflow
- Improve report generation (PDF polish)
- Notes system enhancements
- In-app notifications
- Performance + UI polish

---

### Phase 2 - Professional Features
- True PDF generation (not print-based)
- Export to Word format
- Advanced report templates
- Company branding customization
- Client portal for report acccess

---

### Phase 3 - Business & Monetization
- Stripe integration (subscriptions)
- Plan upgrades & billing portal
- Payment handling (monthly plans)
- A la carte pricing model
- Payment integration: 
  - Stripe
  - Square
  - Apple Pay / Paypal
- Invoice generation & history

---

### Phase 4 - Inspection Expansion
- Additional inspection categories:
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

### Phase 5 - Advanced Experience
- Offline mode support
- Real-time syncing across devicecs
- Swipe actions (archive/delete)
- Faster inspection input flow
- Improved navigation + transitions

---

### Phase 6 - AI Features (Future)
- Voice-to-text inspection input
- AI-assisted comment generation
- Smart inspection suggestions
- Converesational assistant (hands-free workflow)

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

<p align="center">
  <img src="./screenshots/login-page.jpg" height="400" />
  <img src="./screenshots/dashboard-lite.jpg" height="400" />
  <img src="./screenshots/notes-page.jpg" height="400" />
</p>

<p align="center">
  <img src="./screenshots/notepad-page.jpg" height="400" />
  <img src="./screenshots/billing-page.jpg" height="400" />
  <img src="./screenshots/settings-page.jpg" height="400" />
</p>
