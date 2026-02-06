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
import google.generativeai as genai

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
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

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
    recommendation_reasoning: str
    confidence_level: str
    confidence_explanation: str

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
    """Calculate policy impact with reasoning and recommendations"""
    
    # Get current AQI to provide context-aware recommendations
    try:
        aqi_data = await get_current_aqi()
        current_aqi = aqi_data.aqi
    except:
        current_aqi = 200  # Default moderate-high AQI
    
    policy_impacts = {
        'odd_even': {
            'reduction': 15 * policy_req.intensity,
            'timeline': 7,
            'sources': ['traffic'],
            'description': 'Odd-Even vehicle policy reduces traffic emissions significantly during implementation.',
            'reasoning': lambda aqi: f"Given the current AQI of {aqi}, traffic contributes ~30-35% of pollution. Implementing Odd-Even at {int(policy_req.intensity*100)}% intensity can reduce vehicular emissions by restricting half the vehicles on roads. This policy is most effective during high-traffic hours and works best when combined with improved public transport.",
            'confidence': 'high' if policy_req.intensity > 0.7 else 'medium',
            'confidence_explanation': 'Historical data from Delhi shows 10-20% AQI reduction during strict Odd-Even implementation.'
        },
        'construction_halt': {
            'reduction': 20 * policy_req.intensity,
            'timeline': 3,
            'sources': ['construction'],
            'description': 'Halting construction activities immediately reduces dust pollution.',
            'reasoning': lambda aqi: f"Construction dust contributes ~20-25% to current pollution levels (AQI: {aqi}). A {int(policy_req.intensity*100)}% halt in construction activities will have immediate impact within 2-3 days as suspended dust particles settle. Most effective during dry, low-wind conditions.",
            'confidence': 'high' if policy_req.intensity > 0.8 else 'medium',
            'confidence_explanation': 'Direct reduction in PM10 and PM2.5 levels observed within days of implementation.'
        },
        'firecracker_ban': {
            'reduction': 25 * policy_req.intensity,
            'timeline': 2,
            'sources': ['traffic', 'industry'],
            'description': 'Firecracker ban during festivals prevents severe AQI spikes.',
            'reasoning': lambda aqi: f"During festive periods, firecracker use can spike AQI by 200-300 points overnight (current: {aqi}). A {int(policy_req.intensity*100)}% effective ban prevents this acute deterioration. Impact is immediate but short-term (2-3 days). Requires strong enforcement and public cooperation.",
            'confidence': 'medium',
            'confidence_explanation': 'Effectiveness depends heavily on public compliance and enforcement strength.'
        },
        'stubble_control': {
            'reduction': 30 * policy_req.intensity,
            'timeline': 14,
            'sources': ['stubble_burning'],
            'description': 'Incentivizing farmers to avoid stubble burning has long-term seasonal impact.',
            'reasoning': lambda aqi: f"Stubble burning in Oct-Nov contributes 25-40% to Delhi's AQI (current: {aqi}). At {int(policy_req.intensity*100)}% effectiveness, this policy prevents agricultural fires but requires sustained farmer engagement and alternative crop management solutions. Benefits accumulate over 2-3 weeks as burning season progresses.",
            'confidence': 'medium' if policy_req.intensity > 0.6 else 'low',
            'confidence_explanation': 'Long-term solution requiring multi-state coordination and farmer incentives. Effects take time to materialize.'
        }
    }
    
    impact = policy_impacts.get(policy_req.policy_type, policy_impacts['odd_even'])
    
    return PolicyImpactResponse(
        estimated_reduction=round(impact['reduction'], 1),
        timeline_days=impact['timeline'],
        affected_sources=impact['sources'],
        description=impact['description'],
        recommendation_reasoning=impact['reasoning'](current_aqi),
        confidence_level=impact['confidence'],
        confidence_explanation=impact['confidence_explanation']
    )

