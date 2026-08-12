# TransFund Tracker

> **The transparent crowdfunding platform** — every rupee raised, tracked, and accounted for.

A full-stack fundraising and fund transparency platform where donors can browse campaigns, donate, and see exactly how their money was spent — and where organizers manage campaigns, log utilizations with proof, and post live updates.

---

## What Makes It Special:

- **Zero platform fee** — 100% of donations reach the campaign
- **Daily donor limits** — organizers can cap how much a single donor contributes per day
- **Fund utilization tracking** — every rupee spent is logged with description, category, and proof document
- **Proportional impact reports** — donors see their personal share of every utilization (your ₹500 bought 3 books, your ₹200 covered transport, etc.)
- **Campaign updates feed** — organizers post progress updates with file attachments
- **Auto-completion** — campaigns mark themselves as completed the moment the goal is reached
- **Cascading delete** — closing a campaign cleans up donations, receipts, utilizations, updates, and the uploaded image atomically
- **Receipt generation** — every donation gets a uniquely numbered receipt (`RCP-00001` format)

---

## Screenshots

### Landing Page

| | |
|---|---|
| ![Landing hero](docs/screenshots/01-landing-hero.jpg) | ![How it works](docs/screenshots/02-landing-how-it-works.jpg) |
| **Hero** — animated gradient, floating category badges, zero-fee promise | **How it works** — the 3-step path from campaign creation to funds |

![Category slideshow](docs/screenshots/03-landing-categories.jpg)

*Auto-advancing category slideshow — 8 fundraising categories, 5s interval*

### Authentication

| | |
|---|---|
| ![Login](docs/screenshots/04-login.jpg) | ![Signup](docs/screenshots/05-signup.jpg) |
| **Login** — one screen, role toggle for Donor / Organizer | **Signup** — password strength meter and live match indicator |

### Donor Experience

![Browse campaigns](docs/screenshots/06-donor-browse-campaigns.jpg)

*Explore Campaigns — full-text search, category pills, 4 sort modes, and Featured / Trending / Recently Added sections*

| | |
|---|---|
| ![Campaign detail](docs/screenshots/07-donor-campaign-detail.jpg) | ![Donation modal](docs/screenshots/08-donor-donation-modal.jpg) |
| **Campaign detail** — raised vs. goal, donor count, recent donors | **Quick donate** — preset amounts or a custom figure, daily-limit aware |

![Fund utilization tracker](docs/screenshots/09-donor-fund-tracking.jpg)

*Fund utilization tracker — raised vs. utilized vs. remaining, with every expense itemised by category, date, and proof*

| | |
|---|---|
| ![Impact dashboard](docs/screenshots/10-donor-impact-dashboard.jpg) | ![Where your money went](docs/screenshots/11-donor-where-money-went.jpg) |
| **Impact dashboard** — total donated, campaigns supported, live progress | **Where Your Money Went** — your *proportional* share of every rupee spent |

### Organizer Experience

![Organizer dashboard](docs/screenshots/12-organizer-dashboard.jpg)

*Organizer dashboard — campaign/donation/funds stats, donation-volume chart, and a live donations feed*

| | |
|---|---|
| ![Donation volume chart](docs/screenshots/13-organizer-donation-chart.jpg) | ![Campaign management](docs/screenshots/14-organizer-campaigns.jpg) |
| **Donation volume** — 7D / 30D / All-time chart plus recent campaigns | **My Campaigns** — status filters, progress, edit/delete, quick details |

| | |
|---|---|
| ![Campaign detail](docs/screenshots/15-organizer-campaign-detail.jpg) | ![Post an update](docs/screenshots/16-organizer-post-update.jpg) |
| **Campaign detail** — daily donor limit, full donation history, end campaign | **Post an update** — share progress with donors, any file type attached |

| | |
|---|---|
| ![Donations ledger](docs/screenshots/17-organizer-donations-ledger.jpg) | ![Create campaign](docs/screenshots/18-organizer-create-campaign.jpg) |
| **Donations ledger** — searchable, grouped by campaign, CSV export | **Create campaign** — cover image upload, goal, category, daily donor cap |

---

## Tech Stack:

| Layer | Technology |
|-------|------------|
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

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL running locally with a database named `mini`

```sql
CREATE DATABASE mini;
```

### Frontend

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

