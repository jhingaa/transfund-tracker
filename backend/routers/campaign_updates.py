from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
import time

from database import get_db
import models
import schemas

router = APIRouter(prefix="/campaign-updates", tags=["campaign_updates"])


@router.post("/", response_model=schemas.CampaignUpdateOut)
def create_update(
    campaign_id: int = Form(...),
    title: str = Form(...),
    body: str = Form(...),
    posted_by: str = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    file_url = None
    if file and file.filename:
        upload_dir = os.path.join(os.path.dirname(__file__), "..", "uploads", "updates")
        os.makedirs(upload_dir, exist_ok=True)
        # Prefix with timestamp to avoid collisions; keep original filename for download
        safe_name = f"upd_{campaign_id}_{int(time.time())}_{file.filename.replace(' ', '_')}"
        file_path = os.path.join(upload_dir, safe_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_url = f"/uploads/updates/{safe_name}"

    update = models.CampaignUpdate(
        campaign_id=campaign_id,
        title=title,
        body=body,
        file_url=file_url,
        posted_by=posted_by,
    )
    db.add(update)
    db.commit()
    db.refresh(update)
    return update


@router.get("/", response_model=List[schemas.CampaignUpdateOut])
def list_updates(campaign_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.CampaignUpdate)
        .filter(models.CampaignUpdate.campaign_id == campaign_id)
        .order_by(models.CampaignUpdate.created_at.desc())
        .all()
    )