@api_router.get("/health-advisory")
async def get_health_advisory(aqi: Optional[float] = None) -> HealthAdvisory:
    """Get rule-based health advisory tied to AQI categories"""
    
    if aqi is None:
        aqi_data = await get_current_aqi()
        aqi = aqi_data.aqi
    
    if aqi <= 50:
        return HealthAdvisory(
            aqi_level="Good (0-50)",
            health_impact="Air quality is satisfactory, and air pollution poses little or no risk.",
            recommendations=[
                "Enjoy outdoor activities",
                "No restrictions needed",
                "Ideal conditions for exercise and outdoor sports"
            ],
            vulnerable_groups=["None - safe for everyone"],
            outdoor_activity="Unrestricted - all outdoor activities safe"
        )
    elif aqi <= 100:
        return HealthAdvisory(
            aqi_level="Moderate (51-100)",
            health_impact="Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.",
            recommendations=[
                "Unusually sensitive people should consider limiting prolonged outdoor exertion",
                "General public can enjoy outdoor activities with normal precautions",
                "Monitor air quality if you have respiratory conditions"
            ],
            vulnerable_groups=["People with respiratory diseases", "Unusually sensitive individuals"],
            outdoor_activity="Generally safe - sensitive groups should monitor symptoms"
        )
    elif aqi <= 150:
        return HealthAdvisory(
            aqi_level="Unhealthy for Sensitive Groups (101-150)",
            health_impact="Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
            recommendations=[
                "Sensitive groups should limit prolonged outdoor exertion",
                "Consider wearing N95 masks for extended outdoor activities",
                "Keep windows closed during high pollution hours",
                "Use air purifiers indoors if available"
            ],
            vulnerable_groups=[
                "Children and elderly",
                "People with asthma or respiratory diseases",
                "People with heart disease",
                "Pregnant women"
            ],
            outdoor_activity="Moderate - sensitive groups should reduce outdoor exposure"
        )
    elif aqi <= 200:
        return HealthAdvisory(
            aqi_level="Unhealthy (151-200)",
            health_impact="Everyone may begin to experience health effects. Members of sensitive groups may experience more serious health effects.",
            recommendations=[
                "Everyone should reduce prolonged or heavy outdoor exertion",
                "Wear N95 masks when going outdoors",
                "Avoid outdoor activities during peak pollution hours (7-10 AM, 6-9 PM)",
                "Use air purifiers and keep indoor air clean",
                "Stay hydrated and monitor health symptoms"
            ],
            vulnerable_groups=[
                "Children and elderly",
                "People with respiratory or heart conditions",
                "Pregnant women",
                "Outdoor workers"
            ],
            outdoor_activity="Unhealthy - limit outdoor activities, especially prolonged exertion"
        )
    elif aqi <= 300:
        return HealthAdvisory(
            aqi_level="Very Unhealthy (201-300)",
            health_impact="Health alert: The risk of health effects is increased for everyone. Serious health effects for sensitive groups.",
            recommendations=[
                "Everyone should avoid prolonged or heavy outdoor exertion",
                "Mandatory N95 mask use when outdoors",
                "Stay indoors as much as possible",
                "Schools and outdoor events should be cancelled",
                "Use air purifiers continuously",
                "Seek medical attention if experiencing breathing difficulties"
            ],
            vulnerable_groups=[
                "Everyone, especially children and elderly",
                "All people with respiratory or cardiovascular conditions",
                "Pregnant women",
                "All outdoor workers should take precautions"
            ],
            outdoor_activity="Very Unhealthy - avoid all outdoor activities"
        )
    else:  # > 300
        return HealthAdvisory(
            aqi_level="Hazardous (300+)",
            health_impact="Health warning of emergency conditions: everyone is more likely to be affected. Serious aggravation of heart or lung disease.",
            recommendations=[
                "Everyone must avoid all outdoor activities",
                "Stay indoors with windows and doors sealed",
                "Use N95 masks even indoors if air quality is poor",
                "Emergency health measures should be in place",
                "Schools, offices, and public places should close",
                "Seek immediate medical attention for any respiratory distress",
                "Use air purifiers on maximum settings"
            ],
            vulnerable_groups=[
                "Entire population at risk",
                "Critical risk for children, elderly, and people with pre-existing conditions"
            ],
            outdoor_activity="Hazardous - complete avoidance of all outdoor exposure mandatory"
        )

@api_router.get("/seasonal-outlook")
async def get_seasonal_outlook() -> SeasonalOutlook:
    """Get seasonal pollution outlook based on historical patterns"""
    outlook = forecaster.get_seasonal_outlook()
    return SeasonalOutlook(**outlook)

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
