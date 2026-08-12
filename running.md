# TransFund Tracker — How to Run

## Step-by-Step (Do This In Order)

### Step 1: Start PostgreSQL
- Open **pgAdmin** or **SQL Shell (psql)** from the Start Menu
- Make sure the PostgreSQL service is running
- First time only — create the database:
```sql
CREATE DATABASE mini;
```

### Step 2: Start the Backend
Open a terminal and run:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
Wait for:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```
> Keep this terminal open.

The backend auto-syncs the DB schema on startup — no manual migrations needed.

### Step 3: Start the Frontend
Open a **second terminal** and run:
```bash
npm install
npm run dev
```
Wait for:
```
▲ Next.js 16.2.3
- Local: http://localhost:3000
```

### Step 4: Open the App
Go to **[http://localhost:3000](http://localhost:3000)** — you'll land on the homepage.  
To log in, go to **[http://localhost:3000/login](http://localhost:3000/login)**.

---

## How to Use

### As an Organizer
1. On the login page, select **Organizer** → enter your email & password → **Login**
2. You'll land on the **Organizer Dashboard** — stats, donation charts, live feed
3. Click **Create Campaign** → fill in title, description, goal, category, optional image
4. Optionally enable a **Daily Donor Limit** to cap how much one donor can give per day
5. Hit **Publish** — your campaign is live
6. From the campaign detail page you can:
   - Post **campaign updates** (text + file attachments)
   - Log **fund utilization** entries with proof documents
   - **End the campaign** with a close reason
7. View the **Donations Ledger** for a searchable, CSV-exportable record of all donations

### As a Donor
1. On the login page, select **Donor** → enter your email & password → **Login** (or **Sign Up** first)
2. Browse campaigns on the **Home** page — search, filter by category, sort by trending/newest/goal
3. Click a campaign → **Donate Now** → pick an amount or enter custom → **Confirm**
4. If the organizer set a daily donor limit and you've hit it, you'll see a friendly warning with your remaining allowance
5. Visit your **Dashboard** to see total donated, campaigns supported, and your proportional impact breakdown
6. Click **Track Funds** on any campaign to see exactly how the organizer spent the money (with proof links)

---

## What's in the App

| Feature | Where to find it |
|---------|-----------------|
| Campaign browsing + search + filters | Donor → Home |
| Donation with quick-amount buttons | Donor → any campaign → Donate Now |
| Daily donor limit enforcement | Automatic on donation |
| Fund utilization tracker | Donor → Campaign → Track Funds |
| Proportional impact report | Donor → Dashboard → "Where Your Money Went" |
| Organizer dashboard with charts | Organizer → Dashboard |
| Create campaign with image upload | Organizer → Create Campaign |
| Post campaign updates | Organizer → Campaign → Updates section |
| Log fund utilization with proof | Organizer → Campaign → Utilization section |
| Donations ledger + CSV export | Organizer → Donations |
| End / close a campaign | Organizer → Campaign → End Campaign |
| Swagger API docs | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## Important Notes

- **Both servers must be running**: backend on `:8000` and frontend on `:3000`
- **PostgreSQL must be running** before starting the backend
- DB credentials live in `backend/.env` — defaults: host `localhost`, user `postgres`, password `1234`, db `mini`
- Uploaded files (campaign images, utilization proofs) are stored in `backend/uploads/`
- No real payments — donation amounts are numbers saved to the database
- The schema sync script (`_schema_sync.py`) auto-adds any new DB columns on startup so you rarely need to reset the DB

---

## If Something Breaks

| Problem | Fix |
|---------|-----|
| `database "mini" does not exist` | Open pgAdmin/psql → `CREATE DATABASE mini;` |
| `connection refused` on :8000 | Backend not running — do Step 2 |
| Campaigns not showing on donor side | Backend not running, or no campaigns created yet |
| `'next' is not recognized` | Run `npm install` first |
| `pip not recognized` | Install Python 3.10+ and add to PATH |
| Images not loading | Check that `backend/uploads/` exists and backend is running |
| Daily limit popup showing unexpectedly | The organizer set a limit on that campaign — donate smaller amounts or wait till tomorrow |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend | FastAPI (Python) |
| Database | PostgreSQL + SQLAlchemy ORM |
| File Storage | Local filesystem (`backend/uploads/`) |

---

## Quick API Reference

| What | URL |
|------|-----|
| Health check | `GET http://localhost:8000/health` |
| All campaigns | `GET http://localhost:8000/campaigns/` |
| Create campaign | `POST http://localhost:8000/campaigns/` |
| Make donation | `POST http://localhost:8000/donations/` |
| Donor impact report | `GET http://localhost:8000/donations/impact?donor_email=x` |
| Fund utilization summary | `GET http://localhost:8000/utilizations/summary/{campaign_id}` |
| Swagger UI | `http://localhost:8000/docs` |
