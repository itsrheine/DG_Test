# Home Inspection App
Practice home inspection app using Next.js

## Tech
- Next.js
- TypeScript
- Tailwind CSS

## Features

### Dashboard
- Create and manage inspection projects
- View project details (client, address, inspection date)
- Archive and delete projects
- Toggle between Active and Archived projects
- Status tracking (Draft / Completed)
- Compact mobile-friendly project cards

### Inspection Workflow
- Section-based inspection
- Select materials, condition, and issue types
- Add inspector notes
- Auto-save section data
- Persistent project state (status: Draft / Completed)

### Photo Upload
- Upload multiple photos per section
- Add captions to each photo
- Remove photos easily

### Auto Report Generator
- Real-time report preview
- Combines all saved sections into a structured report
- Automatically generates inspection comments based on selections

### Navigation & App Layout
- Mobile-style bottom navigation (Home, Projects, Notes, Settings)
- Sticky app header with back navigation and actions
- Reusable navigation components
- App-like layout optimized for mobile experience

---

### Authentication
- Login / Sign Up / Forgot Password Flow
- Session-based authentication
- Protected routes for authenticated users

---

## How It Works
- Project data is stored in Supabase (cloud database)
- Section data is currently stored in localStorage (temporary)
- Each section is saved independently per project
- Report preview dynamically builds from saved section data
- Projects can be: 
    - Active
    - Archived
    - Deleted

---

## Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **Storage:** Browser localStorage (temporary)
- **Backend / Database:** Supabase
- **Auth:** Supabase Auth

---

### Project Management
- Unique project ID generation (short format for UI)
- Auto-save project data
- Status tracking (Draft / Completed / Archived)
- Real-time updates between dashboard and project detail view

---

## Design
- Mobile-first UI
- Simple, tap-based interactions
- Clean and minimal interface
- Built with future app conversion in mind

---

## In Progress (Upcoming Features)
- Improve authentication flow (session handling, persistence)
- Cloud database (replace localStorage)

### Usability Improvements
- Improve navigation between inspection sections
- Faster data entry and selection flow
- Streamlined project creation and editing
- Better mobile interaction (tap, swipe, gestures)

### UI Enhancements (Cosmetic)
- Visual polish and layout improvements
- Improved spacing, typography, and readability
- Icon-based navigation (mobile-friendly)
- Consistent design system across all pages

### Billing & Payments
- Subscription plans (monthly/yearly)
- A la carte pricing model
- Payment integration:
    - Stripe
    - Square
    - Apple Pay / Paypal
- Invoice generation/history
- Downloadable receipts and billing records

### Reporting
- Export report to Word/PDF
- Customizable report templates
- Shareable report links (PDF/Password Protected) (Ask D if ok)
- Customer view access for specific reports/projects (Ask D if ok)
- Client portal to view completed inspection reports (Ask D if ok)

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
- Dynamic "if/then" logic for auto-comments

### App Experience
- Swipe actions (archive/delete)
- Dark/Light mode
- Offline capability

### Platform Expansion
- Full web/desktop version
- Cross-device syncing
- Inspector + client access views (Ask D if ok)

### Settings & User Control
- Profile management
- Email settings
- Notification preferences
- Billing dashboard

### Data Migration
- Move section data from localStorage to Supabase
- Enable full cloud sync across devices
- Improve data reliability and persistence

### AI Features (Future)
- Voice-to-text inspection input (talk instead of typing)
- AI-assisted comment generation
- Smart suggestions based on selected conditions
- Conversational assistant for inspectors (hands-free workflow)
- Natural language report editing

---

## Known Issues & Improvements
This project is actively being developed

Current bugs and feature requests are tracked in the Issues tab:
https://github.com/itsrheine/DG_Test/issues

Feel free to contribute or report issues.

---

### Get Started (Prototype)

```bash
npm install
npm run dev

```

---

## Screenshots

### Log In Page
<img src="./screenshots/login page.jpg" width="300" />