API docs at [http://localhost:8000/docs](http://localhost:8000/docs)

> Backend reads DB credentials from `backend/.env`. Default: `postgres` / `1234` / `mini`

---

## Features

### Landing Page
- Hero section with animated gradient and floating category badges
- Auto-advancing campaign slideshow (5 slides, 5s interval)
- 8 fundraising categories grid with emoji icons
- "How it works" 3-step breakdown
- Success stories with real donor testimonials
- Trust & Safety / "Giving Guarantee" section
- Responsive navbar with dropdown menus and mobile hamburger menu
- 4-column footer with navigation and legal links

### Authentication
- Role-based login — choose **Donor** or **Organizer** on the same screen
- Signup with password strength meter (Weak / Fair / Good / Strong)
- Password confirmation with live match indicator
- Animated background (gradient blobs + floating emoji circles)
- Form validation with inline error messages

### Donor Experience
| Feature | Detail |
|---------|--------|
| Campaign Browsing | Full-text search + category pills + 4 sort modes |
| Campaign Sections | Featured, Trending Now, Recently Added |
| Campaign Cards | Progress bar, funding %, image/gradient placeholder, status badge |
| Campaign Detail | Donor count, recent donors list, donation modal |
| Quick Donate | Pre-set amounts (₹500 / ₹1000 / ₹2000 / ₹5000) or custom input |
| Daily Limit Guard | Popup warning when limit reached, shows remaining allowance |
| Fund Tracking | Full utilization log with amounts, categories, and proof links |
| Impact Dashboard | Total donated, campaigns supported, proportional impact breakdown |
| Receipts | Auto-generated receipt for every donation |

### Organizer Experience
| Feature | Detail |
|---------|--------|
| Dashboard | Stats (campaigns, donations, funds raised) + daily donation chart |
| Live Feed | Real-time recent donations with donor info and amounts |
| Create Campaign | Image upload (drag & drop), category, goal, optional daily donor cap |
| Campaign Management | Filter by status, view progress, delete campaigns |
| Campaign Detail | Full donation history table, fund utilization log |
| Campaign Updates | Post updates with title, body, and file attachments |
| End Campaign | Close with a reason; locks further donations |
| Donations Ledger | Search by donor, export to CSV, grouped by campaign |
| Settings | Edit display name, logout |

### Backend Highlights
| Endpoint | Highlight |
|----------|-----------|
| `POST /donations/` | Daily limit enforcement (HTTP 429), auto-completes campaign on goal |
| `GET /donations/impact` | Proportional impact calculation per donor per campaign |
| `GET /utilizations/summary/{id}` | Total raised vs. utilized vs. remaining |
| `POST /campaigns/` | Multipart form with image upload, daily_donor_limit field |
| `DELETE /campaigns/{id}` | Cascading delete of all related records + image file |
| `POST /utilizations/` | Proof file upload to `/uploads/proofs/` |
| `GET /health` | Health check |

---

## Database Schema

### ER Diagram

```mermaid
erDiagram
    DONOR ||--o{ DONATION : makes
    ORGANIZER ||--o{ CAMPAIGN : manages
    CAMPAIGN ||--o{ DONATION : receives
    CAMPAIGN ||--o{ UTILIZATION : tracks
    CAMPAIGN ||--o{ CAMPAIGN_UPDATE : has
    DONATION ||--o| RECEIPT : generates

    DONOR {
        int id PK
        string name
        string email UK
        string phone
        string password_hash
        datetime created_at
    }
    ORGANIZER {
        int id PK
        string name
        string email UK
        string phone
        string password_hash
        datetime created_at
    }
    CAMPAIGN {
        int id PK
        string title
        text description
        string category
        float goal_amount
        float raised_amount
        string status
        string organizer_email
        string image_url
        string close_reason
        float daily_donor_limit
        datetime start_date
        datetime end_date
        datetime created_at
    }
    DONATION {
        int id PK
        int campaign_id FK
        int donor_id FK
        string donor_name
        string donor_email
        float amount
        string payment_method
        string transaction_id
        string status
        datetime donated_at
    }
    RECEIPT {
        int id PK
        int donation_id FK
        string receipt_number UK
        float amount
        string issued_to
        datetime issued_at
    }
    UTILIZATION {
        int id PK
        int campaign_id FK
        float amount
        text description
        string proof_url
        string category
        string created_by
        datetime created_at
    }
    CAMPAIGN_UPDATE {
        int id PK
        int campaign_id FK
        string title
        text body
        string file_url
        string posted_by
        datetime created_at
    }
    ADMIN {
        int id PK
        string username UK
        string email UK
        string password_hash
        string role
        datetime created_at
    }
```

---

## API Endpoints

### Campaigns `/campaigns`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/campaigns/` | List all campaigns (filter: category, organizer_email) |
| GET | `/campaigns/{id}` | Get a single campaign |
| POST | `/campaigns/` | Create campaign (multipart: image, daily_donor_limit) |
| DELETE | `/campaigns/{id}` | Delete campaign + all related records |
| PATCH | `/campaigns/{id}/close` | Close campaign with a reason |

### Donations `/donations`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/donations/` | Make a donation (enforces daily limit, auto-completes campaign) |
| GET | `/donations/` | List donations (filter: donor_email, organizer_email, campaign_id) |
| GET | `/donations/impact` | Donor's proportional impact across all campaigns |

### Donors `/donors`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/donors/register` | Register a new donor |
| POST | `/donors/login` | Donor login |
| GET | `/donors/` | List all donors |
| GET | `/donors/{id}` | Get donor details |
| GET | `/donors/{id}/donations` | Get all donations by a donor |

### Receipts `/receipts`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/receipts/` | Generate a receipt for a donation |
| GET | `/receipts/` | List receipts (filter: donor_email) |
| GET | `/receipts/{id}` | Get receipt by ID |
| GET | `/receipts/by-donation/{donation_id}` | Get receipt for a specific donation |

### Utilizations `/utilizations`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/utilizations/` | Log fund utilization with proof upload |
| GET | `/utilizations/` | List utilizations (filter: campaign_id) |
| GET | `/utilizations/{id}` | Get a utilization record |
| GET | `/utilizations/summary/{campaign_id}` | Raised vs. utilized summary |

### Campaign Updates `/campaign-updates`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/campaign-updates/` | Post an update with optional file attachment |
| GET | `/campaign-updates/?campaign_id=x` | Get all updates for a campaign |

### Admins `/admins`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/admins/register` | Register an admin |
| POST | `/admins/login` | Admin login |
| GET | `/admins/` | List all admins |
| GET | `/admins/{id}` | Get admin details |
| DELETE | `/admins/{id}` | Delete an admin |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | API health check |

---

## Project Structure

```
transfund-tracker/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Donor + Organizer login (role toggle)
│   │   └── signup/page.tsx         # Donor self-registration
│   ├── (app)/
│   │   ├── donor/
│   │   │   ├── home/page.tsx       # Browse & search campaigns
│   │   │   ├── dashboard/page.tsx  # Donor impact dashboard
│   │   │   ├── campaign/[id]/      # Campaign detail + donation modal
│   │   │   └── tracking/[id]/      # Fund utilization tracker
│   │   └── organizer/
│   │       ├── dashboard/page.tsx  # Stats + charts + live feed
│   │       ├── campaigns/page.tsx  # Campaign management grid
│   │       ├── campaigns/[id]/     # Campaign detail + updates + end
│   │       ├── campaigns/new/      # Create campaign form
│   │       ├── create/page.tsx     # Create campaign (alternate route)
│   │       ├── donations/page.tsx  # Full donations ledger + CSV export
│   │       └── settings/page.tsx   # Profile settings
│   ├── layout.tsx
│   ├── page.tsx                    # Landing page
│   └── globals.css
├── components/
│   ├── Logo.tsx                    # Brand logo (image-based)
│   ├── Navbar.tsx                  # Top navigation bar
│   ├── CampaignCard.tsx            # Reusable campaign card
│   ├── CampaignList.tsx            # Campaign grid/list
│   ├── DailyDonationChart.tsx      # Line chart (donations over time)
│   ├── DonationChart.tsx           # Donation visualization
│   ├── DonationFeed.tsx            # Live donation feed
│   ├── DonorChart.tsx              # Donor analytics
│   ├── ProgressBar.tsx             # Funding progress bar
│   ├── StatCard.tsx                # Metric stat card
│   └── RequireAuth.tsx             # Auth guard HOC
├── lib/
│   └── api.ts                      # Typed API client (all endpoints)
├── backend/
│   ├── main.py                     # FastAPI app, CORS, router registration
│   ├── database.py                 # SQLAlchemy engine & session
│   ├── models.py                   # All ORM models
│   ├── schemas.py                  # Pydantic request/response schemas
│   ├── _schema_sync.py             # Auto-adds new columns on startup
│   ├── requirements.txt
│   ├── routers/
│   │   ├── campaigns.py
│   │   ├── donations.py
│   │   ├── donors.py
│   │   ├── receipts.py
│   │   ├── utilizations.py
│   │   ├── admins.py
│   │   └── auth.py
│   └── uploads/                    # Campaign images + utilization proofs
│       └── proofs/
├── docs/
│   └── screenshots/                # README screenshots
└── public/
    └── logo.png                    # TransFund Tracker brand logo
```
