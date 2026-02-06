from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import aiohttp
import bcrypt

from utils.email_service import send_report_confirmation, send_status_update
from ml_models.aqi_forecaster import forecaster
from ml_models.source_attribution import attribution_model

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@delhiair.gov.in')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'DelhiAir@2026')
WAQI_API_TOKEN = os.environ.get('WAQI_API_TOKEN')

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    email: str
    role: str

class PollutionReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    mobile: str
    email: EmailStr
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: int = Field(ge=1, le=5)
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: str = Field(default="pending")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PollutionReportCreate(BaseModel):
    name: str
    mobile: str
    email: EmailStr
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: int = Field(ge=1, le=5)
    description: Optional[str] = None
    image_url: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str

class AQIData(BaseModel):
    aqi: float
    category: str
    location: str
    pollutants: dict
    timestamp: datetime

class ForecastResponse(BaseModel):
    aqi_48h: float
    aqi_72h: float
    trend: str
    confidence: float
    confidence_level: str
    confidence_explanation: str
    factors: dict
    prediction_type: str
    model_version: str
    explanation: str
    weather_conditions: dict

class SourceContribution(BaseModel):
    contributions: dict
    dominant_source: str
    confidence: float
    confidence_level: str
    confidence_explanation: str
    factors_considered: dict
    prediction_type: str
    model_version: str
    explanation: str
    pollutant_indicators: dict

class HealthAdvisory(BaseModel):
    aqi_level: str
    health_impact: str
    recommendations: List[str]
    vulnerable_groups: List[str]
    outdoor_activity: str

class SeasonalOutlook(BaseModel):
    current_month: int
    current_month_name: str
    monthly_patterns: dict
    high_risk_season: bool
    high_risk_months: List[str]
    low_risk_months: List[str]
    current_outlook: str

class SafeRouteRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float

class SafeRouteResponse(BaseModel):
    route_points: List[dict]
    avg_aqi: float
    recommendation: str

class PolicyImpactRequest(BaseModel):
    policy_type: str
    intensity: float

class PolicyImpactResponse(BaseModel):
    estimated_reduction: float
    timeline_days: int
    affected_sources: List[str]
    description: str

@api_router.post("/auth/login", response_model=LoginResponse)
async def admin_login(credentials: LoginRequest):
    if credentials.email == ADMIN_EMAIL and credentials.password == ADMIN_PASSWORD:
        token = str(uuid.uuid4())
        return LoginResponse(
            token=token,
            email=credentials.email,
            role="admin"
        )
    raise HTTPException(status_code=401, detail="Invalid credentials")

@api_router.get("/aqi/current", response_model=AQIData)
async def get_current_aqi():
    try:
        async with aiohttp.ClientSession() as session:
            url = f"https://api.waqi.info/feed/delhi/?token={WAQI_API_TOKEN}"
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('status') == 'ok':
                        aqi_val = data['data']['aqi']
                        iaqi = data['data'].get('iaqi', {})
                        
                        category = "Good"
                        if aqi_val > 300:
                            category = "Hazardous"
                        elif aqi_val > 200:
                            category = "Very Unhealthy"
                        elif aqi_val > 150:
                            category = "Unhealthy"
                        elif aqi_val > 100:
                            category = "Unhealthy for Sensitive Groups"
                        elif aqi_val > 50:
                            category = "Moderate"
                        
                        pollutants = {
                            'pm25': iaqi.get('pm25', {}).get('v', 0),
                            'pm10': iaqi.get('pm10', {}).get('v', 0),
                            'no2': iaqi.get('no2', {}).get('v', 0),
                            'so2': iaqi.get('so2', {}).get('v', 0),
                            'co': iaqi.get('co', {}).get('v', 0),
                            'o3': iaqi.get('o3', {}).get('v', 0)
                        }
                        
                        return AQIData(
                            aqi=float(aqi_val),
                            category=category,
                            location="Delhi NCR",
                            pollutants=pollutants,
                            timestamp=datetime.now(timezone.utc)
                        )
    except Exception as e:
        logger.error(f"Error fetching AQI: {str(e)}")
    
    return AQIData(
        aqi=156.0,
        category="Unhealthy",
        location="Delhi NCR",
        pollutants={'pm25': 85, 'pm10': 120, 'no2': 45, 'so2': 12, 'co': 1.8, 'o3': 35},
        timestamp=datetime.now(timezone.utc)
    )

@api_router.get("/aqi/forecast", response_model=ForecastResponse)
async def get_forecast():
    try:
        aqi_data = await get_current_aqi()
        weather_data = {'temp': 28, 'humidity': 65, 'wind_speed': 6}
        
        forecast_result = forecaster.predict(
            current_aqi=aqi_data.aqi,
            weather_data=weather_data,
            hour_of_day=datetime.now().hour
        )
        
        return ForecastResponse(**forecast_result)
    except Exception as e:
        logger.error(f"Error generating forecast: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate forecast")

