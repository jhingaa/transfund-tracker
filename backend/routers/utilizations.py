from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os

from database import get_db
import models
import schemas

router = APIRouter(prefix="/utilizations", tags=["utilizations"])


@router.post("/", response_model=schemas.UtilizationOut)
def create_utilization(
    campaign_id: int = Form(...),
    amount: float = Form(...),
    description: str = Form(...),
    category: str = Form("general"),
    created_by: str = Form(...),
    proof: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Verify campaign exists
    campaign = (
        db.query(models.Campaign)
        .filter(models.Campaign.id == campaign_id)
        .first()
    )
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    proof_url = None
    if proof and proof.filename:
        upload_dir = os.path.join(os.path.dirname(__file__), "..", "uploads", "proofs")
        os.makedirs(upload_dir, exist_ok=True)
        safe_name = f"util_{campaign_id}_{proof.filename.replace(' ', '_')}"
        file_path = os.path.join(upload_dir, safe_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(proof.file, buffer)
        proof_url = f"/uploads/proofs/{safe_name}"

    utilization = models.Utilization(
        campaign_id=campaign_id,
        amount=amount,
        description=description,
        category=category,
        proof_url=proof_url,
        created_by=created_by,
    )
    db.add(utilization)
    db.commit()
    db.refresh(utilization)
    return utilization


@router.get("/", response_model=List[schemas.UtilizationOut])
def list_utilizations(
    campaign_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Utilization)
    if campaign_id:
        query = query.filter(models.Utilization.campaign_id == campaign_id)
    return query.order_by(models.Utilization.created_at.desc()).all()


@router.get("/{utilization_id}", response_model=schemas.UtilizationOut)
def get_utilization(utilization_id: int, db: Session = Depends(get_db)):
    util = (
        db.query(models.Utilization)
        .filter(models.Utilization.id == utilization_id)
        .first()
    )
    if not util:
        raise HTTPException(status_code=404, detail="Utilization record not found")
    return util


@router.get("/summary/{campaign_id}")
def utilization_summary(campaign_id: int, db: Session = Depends(get_db)):
    """Get total utilized vs raised for a campaign — transparency dashboard."""
    campaign = (
        db.query(models.Campaign)
        .filter(models.Campaign.id == campaign_id)
        .first()
    )
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    utilizations = (
        db.query(models.Utilization)
        .filter(models.Utilization.campaign_id == campaign_id)
        .all()
    )

    total_utilized = sum(u.amount for u in utilizations)
    return {
        "campaign_id": campaign_id,
        "campaign_title": campaign.title,
        "total_raised": campaign.raised_amount,
        "total_utilized": total_utilized,
        "remaining": campaign.raised_amount - total_utilized,
        "utilization_count": len(utilizations),
    }
