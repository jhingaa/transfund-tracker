from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, date

from database import get_db
import models
import schemas

router = APIRouter(prefix="/donations", tags=["donations"])


@router.post("/")
def make_donation(donation: schemas.DonationCreate, db: Session = Depends(get_db)):
    campaign = (
        db.query(models.Campaign)
        .filter(models.Campaign.id == donation.campaign_id)
        .first()
    )
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.status != "active":
        raise HTTPException(status_code=400, detail="This campaign is no longer accepting donations")

    if campaign.daily_donor_limit:
        today_start = datetime.combine(date.today(), datetime.min.time())
        today_total = db.query(func.sum(models.Donation.amount)).filter(
            models.Donation.campaign_id == donation.campaign_id,
            models.Donation.donor_email == donation.donor_email,
            models.Donation.donated_at >= today_start,
        ).scalar() or 0
        if today_total + donation.amount > campaign.daily_donor_limit:
            remaining = max(0, campaign.daily_donor_limit - today_total)
            raise HTTPException(
                status_code=429,
                detail=f"DAILY_LIMIT_REACHED|{campaign.daily_donor_limit:.0f}|{remaining:.0f}"
            )

    db_donation = models.Donation(**donation.dict())
    db.add(db_donation)
    campaign.raised_amount += donation.amount
    if campaign.raised_amount >= campaign.goal_amount:
        campaign.status = "completed"
    db.commit()
    db.refresh(db_donation)

    return {
        "id": db_donation.id,
        "campaign_id": db_donation.campaign_id,
        "campaign_title": campaign.title,
        "donor_name": db_donation.donor_name,
        "donor_email": db_donation.donor_email,
        "amount": db_donation.amount,
        "donated_at": db_donation.donated_at.isoformat() + "Z",
    }


@router.get("/")
def get_donations(
    donor_email: Optional[str] = None,
    organizer_email: Optional[str] = None,
    campaign_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """
    Flexible donations endpoint:
    - ?donor_email=x  → this donor's all donations (with campaign title)
    - ?organizer_email=x → grouped by campaign for the organizer
    - ?campaign_id=x  → all donations for a specific campaign
    """

    # Donor's own donations
    if donor_email:
        rows = (
            db.query(models.Donation, models.Campaign.title)
            .join(models.Campaign, models.Donation.campaign_id == models.Campaign.id)
            .filter(models.Donation.donor_email == donor_email)
            .order_by(models.Donation.donated_at.desc())
            .all()
        )
        return [
            {
                "id": d.id,
                "campaign_id": d.campaign_id,
                "campaign_title": title,
                "donor_name": d.donor_name,
                "donor_email": d.donor_email,
                "amount": d.amount,
                "donated_at": d.donated_at.isoformat() + "Z",
            }
            for d, title in rows
        ]

    # Organizer's donations grouped by campaign
    if organizer_email:
        campaigns = (
            db.query(models.Campaign)
            .filter(models.Campaign.organizer_email == organizer_email)
            .order_by(models.Campaign.created_at.desc())
            .all()
        )
        result = []
        for c in campaigns:
            donations = (
                db.query(models.Donation)
                .filter(models.Donation.campaign_id == c.id)
                .order_by(models.Donation.donated_at.desc())
                .all()
            )
            result.append(
                {
                    "campaign_id": c.id,
                    "campaign_title": c.title,
                    "campaign_category": c.category,
                    "campaign_status": c.status,
                    "donations": [
                        {
                            "id": d.id,
                            "donor_name": d.donor_name,
                            "donor_email": d.donor_email,
                            "amount": d.amount,
                            "donated_at": d.donated_at.isoformat() + "Z",
                        }
                        for d in donations
                    ],
                }
            )
        return result

    # Single campaign donations
    if campaign_id:
        rows = (
            db.query(models.Donation)
            .filter(models.Donation.campaign_id == campaign_id)
            .order_by(models.Donation.donated_at.desc())
            .all()
        )
        return [
            {
                "id": d.id,
                "donor_name": d.donor_name,
                "donor_email": d.donor_email,
                "amount": d.amount,
                "donated_at": d.donated_at.isoformat() + "Z",
            }
            for d in rows
        ]

    raise HTTPException(status_code=400, detail="Provide donor_email, organizer_email, or campaign_id")


@router.get("/impact")
def donor_impact(donor_email: str, db: Session = Depends(get_db)):
    """
    Proportional impact breakdown for a donor.

    For each campaign the donor contributed to, compute their share of
    every logged utilization based on (donor_total / campaign_raised).
    """
    donor_donations = (
        db.query(models.Donation)
        .filter(models.Donation.donor_email == donor_email)
        .all()
    )
    if not donor_donations:
        return []

    # Sum per campaign for this donor
    by_campaign: dict[int, float] = {}
    for d in donor_donations:
        by_campaign[d.campaign_id] = by_campaign.get(d.campaign_id, 0) + d.amount

    result = []
    for campaign_id, donor_total in by_campaign.items():
        campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id).first()
        if not campaign:
            continue
        raised = campaign.raised_amount or 0
        share = (donor_total / raised) if raised > 0 else 0

        utilizations = (
            db.query(models.Utilization)
            .filter(models.Utilization.campaign_id == campaign_id)
            .order_by(models.Utilization.created_at.desc())
            .all()
        )
        total_utilized = sum(u.amount for u in utilizations)
        your_utilized = round(share * total_utilized, 2)
        your_unspent = round(max(0, donor_total - your_utilized), 2)

        result.append({
            "campaign_id": campaign_id,
            "campaign_title": campaign.title,
            "campaign_status": campaign.status,
            "your_donation": round(donor_total, 2),
            "campaign_raised": round(raised, 2),
            "share_percent": round(share * 100, 2),
            "your_utilized": your_utilized,
            "your_unspent": your_unspent,
            "breakdown": [
                {
                    "utilization_id": u.id,
                    "description": u.description,
                    "category": u.category,
                    "utilization_amount": round(u.amount, 2),
                    "your_share": round(share * u.amount, 2),
                    "proof_url": u.proof_url,
                    "created_at": u.created_at.isoformat() + "Z",
                }
                for u in utilizations
            ],
        })

    return result
