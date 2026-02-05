import numpy as np
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class SourceAttributionModel:
    def __init__(self):
        self.base_contributions = {
            'traffic': 30,
            'stubble_burning': 20,
            'industry': 25,
            'construction': 25
        }
    
    def predict(self, pollutants: dict, weather: dict, month: int = None, fire_count: int = 0) -> dict:
        if month is None:
            month = datetime.now().month
        
        pm25 = pollutants.get('pm25', 100)
        pm10 = pollutants.get('pm10', 150)
        no2 = pollutants.get('no2', 50)
        co = pollutants.get('co', 1.5)
        
        wind_speed = weather.get('wind_speed', 5)
        temp = weather.get('temp', 25)
        
        contributions = self.base_contributions.copy()
        
        if no2 > 60 or co > 2.0:
            contributions['traffic'] += 15
        elif no2 < 30:
            contributions['traffic'] -= 10
        
        if month in [10, 11, 12] and fire_count > 0:
            contributions['stubble_burning'] += min(fire_count * 2, 30)
        elif month not in [10, 11, 12]:
            contributions['stubble_burning'] = max(5, contributions['stubble_burning'] - 15)
        
        if pm10 / pm25 > 2.0:
            contributions['construction'] += 20
        
        if temp > 30 and wind_speed < 3:
            contributions['industry'] += 10
        
        total = sum(contributions.values())
        normalized = {k: round((v / total) * 100, 1) for k, v in contributions.items()}
        
        dominant_source = max(normalized, key=normalized.get)
        
        return {
            'contributions': normalized,
            'dominant_source': dominant_source,
            'confidence': min(85, 70 + (wind_speed * 2)),
            'factors_considered': {
                'pollutant_ratios': True,
                'seasonal_factors': True,
                'weather_conditions': True,
                'fire_data': fire_count > 0
            }
        }

attribution_model = SourceAttributionModel()