@api_router.get("/aqi/sources", response_model=SourceContribution)
async def get_pollution_sources():
    try:
        aqi_data = await get_current_aqi()
        weather_data = {'temp': 28, 'humidity': 65, 'wind_speed': 6}
        
        result = attribution_model.predict(
            pollutants=aqi_data.pollutants,
            weather=weather_data,
            month=datetime.now().month,
            fire_count=0
        )
        
        return SourceContribution(**result)
    except Exception as e:
        logger.error(f"Error getting sources: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get pollution sources")

@api_router.post("/reports", response_model=PollutionReport)
async def create_report(report: PollutionReportCreate):
    try:
        report_obj = PollutionReport(**report.model_dump())
        doc = report_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.pollution_reports.insert_one(doc)
        
        await send_report_confirmation(report.email, report.name, report_obj.id)
        
        return report_obj
    except Exception as e:
        logger.error(f"Error creating report: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create report")

@api_router.get("/reports", response_model=List[PollutionReport])
async def get_reports(status: Optional[str] = None):
    try:
        query = {}
        if status:
            query['status'] = status
        
        reports = await db.pollution_reports.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
        
        for report in reports:
            if isinstance(report['created_at'], str):
                report['created_at'] = datetime.fromisoformat(report['created_at'])
        
        return reports
    except Exception as e:
        logger.error(f"Error fetching reports: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch reports")

@api_router.patch("/reports/{report_id}/status")
async def update_report_status(report_id: str, status_update: StatusUpdate):
    try:
        report = await db.pollution_reports.find_one({"id": report_id}, {"_id": 0})
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        await db.pollution_reports.update_one(
            {"id": report_id},
            {"$set": {"status": status_update.status}}
        )
        
        await send_status_update(
            report['email'],
            report['name'],
            report_id,
            status_update.status
        )
        
        return {"message": "Status updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update status")

@api_router.post("/routes/safe", response_model=SafeRouteResponse)
async def calculate_safe_route(route_req: SafeRouteRequest):
    try:
        mid_lat = (route_req.start_lat + route_req.end_lat) / 2
        mid_lng = (route_req.start_lng + route_req.end_lng) / 2
        
        route_points = [
            {"lat": route_req.start_lat, "lng": route_req.start_lng, "aqi": 165},
            {"lat": mid_lat, "lng": mid_lng, "aqi": 140},
            {"lat": route_req.end_lat, "lng": route_req.end_lng, "aqi": 155}
        ]
        
        avg_aqi = sum(p['aqi'] for p in route_points) / len(route_points)
        
        recommendation = "Moderate pollution levels along route. Consider using public transport."
        if avg_aqi > 200:
            recommendation = "High pollution levels. Wear N95 mask and avoid peak traffic hours."
        elif avg_aqi < 100:
            recommendation = "Good air quality along route. Safe for travel."
        
        return SafeRouteResponse(
            route_points=route_points,
            avg_aqi=round(avg_aqi, 1),
            recommendation=recommendation
        )
    except Exception as e:
        logger.error(f"Error calculating route: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to calculate route")

@api_router.post("/policy/impact", response_model=PolicyImpactResponse)
async def calculate_policy_impact(policy_req: PolicyImpactRequest):
    policy_impacts = {
        'odd_even': {
            'reduction': 15 * policy_req.intensity,
            'timeline': 7,
            'sources': ['traffic'],
            'description': 'Odd-Even vehicle policy reduces traffic emissions significantly during implementation.'
        },
        'construction_halt': {
            'reduction': 20 * policy_req.intensity,
            'timeline': 3,
            'sources': ['construction'],
            'description': 'Halting construction activities immediately reduces dust pollution.'
        },
        'firecracker_ban': {
            'reduction': 25 * policy_req.intensity,
            'timeline': 2,
            'sources': ['traffic', 'industry'],
            'description': 'Firecracker ban during festivals prevents severe AQI spikes.'
        },
        'stubble_control': {
            'reduction': 30 * policy_req.intensity,
            'timeline': 14,
            'sources': ['stubble_burning'],
            'description': 'Incentivizing farmers to avoid stubble burning has long-term seasonal impact.'
        }
    }
    
    impact = policy_impacts.get(policy_req.policy_type, policy_impacts['odd_even'])
    
    return PolicyImpactResponse(
        estimated_reduction=round(impact['reduction'], 1),
        timeline_days=impact['timeline'],
        affected_sources=impact['sources'],
        description=impact['description']
    )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
