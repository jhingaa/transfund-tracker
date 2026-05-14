from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(prefix="/admins", tags=["admins"])


def hash_password(password: str) -> str:
    # Plain-text storage (prototype only, no hashing).
    return password


def verify_password(password: str, stored: str) -> bool:
    return password == stored


@router.post("/register", response_model=schemas.AdminOut)
def register_admin(admin: schemas.AdminCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Admin).filter(
        (models.Admin.email == admin.email) | (models.Admin.username == admin.username)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Admin with this email or username already exists")

    db_admin = models.Admin(
        username=admin.username,
        email=admin.email,
        password_hash=hash_password(admin.password),
        role=admin.role or "moderator",
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin


@router.post("/login")
def login_admin(creds: schemas.AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.email == creds.email).first()
    if not admin or not verify_password(creds.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "message": "Login successful",
        "admin": {
            "id": admin.id,
            "username": admin.username,
            "email": admin.email,
            "role": admin.role,
        },
    }


@router.get("/", response_model=List[schemas.AdminOut])
def list_admins(db: Session = Depends(get_db)):
    return db.query(models.Admin).order_by(models.Admin.created_at.desc()).all()


@router.get("/{admin_id}", response_model=schemas.AdminOut)
def get_admin(admin_id: int, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin


@router.delete("/{admin_id}")
def delete_admin(admin_id: int, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    db.delete(admin)
    db.commit()
    return {"message": f"Admin '{admin.username}' deleted"}
