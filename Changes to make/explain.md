# TransFund Tracker — Full Project Explanation

---

## 1. What Is This Project?

**TransFund Tracker** is a full-stack crowdfunding and fund-transparency platform built for the Indian market (amounts in INR / rupees). It lets two types of users interact:

- **Donors** — browse campaigns, donate money, and see exactly how their money was spent.
- **Organizers** — create fundraising campaigns, receive donations, log how every rupee was used (with proof documents), and post live updates.

The core promise: **zero platform fee + complete transparency**. Every donation is tracked, every utilization is logged, and donors get a proportional impact report showing their personal share of each expenditure.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| File Uploads | FastAPI StaticFiles + multipart/form-data |
| Auth | bcrypt password hashing |

---

## 3. Project Directory Structure

```
transfund-tracker/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Public landing page
│   ├── layout.tsx              # Root HTML layout
│   ├── globals.css             # Global CSS + Tailwind base
│   ├── (auth)/                 # Auth route group (no shared layout)
│   │   ├── login/page.tsx      # Login page (donor + organizer)
│   │   └── signup/page.tsx     # Signup page (donor self-registration)
│   └── (app)/                  # Authenticated app route group
│       ├── donor/              # All donor-facing pages
│       └── organizer/          # All organizer-facing pages
├── components/                 # Reusable React components
├── lib/
│   └── api.ts                  # Typed API client (all fetch calls)
├── backend/                    # FastAPI Python backend
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── routers/                # One router file per resource
│   └── uploads/                # Uploaded images and proof files
└── public/
    └── logo.png                # Brand logo
```

---

## 4. User Roles

### Donor
- Registers and logs in via the `/login` or `/signup` page.
- Can browse all active campaigns, search by keyword, filter by category, and sort results.
- Can donate to any active campaign with preset amounts (₹500, ₹1000, ₹2000, ₹5000) or a custom amount.
- Gets a uniquely numbered receipt (`RCP-00001` format) for every donation.
- Can view their total donated amount, campaigns supported, and a proportional breakdown of how their money was spent.
- Is protected by the daily donor limit if an organizer has set one (receives an HTTP 429 warning when the limit is hit).

### Organizer
- Logs in via `/login` with the "Organizer" role toggle.
- Can create, edit, and delete fundraising campaigns.
- Can upload a cover image for each campaign.
- Can set an optional daily donation cap per donor.
- Can post campaign updates with file attachments.
- Can log fund utilizations (proof of how money was spent) with a category, amount, and proof document.
- Can close/end a campaign with a reason (locks further donations).
- Can view a donations ledger (searchable, exportable to CSV).
- Has a dashboard with stat cards and a daily donation line chart.

---

## 5. Authentication

- **Storage**: User session is stored in `localStorage` under the key `transfund_user` as a JSON object with `{ email, name, role }`.
- **API**: Calls go to `/auth/register`, `/auth/login`, and `/auth/upsert` on the FastAPI backend.
- **Passwords**: Hashed with `bcrypt` on the backend before being stored in the database.
- **Role guard**: The frontend checks `localStorage` to determine the role and redirects donors to `/donor/home` and organizers to `/organizer/dashboard` after login.
- **No JWT tokens**: Auth is entirely session-based via localStorage; there is no token refresh mechanism.

---

## 6. Pages & Routes

### Public Routes
| Route | Purpose |
|---|---|
| `/` | Landing page with hero, slideshows, how-it-works, stories, and footer |
| `/login` | Unified login page with a donor/organizer role toggle |
| `/signup` | Donor registration page with a password strength meter |

### Donor Routes (under `/donor/`)
| Route | Purpose |
|---|---|
| `/donor/home` | Browse all campaigns with search, category filter, and sort |
| `/donor/dashboard` | Personal impact dashboard — donations, stats, impact card |
| `/donor/campaign/[id]` | Campaign detail page with a donation modal |
| `/donor/tracking/[id]` | Fund utilization tracker for a specific campaign |

### Organizer Routes (under `/organizer/`)
| Route | Purpose |
|---|---|
| `/organizer/dashboard` | Overview with stats, daily chart, campaign list, and live donations |
| `/organizer/campaigns` | Grid of all campaigns with filter tabs, edit modal, and delete |
| `/organizer/campaigns/[id]` | Campaign detail — donation history, updates, utilization log, close button |
| `/organizer/campaigns/new` | Alternate route for creating a campaign |
| `/organizer/create` | Create a new campaign form (title, description, goal, image, daily limit) |
| `/organizer/donations` | Full donations ledger with search and CSV export |
| `/organizer/settings` | Edit display name, logout |

