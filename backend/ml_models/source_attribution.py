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
        self.model_version = "v1.0-simulation"
        self.prediction_type = "simulation"
    
    def _generate_explanation(self, contributions: dict, pollutants: dict, month: int, 
                            no2: float, co: float, pm10: float, pm25: float) -> str:
        """Generate detailed explanation for source attribution"""
        explanations = []
        dominant = max(contributions, key=contributions.get)
        
        # Dominant source explanation
        if dominant == 'traffic':
            if no2 > 60:
                explanations.append(f"High NO2 levels ({no2} µg/m³) strongly indicate vehicular emissions as the primary source.")
            if co > 2.0:
                explanations.append(f"Elevated CO levels ({co} mg/m³) further confirm traffic-related pollution.")
            explanations.append("Rush hour traffic and congested roads are major contributors.")
        
        elif dominant == 'stubble_burning':
            if month in [10, 11, 12]:
                explanations.append("Seasonal stubble burning in neighboring states significantly impacts Delhi's air quality during this period.")
                explanations.append("Agricultural fires release massive amounts of PM2.5 and PM10 particles.")
            
        elif dominant == 'construction':
            if pm10 / pm25 > 2.0:
                explanations.append(f"High PM10 to PM2.5 ratio ({pm10/pm25:.2f}) indicates coarse dust particles from construction activities.")
            explanations.append("Construction dust, road work, and building demolition contribute to particulate matter.")
        
        elif dominant == 'industry':
            explanations.append("Industrial emissions from manufacturing units, power plants, and factories contribute to baseline pollution.")
        
        # Secondary contributors
        sorted_sources = sorted(contributions.items(), key=lambda x: x[1], reverse=True)
        if len(sorted_sources) > 1 and sorted_sources[1][1] > 20:
            second_source = sorted_sources[1][0].replace('_', ' ').title()
            explanations.append(f"{second_source} is also a significant contributor at {sorted_sources[1][1]}%.")
        
        # Seasonal context
        if month in [10, 11, 12]:
            explanations.append("Winter months see compounded effects from multiple sources due to temperature inversion.")
        elif month in [7, 8, 9]:
            explanations.append("Monsoon season typically reduces pollution from most sources due to rain washout.")
        
        return " ".join(explanations)
    
    def _get_confidence_info(self, confidence_score: float, factors_considered: dict) -> dict:
        """Provide confidence level with explanation"""
        if confidence_score >= 80:
            level = 'high'
            explanation = 'High confidence based on clear pollutant signatures and consistent source patterns.'
        elif confidence_score >= 60:
            level = 'medium'
            explanation = 'Medium confidence due to overlapping source signatures or limited data points.'
        else:
            level = 'low'
            explanation = 'Lower confidence due to mixed pollutant patterns or insufficient meteorological data.'
        
        return {
            'level': level,
            'score': confidence_score,
            'explanation': explanation
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
        confidence_score = min(85, 70 + (wind_speed * 2))
        
        # Generate explanation
        explanation = self._generate_explanation(normalized, pollutants, month, no2, co, pm10, pm25)
        
        # Get confidence info
        confidence_info = self._get_confidence_info(confidence_score, {
            'pollutant_ratios': True,
            'seasonal_factors': True,
            'weather_conditions': True,
            'fire_data': fire_count > 0
        })
        
        return {
            'contributions': normalized,
            'dominant_source': dominant_source,
            'confidence': confidence_score,
            'confidence_level': confidence_info['level'],
            'confidence_explanation': confidence_info['explanation'],
            'factors_considered': {
                'pollutant_ratios': True,
                'seasonal_factors': True,
                'weather_conditions': True,
                'fire_data': fire_count > 0
            },
            # ML-ready metadata
            'prediction_type': self.prediction_type,
            'model_version': self.model_version,
            'explanation': explanation,
            'pollutant_indicators': {
                'no2': no2,
                'co': co,
                'pm25': pm25,
                'pm10': pm10,
                'pm10_pm25_ratio': round(pm10 / pm25, 2) if pm25 > 0 else 0
            }
        }

attribution_model = SourceAttributionModel()