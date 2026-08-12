from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(prefix="/receipts", tags=["receipts"])


def generate_receipt_number(db: Session) -> str:
    """Generate the next receipt number in RCP-XXXXX format."""
    last = (
        db.query(models.Receipt)
        .order_by(models.Receipt.id.desc())
        .first()
    )
    next_num = (last.id + 1) if last else 1
    return f"RCP-{next_num:05d}"


@router.post("/", response_model=schemas.ReceiptOut)
def create_receipt(data: schemas.ReceiptCreate, db: Session = Depends(get_db)):
    # Check donation exists
    donation = (
        db.query(models.Donation)
        .filter(models.Donation.id == data.donation_id)
        .first()
    )
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    # Check if receipt already exists for this donation
    existing = (
        db.query(models.Receipt)
        .filter(models.Receipt.donation_id == data.donation_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Receipt already exists for this donation")

    receipt = models.Receipt(
        donation_id=donation.id,
        receipt_number=generate_receipt_number(db),
        amount=donation.amount,
        issued_to=donation.donor_name,
    )
    db.add(receipt)
    db.commit()
    db.refresh(receipt)
    return receipt


@router.get("/", response_model=List[schemas.ReceiptOut])
def list_receipts(
    donor_email: str = None,
    db: Session = Depends(get_db),
):
    if donor_email:
        rows = (
            db.query(models.Receipt)
            .join(models.Donation, models.Receipt.donation_id == models.Donation.id)
            .filter(models.Donation.donor_email == donor_email)
            .order_by(models.Receipt.issued_at.desc())
            .all()
        )
        return rows

    return db.query(models.Receipt).order_by(models.Receipt.issued_at.desc()).all()


@router.get("/{receipt_id}", response_model=schemas.ReceiptOut)
def get_receipt(receipt_id: int, db: Session = Depends(get_db)):
    receipt = db.query(models.Receipt).filter(models.Receipt.id == receipt_id).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return receipt


@router.get("/by-donation/{donation_id}", response_model=schemas.ReceiptOut)
def get_receipt_by_donation(donation_id: int, db: Session = Depends(get_db)):
    receipt = (
        db.query(models.Receipt)
        .filter(models.Receipt.donation_id == donation_id)
        .first()
    )
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found for this donation")
    return receipt