---

## 7. Components

| Component | What It Does |
|---|---|
| `Logo.tsx` | Brand logo using `next/image` with the TransFund Tracker wordmark |
| `Navbar.tsx` | Top navigation bar (shared across donor and organizer layouts) |
| `CampaignCard.tsx` | Reusable card showing campaign image/gradient, progress bar, and status badge |
| `CampaignList.tsx` | Renders a grid of `CampaignCard` components |
| `DailyDonationChart.tsx` | Recharts line chart of daily donation amounts and donor counts over time |
| `DonationChart.tsx` | Donation data visualization |
| `DonationFeed.tsx` | Live scrolling feed of recent donations |
| `DonorChart.tsx` | Donor analytics chart |
| `ProgressBar.tsx` | Animated funding progress bar with color-coded fill (blue → amber → green based on %) |
| `StatCard.tsx` | A metric card with icon, label, value, and hover gradient bottom border |
| `RequireAuth.tsx` | Higher-order component that checks localStorage and redirects unauthenticated users |
| `PostUpdateForm.tsx` | Form for organizers to post a campaign update with optional file attachment |
| `CampaignUpdatesFeed.tsx` | Displays the list of campaign updates posted by the organizer |
| `DonorImpactCard.tsx` | Shows the donor their proportional share of each utilization (e.g. "Your ₹500 funded 3 books") |

---

## 8. API Client (`lib/api.ts`)

All frontend-to-backend communication goes through `lib/api.ts`. It is a typed module of plain `fetch` wrappers.

- **Base URL**: `process.env.NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`).
- **Auth helpers**: `getStoredUser()`, `setStoredUser()`, `clearStoredUser()` — read/write/clear localStorage.
- **Auth calls**: `registerUser()`, `loginUser()`, `upsertUser()`
- **Campaign calls**: `getCampaigns()`, `getCampaign(id)`, `createCampaign(formData)`, `updateCampaign(id, formData)`, `deleteCampaign(id)`, `closeCampaign(id, reason)`
- **Donation calls**: `makeDonation()`, `getDonorDonations()`, `getOrganizerDonations()`, `getCampaignDonations()`
- **Utilization calls**: `getUtilizations()`, `getUtilizationSummary()`
- **Campaign update calls**: `getCampaignUpdates()`, `createCampaignUpdate()`, `deleteCampaignUpdate()`
- **Impact call**: `getDonorImpact()` — returns proportional impact per campaign
- **Formatters**: `fmtINR(amount)` formats numbers as `₹1,23,456` (Indian locale), `fmtDate(iso)` formats dates.

---

## 9. Backend (FastAPI)

The backend lives in the `backend/` folder and is run with `uvicorn`.

### Key Files
| File | Role |
|---|---|
| `main.py` | Creates the FastAPI app, sets up CORS, mounts static file serving for `/uploads`, and registers all routers |
| `database.py` | SQLAlchemy engine and `SessionLocal` factory; connects to PostgreSQL |
| `models.py` | All ORM models — `Donor`, `Organizer`, `Campaign`, `Donation`, `Receipt`, `Utilization`, `CampaignUpdate`, `Admin` |
| `schemas.py` | Pydantic schemas for request validation and response serialization |
| `_schema_sync.py` | Auto-alters database tables to add any new columns on startup (lightweight migration alternative) |

### Routers (`backend/routers/`)
| Router | Handles |
|---|---|
| `auth.py` | `/auth/register`, `/auth/login`, `/auth/upsert` — unified login for both roles |
| `campaigns.py` | CRUD for campaigns, image upload, cascading delete, campaign close |
| `donations.py` | Making donations, enforcing daily limits (HTTP 429), auto-completing campaigns, impact calculation |
| `donors.py` | Donor registration, login, listing |
| `receipts.py` | Auto-generating and fetching donation receipts |
| `utilizations.py` | Logging fund utilizations with proof file upload, summary endpoint |
| `admins.py` | Admin registration, login, listing, delete |

---

## 10. Database Schema

