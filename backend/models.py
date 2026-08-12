from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Donor(Base):
    __tablename__ = "donors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    donations = relationship("Donation", back_populates="donor")


class Organizer(Base):
    __tablename__ = "organizers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, default="General")
    goal_amount = Column(Float, default=0)
    raised_amount = Column(Float, default=0)
    status = Column(String, default="active")  # active | completed | cancelled
    organizer_email = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    close_reason = Column(String, nullable=True)
    daily_donor_limit = Column(Float, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    donations = relationship("Donation", back_populates="campaign")
    utilizations = relationship("Utilization", back_populates="campaign")


class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    donor_id = Column(Integer, ForeignKey("donors.id"), nullable=True)
    donor_name = Column(String, nullable=False)
    donor_email = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, nullable=True)  # UPI | Card | Bank Transfer
    transaction_id = Column(String, nullable=True)
    status = Column(String, default="completed")  # pending | completed | failed
    donated_at = Column(DateTime, default=datetime.utcnow)

    campaign = relationship("Campaign", back_populates="donations")
    donor = relationship("Donor", back_populates="donations")
    receipt = relationship("Receipt", back_populates="donation", uselist=False)


class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(Integer, primary_key=True, index=True)
    donation_id = Column(Integer, ForeignKey("donations.id"), unique=True, nullable=False)
    receipt_number = Column(String, unique=True, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    issued_to = Column(String, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)

    donation = relationship("Donation", back_populates="receipt")


class Utilization(Base):
    __tablename__ = "utilizations"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    proof_url = Column(String, nullable=True)
    category = Column(String, default="general")  # logistics | medical | infrastructure | general
    created_by = Column(String, nullable=False)  # organizer email
    created_at = Column(DateTime, default=datetime.utcnow)

    campaign = relationship("Campaign", back_populates="utilizations")


class CampaignUpdate(Base):
    __tablename__ = "campaign_updates"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    file_url = Column(String, nullable=True)
    posted_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="moderator")  # super_admin | moderator
    created_at = Column(DateTime, default=datetime.utcnow)
