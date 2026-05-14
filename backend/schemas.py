from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ── Donor Schemas ──────────────────────────────────────────────

class DonorCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str


class DonorOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DonorLogin(BaseModel):
    email: str
    password: str


# ── Campaign Schemas ───────────────────────────────────────────

class CampaignCreate(BaseModel):
    title: str
    description: str
    category: str
    goal_amount: float
    organizer_email: str
    image_url: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class CampaignOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    goal_amount: float
    raised_amount: float
    status: str
    organizer_email: str
    image_url: Optional[str] = None
    close_reason: Optional[str] = None
    daily_donor_limit: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Donation Schemas ───────────────────────────────────────────

class DonationCreate(BaseModel):
    campaign_id: int
    donor_name: str
    donor_email: str
    amount: float
    donor_id: Optional[int] = None
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None


class DonationOut(BaseModel):
    id: int
    campaign_id: int
    donor_id: Optional[int] = None
    donor_name: str
    donor_email: str
    amount: float
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    status: str
    donated_at: datetime
    campaign_title: Optional[str] = None

    class Config:
        from_attributes = True


# ── Receipt Schemas ────────────────────────────────────────────

class ReceiptCreate(BaseModel):
    donation_id: int


class ReceiptOut(BaseModel):
    id: int
    donation_id: int
    receipt_number: str
    amount: float
    issued_to: str
    issued_at: datetime

    class Config:
        from_attributes = True


# ── Utilization Schemas ────────────────────────────────────────

class UtilizationCreate(BaseModel):
    campaign_id: int
    amount: float
    description: str
    category: Optional[str] = "general"
    proof_url: Optional[str] = None
    created_by: str


class UtilizationOut(BaseModel):
    id: int
    campaign_id: int
    amount: float
    description: str
    proof_url: Optional[str] = None
    category: str
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Campaign Update Schemas ────────────────────────────────────

class CampaignUpdateOut(BaseModel):
    id: int
    campaign_id: int
    title: str
    body: str
    file_url: Optional[str] = None
    posted_by: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Admin Schemas ──────────────────────────────────────────────

class AdminCreate(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "moderator"


class AdminOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class AdminLogin(BaseModel):
    email: str
    password: str