### Tables and Relationships

- **Donor** — stores donor accounts (`id`, `name`, `email`, `password_hash`, `created_at`)
- **Organizer** — stores organizer accounts (same fields as Donor)
- **Campaign** — core table (`id`, `title`, `description`, `category`, `goal_amount`, `raised_amount`, `status`, `organizer_email`, `image_url`, `close_reason`, `daily_donor_limit`, `created_at`)
- **Donation** — `id`, `campaign_id` (FK), `donor_id` (FK), `donor_name`, `donor_email`, `amount`, `donated_at`
- **Receipt** — `id`, `donation_id` (FK), `receipt_number` (unique, e.g. `RCP-00001`), `amount`, `issued_to`, `issued_at`
- **Utilization** — `id`, `campaign_id` (FK), `amount`, `description`, `proof_url`, `category`, `created_by`, `created_at`
- **CampaignUpdate** — `id`, `campaign_id` (FK), `title`, `body`, `file_url`, `posted_by`, `created_at`
- **Admin** — `id`, `username`, `email`, `password_hash`, `role`, `created_at`

### Relationships
- A Donor makes many Donations.
- An Organizer manages many Campaigns.
- A Campaign receives many Donations, has many Utilizations, and has many CampaignUpdates.
- Each Donation generates one Receipt.

---

## 11. Key Features in Detail

### Zero Platform Fee
The platform does not deduct any percentage from donations. The full amount is tracked and reported.

### Daily Donor Limit
Organizers can set a maximum amount a single donor can contribute in one day. If a donor tries to exceed this, the backend returns HTTP 429 and the frontend shows a warning popup with the remaining allowance.

### Auto-Completion
When a donation pushes a campaign's `raised_amount` to or above its `goal_amount`, the campaign's `status` is automatically flipped to `"completed"` in the same database transaction.

### Cascading Delete
When an organizer deletes a campaign, the backend atomically removes: all donations, all receipts, all utilizations, all campaign updates, and the uploaded cover image file from disk.

### Fund Utilization Tracking
Organizers log every expense with: amount, description, category, and an optional proof file (PDF, image). Donors can view the full log for any campaign they donated to.

### Proportional Impact Reports
The `/donations/impact` endpoint calculates each donor's ownership percentage in every campaign they donated to, then multiplies that percentage against each utilization amount. The `DonorImpactCard` component renders this as: "Your ₹500 funded 3 textbooks, your ₹200 covered transport."

### Receipt Generation
Every successful donation automatically generates a uniquely numbered receipt stored in the `Receipt` table (format: `RCP-00001`, `RCP-00002`, etc.).

### Campaign Updates Feed
Organizers can post progress updates (title + body + optional file). These are displayed chronologically on the campaign detail page for both organizers and donors to read.

---

## 12. UI & Design Highlights

- **Color palette**: Primary green `#00b964` / teal `#00d4aa` / blue `#0069ff` gradient; backgrounds in warm cream `#fdf6f0` or white.
- **Border radius**: Heavy use of `rounded-3xl` (24px) for a friendly, modern card style.
- **Animations**:
  - Landing page hero has floating category circles with CSS keyframe animations.
  - Scroll-triggered fade-in/slide-up animations via `IntersectionObserver`.
  - Category and campaign slideshows with opacity + transform transitions.
  - Progress bars animate their width on mount with a CSS transition.
  - Login/signup page has fixed floating emoji circles with infinite float animation.
- **Responsive**: Mobile-first, with `md:` and `lg:` breakpoints for grid layouts and the navbar hamburger menu.
- **Skeleton loading**: All data-fetching states show animated gray placeholder blocks (`animate-pulse`) before content loads.

---

## 13. How to Run the Project

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL with a database called `mini`

### Step 1 — Database
```sql
CREATE DATABASE mini;
```

### Step 2 — Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
API docs available at `http://localhost:8000/docs`

### Step 3 — Frontend
```bash
npm install
npm run dev
```
App available at `http://localhost:3000`

> Backend reads DB credentials from `backend/.env`. Default: user `postgres`, password `1234`, database `mini`.

---

## 14. Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Frontend `.env.local` | Base URL of the FastAPI backend (defaults to `http://localhost:8000`) |
| `DATABASE_URL` or `backend/.env` | Backend | PostgreSQL connection string |
