from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Literal, Optional

from database import get_db
import models

router = APIRouter(prefix="/auth", tags=["auth"])


def _hash(password: str) -> str:
    # Plain-text storage (prototype only, no hashing).
    return password


def _verify(password: str, stored: str) -> bool:
    return password == stored


class UpsertRequest(BaseModel):
    role: Literal["donor", "organizer"]
    name: str
    email: str
    password: Optional[str] = None


class RegisterRequest(BaseModel):
    role: Literal["donor", "organizer"]
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    role: Literal["donor", "organizer"]
    name: str
    email: str
    password: str


def _model_for(role: str):
    return models.Donor if role == "donor" else models.Organizer


@router.post("/upsert")
def upsert_user(req: UpsertRequest, db: Session = Depends(get_db)):
    """No-auth user profile: create or update by email+role."""
    Model = _model_for(req.role)
    user = db.query(Model).filter(Model.email == req.email.strip().lower()).first()

    if user is None:
        user = Model(
            name=req.name.strip(),
            email=req.email.strip().lower(),
            password_hash=_hash(req.password) if req.password else "",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        created = True
    else:
        if req.name and req.name.strip() and req.name.strip() != user.name:
            user.name = req.name.strip()
            db.commit()
            db.refresh(user)
        created = False

    return {
        "message": "Profile created" if created else "Profile found",
        "created": created,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": req.role,
        },
    }


@router.post("/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    """Create a new account. Fails if email already registered for that role."""
    Model = _model_for(req.role)
    existing = db.query(Model).filter(Model.email == req.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = Model(
        name=req.name.strip(),
        email=req.email.strip().lower(),
        password_hash=_hash(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "message": "Account created",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": req.role,
        },
    }


@router.post("/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate an existing user with email + password."""
    Model = _model_for(req.role)
    user = db.query(Model).filter(Model.email == req.email.strip().lower()).first()

    if user is None:
        raise HTTPException(status_code=404, detail="No account found with that email")

    if not _verify(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")

    if req.name and req.name.strip() and req.name.strip() != user.name:
        user.name = req.name.strip()
        db.commit()
        db.refresh(user)

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": req.role,
        },
    }
