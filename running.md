# TransFund Tracker — How to Run

## Step-by-Step (Do This In Order)

### Step 1: Open PostgreSQL
- Open **pgAdmin** or **SQL Shell (psql)** from Start Menu
- Make sure PostgreSQL service is running
- Create the database (only first time):
```sql
CREATE DATABASE mini;
```

### Step 2: Start the Backend Server
Open a **terminal** and run:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
Wait until you see:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```
> ⚠️ Keep this terminal open. Don't close it.

### Step 3: Start the Frontend
Open a **second terminal** and run:
```bash
npm run dev
```
Wait until you see:
```
▲ Next.js 16.2.3
- Local: http://localhost:3000
```

### Step 4: Open the App
Go to **http://localhost:3000/login** in your browser.

---

## How to Use

### Login as Organizer
1. Select **Organizer** → enter any email & password (min 6 chars) → Login
2. Click **Create Campaign** in sidebar → fill details → Publish
3. Campaign is now saved in the database

### Login as Donor
1. Select **Donor** → enter any email & password → Login
2. You'll see the campaigns created by organizers
3. Click a campaign → **Donate Now** → pick amount → Confirm
4. Donation is saved in DB and reflected on both donor & organizer side

---

## Important Notes

- **Both terminals must be running** (backend on :8000 + frontend on :3000)
- **PostgreSQL must be running** before starting the backend
- Auth is fake — no real signup, just enter any email/password to log in
- No real money — donation amounts are just numbers saved to the database
- DB credentials are in `backend/.env` — default is `postgres` / `1234` / `mini`
- Campaign images are stored in `backend/uploads/`

---

## If Something Breaks

| Problem | Fix |
|---------|-----|
| `database "mini" does not exist` | Open pgAdmin/psql and run `CREATE DATABASE mini;` |
| `connection refused` on :8000 | Backend not running. Start it (Step 2) |
| Campaigns not showing on donor side | Backend not running, or no campaigns created yet |
| `'next' is not recognized` | Run `npm install` first |
| `pip not recognized` | Install Python and add to PATH |

---

## Tech Used

| What | Tech |
|------|------|
| Frontend | Next.js 16 + React 19 + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Charts | Recharts |

---

## API (for reference)

| What | URL |
|------|-----|
| Health check | `GET http://localhost:8000/health` |
| All campaigns | `GET http://localhost:8000/campaigns/` |
| Create campaign | `POST http://localhost:8000/campaigns/` |
| Make donation | `POST http://localhost:8000/donations/` |
| Swagger docs | `http://localhost:8000/docs` |
