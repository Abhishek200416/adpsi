from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent
DATABASE_URL = os.environ.get('SQLITE_DB_URL', f'sqlite:///{ROOT_DIR}/aqi_data.db')

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ORM Models
class AdminUser(Base):
    """Admin user model - compatible with PostgreSQL"""
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="admin")
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class PollutionReportDB(Base):
    """Pollution report model - compatible with PostgreSQL"""
    __tablename__ = "pollution_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    mobile = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False)
    location = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    severity = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(1000), nullable=True)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AQIPredictionLog(Base):
    """Log of AQI predictions - for analytics"""
    __tablename__ = "aqi_prediction_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    current_aqi = Column(Float, nullable=False)
    aqi_24h = Column(Float, nullable=True)
    aqi_48h = Column(Float, nullable=False)
    aqi_72h = Column(Float, nullable=False)
    trend = Column(String(50))
    confidence = Column(Float)
    model_version = Column(String(100))
    prediction_type = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)

class SourceAttributionLog(Base):
    """Log of source attribution predictions - for analytics"""
    __tablename__ = "source_attribution_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    traffic = Column(Float, nullable=False)
    industry = Column(Float, nullable=False)
    construction = Column(Float, nullable=False)
    stubble_burning = Column(Float, nullable=False)
    other = Column(Float, nullable=False)
    dominant_source = Column(String(100))
    confidence = Column(Float)
    model_version = Column(String(100))
    prediction_type = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)

# Create all tables
def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")

# Dependency for FastAPI
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
