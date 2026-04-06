# Home Inspection App
Practice home inspection app using Next.js

## Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

### Backend & Database
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage (photo uploads)

### State & Storage
- React Hooks
- Supabase (projects + inspection sections)
- Supabase Storage (images)
- Local UI state (temporary interactions only)

## Features

### Dashboard
- Create and manage inspection projects
- View project details (client, address, inspection date)
- Archive and delete projects
- Toggle between Active and Archived projects
- Status tracking (Draft / Completed)
- Compact mobile-friendly project cards

### Project Management
- Unique project IDs (copyable)
- Project status system:
    - Draft
    - Completed
    - Archived
- Mark projects as completed from project detail page
- Real-time status updates synced with database

### Inspection Workflow
- Section-based inspection
- Select materials, condition, and issue types
- Add inspector notes
- Save section data per project + section
- Persistent project state (Draft / Completed)

### Photo Upload
- Upload multiple photos per section
- Images stored in Supabase Storage (cloud)
- Public URLs used for fast loading and display
- Add captions to each photo
- Remove photos (also deletes from storage)
- Optimized for performance (no base64 storage)

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
- Supabase Auth integration
- Session-based authentication
- Protected routes for authenticated users

---

## How It Works
- Project data is stored in Supabase (cloud database)
- Section data is stored in Supabase per project and section
- Photos are stored separately in Supabase Storage and linked via URLs
- Each section is saved independently per project
- Report preview dynamically builds from saved section data
- Projects can be: 
    - Active
    - Archived
    - Deleted

## Design
- Mobile-first UI
- Simple, tap-based interactions
- Clean and minimal interface
- Built with future app conversion in mind

## File Handling
- Image uploads handled via Supabase Storage API
- Unique file paths generated per project
- Secure and scalabile file management
- Supports future features like:
    - PDF report embedding
    - Client image access
    - Downloadable reports

## Media Storage
- Photos are uploaded to Supabase Storage
- Each image is stored under its project ID
- Only image URLs and metadata are stored in the database
- Improves performance and scalability compared to base64 storage

---

## In Progress (Upcoming Features)
- Improve authentication flow (session handling, persistence)
- Optimized Supabase data structure and performance

### Usability Improvements
- Improve navigation between inspection sections
- Faster data entry and selection flow
- Streamlined project creation and editing
- Better mobile interaction (tap, swipe, gestures)

### Data & Sync
- Improve reliability and performance of Supabase data
- Enable full cross-device syncing

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

### AI Features (Future)
- Voice-to-text inspection input (talk instead of typing)
- AI-assisted comment generation
- Smart suggestions based on selected conditions
- Conversational assistant for inspectors (hands-free workflow)
- Natural language report editing

---

## Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here

```

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