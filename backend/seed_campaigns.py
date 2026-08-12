"""
Seed module for default campaigns.

  Called automatically at startup (seeds only when the campaigns table is empty).
  Can also be run directly to force a full reseed:

      python seed_campaigns.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine
import models
from models import Base
from datetime import datetime, timedelta

Base.metadata.create_all(bind=engine)

ORGANIZER_EMAIL = "defaul@gmail.com"
ORGANIZER_NAME  = "default"

CAMPAIGNS = [
    {
        "title": "Scholarships for Rural Girls — 2026",
        "description": (
            "Every year, thousands of talented girls from rural India drop out before Class 10 "
            "because their families cannot afford tuition, books, and transport. This campaign "
            "provides full scholarships — covering fees, stationery, uniforms, and a monthly "
            "stipend — to 200 meritorious girls across Rajasthan, Odisha, and Jharkhand. "
            "Funds are disbursed directly to school principals against attendance records, "
            "ensuring 100 % utilization transparency."
        ),
        "category": "Education",
        "goal_amount": 1_500_000,
        "raised_amount": 342_000,
        "status": "active",
        "image_url": "/uploads/campaign_education.jpg",
        "end_days": 90,
    },
    {
        "title": "Free Cancer Screening Drive — Tier-2 Cities",
        "description": (
            "Late-stage cancer diagnosis is the leading cause of preventable cancer deaths in "
            "India's smaller cities, simply because screening is unaffordable. We are deploying "
            "mobile diagnostic units across 12 tier-2 cities to conduct free mammography, "
            "cervical-cancer PAP smears, and oral-cancer checks. Every rupee funds one "
            "additional test kit. Partnered with Tata Memorial Hospital and Apollo Foundation."
        ),
        "category": "Medical",
        "goal_amount": 2_000_000,
        "raised_amount": 875_000,
        "status": "active",
        "image_url": "/uploads/campaign_medical.jpg",
        "end_days": 60,
    },
    {
        "title": "National Youth Tech Summit 2026",
        "description": (
            "India's largest student-run technology conference returns for its fifth edition in "
            "Bengaluru this August. Three days of keynotes, hackathons, workshops on AI/ML and "
            "Web3, and networking with 80+ industry mentors. All proceeds after venue costs are "
            "used to fund travel grants for students from North-East India and J&K who would "
            "otherwise be unable to attend."
        ),
        "category": "Events",
        "goal_amount": 800_000,
        "raised_amount": 210_000,
        "status": "active",
        "image_url": "/uploads/campaign_events.jpg",
        "end_days": 75,
    },
    {
        "title": "GreenIndia — Plant 1 Million Trees",
        "description": (
            "Deforestation has stripped 40 % of India's original forest cover. GreenIndia, a "
            "registered NGO, plants native-species saplings along degraded river banks and "
            "abandoned mine sites. Each Rs.150 donated plants, nurtures, and geo-tags one sapling "
            "for three years. Donors receive a digital certificate with their sapling's GPS "
            "coordinates and quarterly satellite growth updates."
        ),
        "category": "NGOs",
        "goal_amount": 15_000_000,
        "raised_amount": 3_450_000,
        "status": "active",
        "image_url": "/uploads/campaign_ngos.jpg",
        "end_days": 180,
    },
    {
        "title": "Clean Drinking Water for 10 Villages",
        "description": (
            "Over 600 households across 10 villages in Bundelkhand still rely on contaminated "
            "ponds for drinking water, causing chronic diarrhoea and waterborne disease. This "
            "campaign installs solar-powered RO purification plants and overhead storage tanks. "
            "The community water committee, trained by our engineers, handles maintenance. "
            "Project completion is estimated within 5 months of funding."
        ),
        "category": "Community",
        "goal_amount": 2_500_000,
        "raised_amount": 980_000,
        "status": "active",
        "image_url": "/uploads/campaign_community.jpg",
        "end_days": 150,
    },
    {
        "title": "Cyclone Relief — Odisha Coastal Districts",
        "description": (
            "Cyclone Shakti made landfall on 8 May 2026, displacing over 1.2 lakh people across "
            "Puri, Jagatsinghpur, and Kendrapara districts. Immediate needs include emergency "
            "food kits (rice, dal, oil), waterproof tarpaulins, oral rehydration salts, and "
            "hygiene packs. Funds are being coordinated with the Odisha State Disaster Management "
            "Authority. Daily disbursement updates are posted here."
        ),
        "category": "Emergency",
        "goal_amount": 5_000_000,
        "raised_amount": 2_100_000,
        "status": "active",
        "image_url": "/uploads/campaign_emergency.jpg",
        "end_days": 30,
    },
    {
        "title": "Stray Animal Welfare & Sterilisation Programme",
        "description": (
            "India has an estimated 35 million stray dogs and countless stray cats living in "
            "urban misery. This programme funds free veterinary treatment, vaccination, and ABC "
            "(Animal Birth Control) sterilisation surgeries at certified shelters in Mumbai, "
            "Delhi, and Chennai. Each Rs.500 covers one surgery and post-operative care. Reducing "
            "the stray population humanely is the only long-term solution."
        ),
        "category": "General",
        "goal_amount": 1_000_000,
        "raised_amount": 127_000,
        "status": "active",
        "image_url": "/uploads/campaign_general.jpg",
        "end_days": 120,
    },
    {
        "title": "Accessible Spaces — Inclusion for Persons with Disabilities",
        "description": (
            "Millions of persons with disabilities across India are denied equal access to "
            "public buildings, transport hubs, and workplaces because of missing ramps, "
            "broken lifts, and absent tactile paths. This campaign funds accessibility audits "
            "and retrofits in 50 public institutions — government offices, railway stations, "
            "and schools — across five states. Each audit report is published openly so "
            "citizens can hold institutions accountable."
        ),
        "category": "Others",
        "goal_amount": 1_200_000,
        "raised_amount": 88_000,
        "status": "active",
        "image_url": "/uploads/campaign_others.jpg",
        "end_days": 100,
    },
]


def _ensure_organizer(db):
    org = db.query(models.Organizer).filter_by(email=ORGANIZER_EMAIL).first()
    if not org:
        org = models.Organizer(
            name=ORGANIZER_NAME,
            email=ORGANIZER_EMAIL,
            password_hash="1234",
        )
        db.add(org)
        db.commit()


def _insert_campaigns(db):
    now = datetime.utcnow()
    for data in CAMPAIGNS:
        c = models.Campaign(
            title=data["title"],
            description=data["description"],
            category=data["category"],
            goal_amount=data["goal_amount"],
            raised_amount=data["raised_amount"],
            status=data["status"],
            organizer_email=ORGANIZER_EMAIL,
            image_url=data.get("image_url"),
            start_date=now,
            end_date=now + timedelta(days=data["end_days"]),
        )
        db.add(c)
    db.commit()


def seed_if_empty():
    """Seed default campaigns only when the campaigns table is empty."""
    db = SessionLocal()
    try:
        if db.query(models.Campaign).count() > 0:
            return
        print("[seed] No campaigns found — seeding defaults …")
        _ensure_organizer(db)
        _insert_campaigns(db)
        print(f"[seed] Done — {len(CAMPAIGNS)} default campaigns inserted.")
    except Exception as e:
        db.rollback()
        print(f"[seed] ERROR: {e}")
    finally:
        db.close()


def seed_force():
    """Wipe all campaign-related data and re-seed from scratch."""
    db = SessionLocal()
    try:
        print("[seed] Wiping campaign data …")
        db.query(models.CampaignUpdate).delete()
        db.query(models.Receipt).delete()
        db.query(models.Utilization).delete()
        db.query(models.Donation).delete()
        db.query(models.Campaign).delete()
        db.commit()
        _ensure_organizer(db)
        _insert_campaigns(db)
        print(f"[seed] Done — {len(CAMPAIGNS)} campaigns re-seeded.")
    except Exception as e:
        db.rollback()
        print(f"[seed] ERROR: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    seed_force()
