import numpy as np
import pandas as pd
import joblib
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class SourceAttributionModel:
    def __init__(self):
        self.model = None
        self.model_version = "v2.0-ml"
        self.prediction_type = "not_loaded"
        self.model_loaded = False
        self.targets = ["Traffic", "Industry", "Construction", "Stubble_Burning", "Other"]
        
        # Model paths (can be configured via environment)
        self.model_dir = os.path.join(os.path.dirname(__file__), 'model2')
        self.model_path = os.path.join(self.model_dir, 'pollution_source_regression_model.pkl')
        
        self.load_model()
    
    def load_model(self):
        """Load pollution source attribution model"""
        try:
            if not os.path.exists(self.model_path):
                logger.warning(f"❌ ML Model not found at: {self.model_path}")
                logger.warning("📋 To enable ML predictions, place model files in: /app/backend/ml_models/model2/")
                logger.warning("   Required files:")
                logger.warning("   - pollution_source_regression_model.pkl")
                self.prediction_type = "not_loaded"
                return
            
            # Load model
            self.model = joblib.load(self.model_path)
            self.model_loaded = True
            self.prediction_type = "ml"
            logger.info("✅ Pollution Source Attribution Model loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Error loading source attribution model: {str(e)}")
            self.prediction_type = "not_loaded"
    
    def prepare_input(self, pollutants: dict) -> pd.DataFrame:
        """Prepare input features for model"""
        now = datetime.now()
        
        pm25 = pollutants.get('pm25', 0)
        pm10 = pollutants.get('pm10', 0)
        no2 = pollutants.get('no2', 0)
        co = pollutants.get('co', 0)
        so2 = pollutants.get('so2', 0)
        o3 = pollutants.get('o3', 0)
        
        data = {
            'PM2.5': pm25,
            'PM10': pm10,
            'NO2': no2,
            'SO2': so2,
            'CO': co,
            'O3': o3,
            'pm_ratio': pm10 / (pm25 + 1),
            'no2_co_ratio': no2 / (co + 1),
            'month': now.month,
            'hour': now.hour
        }
        
        return pd.DataFrame([data])
    
    def predict(self, pollutants: dict, weather: dict = None, month: int = None, fire_count: int = 0) -> dict:
        """Predict pollution source contributions"""
        
        # Check if model is loaded
        if not self.model_loaded:
            return {
                'error': 'ML model not loaded',
                'message': 'Pollution source attribution ML model is not available. Please configure model files in /app/backend/ml_models/model2/',
                'contributions': {
                    'traffic': 0,
                    'industry': 0,
                    'construction': 0,
                    'stubble_burning': 0,
                    'other': 0
                },
                'dominant_source': 'unknown',
                'confidence': 0.0,
                'confidence_level': 'none',
                'confidence_explanation': 'Model not loaded',
                'factors_considered': {},
                'prediction_type': self.prediction_type,
                'model_version': self.model_version,
                'explanation': 'ML model files are not configured. Please upload model files to enable predictions.',
                'pollutant_indicators': {}
            }
        
        try:
            # Prepare input
            input_df = self.prepare_input(pollutants)
            
            # Make prediction
            raw_pred = self.model.predict(input_df)[0]
            raw_pred = np.clip(raw_pred, 0, None)
            
            # Convert to percentages
            total = raw_pred.sum()
            if total > 0:
                percentages = (raw_pred / total) * 100
            else:
                percentages = np.zeros_like(raw_pred)
            
            # Create contributions dictionary
            contributions = {}
            for target, value in zip(self.targets, percentages):
                key = target.lower().replace('_', '_')
                if key == 'stubble_burning':
                    key = 'stubble_burning'
                contributions[key] = round(float(value), 1)
            
            # Map to expected keys
            result_contributions = {
                'traffic': contributions.get('traffic', 0),
                'industry': contributions.get('industry', 0),
                'construction': contributions.get('construction', 0),
                'stubble_burning': contributions.get('stubble_burning', 0),
                'other': contributions.get('other', 0)
            }
            
            # Determine dominant source
            dominant_source = max(result_contributions, key=result_contributions.get)
            dominant_value = result_contributions[dominant_source]
            
            # Calculate confidence
            confidence = min(95, 70 + dominant_value / 3)
            
            # Confidence level
            if confidence >= 80:
                conf_level = 'high'
                conf_explanation = f'High confidence: {dominant_source.replace("_", " ").title()} shows clear dominance at {dominant_value:.1f}%.'
            elif confidence >= 60:
                conf_level = 'medium'
                conf_explanation = 'Medium confidence: Multiple sources contribute significantly.'
            else:
                conf_level = 'low'
                conf_explanation = 'Lower confidence: Distributed contributions across sources.'
            
            # Generate explanation
            explanation = self._generate_explanation(
                result_contributions,
                pollutants,
                dominant_source,
                dominant_value
            )
            
            return {
                'contributions': result_contributions,
                'dominant_source': dominant_source,
                'confidence': round(confidence, 1),
                'confidence_level': conf_level,
                'confidence_explanation': conf_explanation,
                'factors_considered': {
                    'pollutant_ratios': True,
                    'seasonal_factors': True,
                    'time_of_day': True,
                    'ml_model': 'Random Forest Regressor'
                },
                'prediction_type': self.prediction_type,
                'model_version': self.model_version,
                'explanation': explanation,
                'pollutant_indicators': {
                    'pm25': pollutants.get('pm25', 0),
                    'pm10': pollutants.get('pm10', 0),
                    'no2': pollutants.get('no2', 0),
                    'co': pollutants.get('co', 0),
                    'pm10_pm25_ratio': round(pollutants.get('pm10', 0) / (pollutants.get('pm25', 1)), 2),
                    'no2_co_ratio': round(pollutants.get('no2', 0) / (pollutants.get('co', 1)), 2)
                }
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return {
                'error': str(e),
                'message': 'Error during source attribution prediction',
                'contributions': {
                    'traffic': 0,
                    'industry': 0,
                    'construction': 0,
                    'stubble_burning': 0,
                    'other': 0
                },
                'dominant_source': 'unknown',
                'confidence': 0.0,
                'prediction_type': 'error',
                'model_version': self.model_version
            }
    
    def _generate_explanation(self, contributions: dict, pollutants: dict, 
                            dominant_source: str, dominant_value: float) -> str:
        """Generate explanation for source attribution"""
        explanations = []
        
        # Dominant source
        source_name = dominant_source.replace('_', ' ').title()
        explanations.append(f"ML model identifies {source_name} as the primary contributor at {dominant_value:.1f}%.")
        
        # Pollutant indicators
        no2 = pollutants.get('no2', 0)
        pm10 = pollutants.get('pm10', 0)
        pm25 = pollutants.get('pm25', 1)
        
        if dominant_source == 'traffic' and no2 > 50:
            explanations.append(f"High NO2 levels ({no2} µg/m³) strongly support vehicular emission attribution.")
        elif dominant_source == 'construction' and pm10 / pm25 > 2.0:
            explanations.append(f"High PM10/PM2.5 ratio ({pm10/pm25:.2f}) indicates coarse dust from construction.")
        elif dominant_source == 'stubble_burning':
            month = datetime.now().month
            if month in [10, 11, 12]:
                explanations.append("Seasonal pattern aligns with agricultural burning season.")
        
        # Secondary contributors
        sorted_sources = sorted(contributions.items(), key=lambda x: x[1], reverse=True)
        if len(sorted_sources) > 1 and sorted_sources[1][1] > 15:
            second_name = sorted_sources[1][0].replace('_', ' ').title()
            second_value = sorted_sources[1][1]
            explanations.append(f"{second_name} also contributes significantly at {second_value:.1f}%.")
        
        explanations.append("Prediction based on Random Forest model trained on labeled CPCB data (2015-2024).")
        
        return " ".join(explanations)

attribution_model = SourceAttributionModel()
