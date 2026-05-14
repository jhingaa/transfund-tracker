from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os

from database import get_db
import models
import schemas

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.get("/", response_model=List[schemas.CampaignOut])
def get_campaigns(
    category: Optional[str] = None,
    organizer_email: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Campaign)
    if category and category != "All":
        query = query.filter(models.Campaign.category == category)
    if organizer_email:
        query = query.filter(models.Campaign.organizer_email == organizer_email)
    return query.order_by(models.Campaign.created_at.desc()).all()


@router.get("/{campaign_id}", response_model=schemas.CampaignOut)
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = (
        db.query(models.Campaign)
        .filter(models.Campaign.id == campaign_id)
        .first()
    )
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.post("/", response_model=schemas.CampaignOut)
def create_campaign(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    goal_amount: float = Form(...),
    organizer_email: str = Form(...),
    daily_donor_limit: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    image_url = None
    if image and image.filename:
        upload_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        safe_name = image.filename.replace(" ", "_")
        file_path = os.path.join(upload_dir, safe_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/uploads/{safe_name}"

    campaign = models.Campaign(
        title=title,
        description=description,
        category=category,
        goal_amount=goal_amount,
        organizer_email=organizer_email,
        image_url=image_url,
        daily_donor_limit=daily_donor_limit,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign

class CloseRequest(BaseModel):
    reason: str


@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = (
        db.query(models.Campaign)
        .filter(models.Campaign.id == campaign_id)
        .first()
    )
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    # Delete child records to satisfy FK constraints
    donations = db.query(models.Donation).filter(models.Donation.campaign_id == campaign_id).all()
    for donation in donations:
        db.query(models.Receipt).filter(models.Receipt.donation_id == donation.id).delete()
    db.query(models.Donation).filter(models.Donation.campaign_id == campaign_id).delete()
    db.query(models.Utilization).filter(models.Utilization.campaign_id == campaign_id).delete()
    db.query(models.CampaignUpdate).filter(models.CampaignUpdate.campaign_id == campaign_id).delete()
    if campaign.image_url:
        img_path = os.path.join(os.path.dirname(__file__), "..", campaign.image_url.lstrip("/"))
        if os.path.exists(img_path):
            os.remove(img_path)
    db.delete(campaign)
    db.commit()
    return {"message": "Campaign deleted"}


@router.patch("/{campaign_id}/close")
def close_campaign(
    campaign_id: int,
    body: CloseRequest,
    db: Session = Depends(get_db),
):
    campaign = (
        db.query(models.Campaign)
        .filter(models.Campaign.id == campaign_id)
        .first()
    )
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    campaign.status = "completed"
    campaign.close_reason = body.reason
    db.commit()
    return {"message": "Campaign closed", "reason": body.reason}
