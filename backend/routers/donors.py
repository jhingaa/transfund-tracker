from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(prefix="/donors", tags=["donors"])


def hash_password(password: str) -> str:
    # Plain-text storage (prototype only, no hashing).
    return password


def verify_password(password: str, stored: str) -> bool:
    return password == stored


@router.post("/register", response_model=schemas.DonorOut)
def register_donor(donor: schemas.DonorCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Donor).filter(models.Donor.email == donor.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_donor = models.Donor(
        name=donor.name,
        email=donor.email,
        phone=donor.phone,
        password_hash=hash_password(donor.password),
    )
    db.add(db_donor)
    db.commit()
    db.refresh(db_donor)
    return db_donor


@router.post("/login")
def login_donor(creds: schemas.DonorLogin, db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.email == creds.email).first()
    if not donor or not verify_password(creds.password, donor.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "message": "Login successful",
        "donor": {
            "id": donor.id,
            "name": donor.name,
            "email": donor.email,
        },
    }


@router.get("/", response_model=List[schemas.DonorOut])
def list_donors(db: Session = Depends(get_db)):
    return db.query(models.Donor).order_by(models.Donor.created_at.desc()).all()


@router.get("/{donor_id}", response_model=schemas.DonorOut)
def get_donor(donor_id: int, db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    return donor


@router.get("/{donor_id}/donations")
def get_donor_donations(donor_id: int, db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    rows = (
        db.query(models.Donation, models.Campaign.title)
        .join(models.Campaign, models.Donation.campaign_id == models.Campaign.id)
        .filter(models.Donation.donor_id == donor_id)
        .order_by(models.Donation.donated_at.desc())
        .all()
    )
    return [
        {
            "id": d.id,
            "campaign_id": d.campaign_id,
            "campaign_title": title,
            "amount": d.amount,
            "status": d.status,
            "payment_method": d.payment_method,
            "donated_at": d.donated_at.isoformat() + "Z",
        }
        for d, title in rows
    ]
