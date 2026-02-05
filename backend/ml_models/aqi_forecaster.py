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
        self.load_model()
    
    def load_model(self):
        try:
            model_path = os.path.join(os.path.dirname(__file__), 'aqi_model.pkl')
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    data = pickle.load(f)
                    self.model = data.get('model')
                    self.scaler = data.get('scaler')
                logger.info("AQI forecasting model loaded successfully")
            else:
                logger.warning("Pre-trained model not found, using rule-based forecasting")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
    
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
        
        confidence = min(95, 85 - abs(current_aqi - 150) / 10 + wind_speed * 2)
        
        return {
            'aqi_48h': round(aqi_48h, 1),
            'aqi_72h': round(aqi_72h, 1),
            'trend': trend_direction,
            'confidence': round(confidence, 1),
            'factors': {
                'temperature_impact': 'high' if temp > 30 else 'low',
                'humidity_impact': 'high' if humidity > 70 else 'low',
                'wind_impact': 'favorable' if wind_speed > 5 else 'unfavorable'
            }
        }

forecaster = AQIForecaster()