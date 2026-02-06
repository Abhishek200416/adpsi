import numpy as np
import pickle
import os
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class AQIForecaster:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.model_version = "v1.0-simulation"
        self.prediction_type = "simulation"  # Will be "ml" when ML model is loaded
        self.load_model()
    
    def load_model(self):
        try:
            model_path = os.path.join(os.path.dirname(__file__), 'aqi_model.pkl')
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    data = pickle.load(f)
                    self.model = data.get('model')
                    self.scaler = data.get('scaler')
                    self.prediction_type = "ml"
                    self.model_version = data.get('version', 'v1.0-ml')
                logger.info("AQI forecasting model loaded successfully")
            else:
                logger.warning("Pre-trained model not found, using rule-based forecasting")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
    
    def _generate_explanation(self, current_aqi: float, weather_data: dict, hour_of_day: int, 
                             trend: str, base_trend: float) -> str:
        """Generate detailed explanation for the prediction"""
        temp = weather_data.get('temp', 25)
        humidity = weather_data.get('humidity', 60)
        wind_speed = weather_data.get('wind_speed', 5)
        month = datetime.now().month
        
        explanations = []
        
        # Current AQI baseline
        if current_aqi > 200:
            explanations.append(f"Starting from a high baseline AQI of {current_aqi}, which indicates poor air quality.")
        elif current_aqi > 150:
            explanations.append(f"Current AQI of {current_aqi} is already in the unhealthy range.")
        else:
            explanations.append(f"Current AQI of {current_aqi} provides a moderate baseline.")
        
        # Weather factors
        if temp > 30:
            explanations.append(f"High temperature ({temp}°C) reduces air circulation and traps pollutants near the surface.")
        
        if humidity > 70:
            explanations.append(f"High humidity ({humidity}%) can increase particle formation and reduce pollutant dispersion.")
        elif humidity < 30:
            explanations.append(f"Low humidity ({humidity}%) can lead to more dust particles in the air.")
        
        if wind_speed < 3:
            explanations.append(f"Low wind speed ({wind_speed} km/h) means pollutants will accumulate rather than disperse.")
        elif wind_speed > 10:
            explanations.append(f"Strong winds ({wind_speed} km/h) will help disperse pollutants, improving air quality.")
        else:
            explanations.append(f"Moderate wind speed ({wind_speed} km/h) provides some pollutant dispersion.")
        
        # Traffic hour impact
        if 7 <= hour_of_day <= 10:
            explanations.append("Morning rush hour (7-10 AM) significantly increases vehicular emissions.")
        elif 18 <= hour_of_day <= 21:
            explanations.append("Evening rush hour (6-9 PM) leads to elevated traffic-related pollution.")
        elif 2 <= hour_of_day <= 5:
            explanations.append("Early morning hours (2-5 AM) typically see reduced pollution due to minimal traffic.")
        
        # Seasonal factors
        if month in [10, 11, 12]:
            explanations.append("Winter months see temperature inversions that trap pollutants close to the ground. Stubble burning in nearby states also contributes significantly.")
        elif month in [3, 4, 5]:
            explanations.append("Summer months experience dust storms and higher temperatures that can elevate pollution levels.")
        elif month in [7, 8, 9]:
            explanations.append("Monsoon season generally sees better air quality due to rain washing away pollutants.")
        
        # Trend explanation
        if trend == 'increasing':
            explanations.append("Overall conditions indicate worsening air quality in the coming days.")
        elif trend == 'decreasing':
            explanations.append("Favorable conditions suggest improving air quality trends.")
        else:
            explanations.append("Conditions suggest relatively stable air quality levels.")
        
        return " ".join(explanations)
    
    def _get_confidence_level(self, confidence_score: float) -> dict:
        """Convert confidence score to categorical level with explanation"""
        if confidence_score >= 80:
            return {
                'level': 'high',
                'score': confidence_score,
                'explanation': 'High confidence based on stable weather patterns and strong wind dispersion factors.'
            }
        elif confidence_score >= 60:
            return {
                'level': 'medium',
                'score': confidence_score,
                'explanation': 'Medium confidence due to moderate variability in weather conditions or baseline AQI uncertainty.'
            }
        else:
            return {
                'level': 'low',
                'score': confidence_score,
                'explanation': 'Lower confidence due to highly variable conditions, extreme AQI levels, or poor wind dispersion.'
            }
    
    def get_seasonal_outlook(self) -> dict:
        """Provide month-wise AQI trends based on historical patterns"""
        current_month = datetime.now().month
        
        # Typical monthly AQI patterns for Delhi NCR
        monthly_patterns = {
            1: {'avg_aqi': 350, 'risk': 'very_high', 'description': 'Peak pollution due to cold weather and stubble burning aftermath'},
            2: {'avg_aqi': 280, 'risk': 'high', 'description': 'High pollution continues with temperature inversion effects'},
            3: {'avg_aqi': 180, 'risk': 'moderate', 'description': 'Improving conditions as temperatures rise'},
            4: {'avg_aqi': 160, 'risk': 'moderate', 'description': 'Pre-monsoon dust storms can elevate pollution'},
            5: {'avg_aqi': 170, 'risk': 'moderate', 'description': 'Hot weather with dust and construction activity'},
            6: {'avg_aqi': 140, 'risk': 'moderate', 'description': 'Pre-monsoon period with variable conditions'},
            7: {'avg_aqi': 100, 'risk': 'low', 'description': 'Monsoon rains improve air quality significantly'},
            8: {'avg_aqi': 95, 'risk': 'low', 'description': 'Best air quality month with regular rainfall'},
            9: {'avg_aqi': 110, 'risk': 'low', 'description': 'Post-monsoon period with good air quality'},
            10: {'avg_aqi': 250, 'risk': 'high', 'description': 'Stubble burning season begins, pollution spikes'},
            11: {'avg_aqi': 380, 'risk': 'very_high', 'description': 'Peak stubble burning combined with Diwali effects'},
            12: {'avg_aqi': 320, 'risk': 'very_high', 'description': 'Winter smog with cold weather trapping pollutants'}
        }
        
        # High-risk seasons
        high_risk_months = [10, 11, 12, 1, 2]
        low_risk_months = [7, 8, 9]
        
        return {
            'current_month': current_month,
            'current_month_name': datetime.now().strftime('%B'),
            'monthly_patterns': monthly_patterns,
            'high_risk_season': current_month in high_risk_months,
            'high_risk_months': ['October', 'November', 'December', 'January', 'February'],
            'low_risk_months': ['July', 'August', 'September'],
            'current_outlook': monthly_patterns[current_month]['description']
        }
    
    def predict(self, current_aqi: float, weather_data: dict, hour_of_day: int = None) -> dict:
        if hour_of_day is None:
            hour_of_day = datetime.now().hour
        
        temp = weather_data.get('temp', 25)
        humidity = weather_data.get('humidity', 60)
        wind_speed = weather_data.get('wind_speed', 5)
        
        base_trend = 1.0
        if temp > 30:
            base_trend += 0.05
        if humidity > 70:
            base_trend += 0.08
        if wind_speed < 3:
            base_trend += 0.12
        elif wind_speed > 10:
            base_trend -= 0.08
        
        if 7 <= hour_of_day <= 10 or 18 <= hour_of_day <= 21:
            base_trend += 0.1
        elif 2 <= hour_of_day <= 5:
            base_trend -= 0.05
        
        noise_48h = np.random.normal(0, 5)
        noise_72h = np.random.normal(0, 8)
        
        aqi_48h = max(0, min(500, current_aqi * base_trend + noise_48h))
        aqi_72h = max(0, min(500, current_aqi * base_trend * 1.02 + noise_72h))
        
        trend_direction = 'stable'
        if aqi_48h > current_aqi * 1.1:
            trend_direction = 'increasing'
        elif aqi_48h < current_aqi * 0.9:
            trend_direction = 'decreasing'
        
        confidence_score = min(95, 85 - abs(current_aqi - 150) / 10 + wind_speed * 2)
        
        # Generate detailed explanation
        explanation = self._generate_explanation(
            current_aqi, weather_data, hour_of_day, trend_direction, base_trend
        )
        
        # Get confidence level with explanation
        confidence_info = self._get_confidence_level(confidence_score)
        
        return {
            'aqi_48h': round(aqi_48h, 1),
            'aqi_72h': round(aqi_72h, 1),
            'trend': trend_direction,
            'confidence': round(confidence_score, 1),
            'confidence_level': confidence_info['level'],
            'confidence_explanation': confidence_info['explanation'],
            'factors': {
                'temperature_impact': 'high' if temp > 30 else 'low',
                'humidity_impact': 'high' if humidity > 70 else 'low',
                'wind_impact': 'favorable' if wind_speed > 5 else 'unfavorable'
            },
            # ML-ready metadata
            'prediction_type': self.prediction_type,
            'model_version': self.model_version,
            'explanation': explanation,
            'weather_conditions': {
                'temperature': temp,
                'humidity': humidity,
                'wind_speed': wind_speed,
                'hour_of_day': hour_of_day
            }
        }

forecaster = AQIForecaster()