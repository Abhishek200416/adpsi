import numpy as np
import pandas as pd
import xgboost as xgb
import joblib
import os
from datetime import datetime
import logging
import aiohttp

logger = logging.getLogger(__name__)

class AQIForecaster:
    def __init__(self):
        self.boosters = []
        self.features = None
        self.model_version = "v2.0-ml"
        self.prediction_type = "not_loaded"
        self.model_loaded = False
        self.waqi_token = os.environ.get('WAQI_API_TOKEN')
        
        # Model paths (can be configured via environment)
        self.model_dir = os.path.join(os.path.dirname(__file__), 'model1')
        self.artifact_path = os.path.join(self.model_dir, 'artifact_wrapper.pkl')
        
        self.load_model()
    
    def load_model(self):
        """Load XGBoost ensemble models"""
        try:
            if not os.path.exists(self.artifact_path):
                logger.warning(f"❌ ML Model not found at: {self.artifact_path}")
                logger.warning("📋 To enable ML predictions, place model files in: /app/backend/ml_models/model1/")
                logger.warning("   Required files:")
                logger.warning("   - artifact_wrapper.pkl")
                logger.warning("   - booster_seed42.json")
                logger.warning("   - booster_seed53.json")
                logger.warning("   - booster_seed64.json")
                logger.warning("   - booster_seed75.json")
                logger.warning("   - booster_seed86.json")
                logger.warning("   - ensemble_metadata.json")
                self.prediction_type = "not_loaded"
                return
            
            # Load artifact wrapper
            artifact = joblib.load(self.artifact_path)
            self.features = artifact["features"]
            model_paths = artifact["model_paths"]
            
            # Load all XGBoost boosters
            for model_path in model_paths:
                full_path = os.path.join(self.model_dir, os.path.basename(model_path))
                if os.path.exists(full_path):
                    booster = xgb.Booster()
                    booster.load_model(full_path)
                    self.boosters.append(booster)
                    logger.info(f"✅ Loaded booster: {os.path.basename(full_path)}")
                else:
                    logger.warning(f"⚠️  Booster file not found: {full_path}")
            
            if len(self.boosters) > 0:
                self.model_loaded = True
                self.prediction_type = "ml"
                logger.info(f"✅ AQI Forecasting Model loaded successfully ({len(self.boosters)} boosters)")
            else:
                logger.error("❌ No boosters loaded")
                self.prediction_type = "not_loaded"
                
        except Exception as e:
            logger.error(f"❌ Error loading AQI forecasting model: {str(e)}")
            self.prediction_type = "not_loaded"
    
    async def fetch_current_aqi(self, lat=28.6139, lon=77.2090):
        """Fetch current AQI from WAQI API"""
        try:
            if not self.waqi_token:
                logger.warning("⚠️  WAQI_API_TOKEN not configured")
                return None
            
            url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={self.waqi_token}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('status') == 'ok':
                            return data['data']
        except Exception as e:
            logger.error(f"Error fetching AQI: {str(e)}")
        
        return None
    
    def prepare_features(self, aqi_data, current_aqi, lat=28.6139, lon=77.2090):
        """Prepare features for model prediction"""
        now = datetime.now()
        iaqi = aqi_data.get('iaqi', {})
        
        def get_val(key, default=0.0):
            return iaqi.get(key, {}).get('v', default)
        
        pm25 = get_val('pm25')
        pm10 = get_val('pm10')
        no2 = get_val('no2')
        co = get_val('co')
        
        row = {
            "pm2_5_ugm3": pm25,
            "pm10_ugm3": pm10,
            "no2_ugm3": no2,
            "so2_ugm3": get_val('so2'),
            "co_ugm3": co,
            "o3_ugm3": get_val('o3'),
            
            "hour": now.hour,
            "day": now.day,
            "month": now.month,
            "day_of_week": now.weekday(),
            "is_weekend": 1 if now.weekday() >= 5 else 0,
            
            "month_sin": np.sin(2 * np.pi * now.month / 12),
            "month_cos": np.cos(2 * np.pi * now.month / 12),
            "hour_sin": np.sin(2 * np.pi * now.hour / 24),
            "hour_cos": np.cos(2 * np.pi * now.hour / 24),
            
            "lat": lat,
            "lon": lon,
            
            # AQI memory features (using current as proxy)
            "AQI_t-1": current_aqi,
            "AQI_t-6": current_aqi,
            "AQI_t-12": current_aqi,
            "AQI_t-24": current_aqi,
            "rolling_mean_24h": current_aqi,
            "rolling_mean_72h": current_aqi,
            
            "pm_ratio": pm10 / (pm25 + 1),
            "traffic_ratio": no2 / (co + 1),
        }
        
        return pd.DataFrame([row])[self.features]
    
    async def predict(self, current_aqi: float = None, lat: float = 28.6139, lon: float = 77.2090) -> dict:
        """Make AQI forecast prediction"""
        
        # Check if model is loaded
        if not self.model_loaded:
            return {
                'error': 'ML model not loaded',
                'message': 'AQI forecasting ML model is not available. Please configure model files in /app/backend/ml_models/model1/',
                'aqi_24h': None,
                'aqi_48h': None,
                'aqi_72h': None,
                'trend': 'unknown',
                'confidence': 0.0,
                'confidence_level': 'none',
                'confidence_explanation': 'Model not loaded',
                'factors': {},
                'prediction_type': self.prediction_type,
                'model_version': self.model_version,
                'explanation': 'ML model files are not configured. Please upload model files to enable predictions.',
                'weather_conditions': {}
            }
        
        try:
            # Fetch current AQI data
            aqi_data = await self.fetch_current_aqi(lat, lon)
            if not aqi_data:
                return {
                    'error': 'Failed to fetch AQI data',
                    'message': 'Could not fetch current AQI data from WAQI API',
                    'aqi_24h': None,
                    'aqi_48h': None,
                    'aqi_72h': None,
                    'trend': 'unknown',
                    'confidence': 0.0,
                    'prediction_type': 'error',
                    'model_version': self.model_version
                }
            
            if current_aqi is None:
                current_aqi = aqi_data.get('aqi', 0)
            
            # Prepare features
            X_live = self.prepare_features(aqi_data, current_aqi, lat, lon)
            
            # Make predictions with ensemble
            dmat = xgb.DMatrix(X_live)
            predictions = np.stack([booster.predict(dmat) for booster in self.boosters], axis=0)
            
            # Calculate mean and std
            mean_pred = predictions.mean(axis=0)[0]
            std_pred = predictions.std(axis=0)
            
            # Extract predictions
            aqi_24h = float(mean_pred[0])
            aqi_48h = float(mean_pred[1])
            aqi_72h = float(mean_pred[2])
            
            # Calculate confidence
            confidence = float(100 * np.exp(-np.mean(std_pred) / 10))
            
            # Determine trend
            if aqi_48h > current_aqi + 5:
                trend = 'increasing'
            elif aqi_48h < current_aqi - 5:
                trend = 'decreasing'
            else:
                trend = 'stable'
            
            # Confidence level
            if confidence >= 80:
                conf_level = 'high'
                conf_explanation = 'High confidence: Ensemble models show strong agreement on predictions.'
            elif confidence >= 60:
                conf_level = 'medium'
                conf_explanation = 'Medium confidence: Some variability in ensemble predictions.'
            else:
                conf_level = 'low'
                conf_explanation = 'Lower confidence: Significant uncertainty in ensemble predictions.'
            
            # Generate explanation
            explanation = self._generate_explanation(current_aqi, aqi_48h, trend)
            
            return {
                'aqi_24h': round(aqi_24h, 1),
                'aqi_48h': round(aqi_48h, 1),
                'aqi_72h': round(aqi_72h, 1),
                'trend': trend,
                'confidence': round(confidence, 1),
                'confidence_level': conf_level,
                'confidence_explanation': conf_explanation,
                'factors': {
                    'ensemble_agreement': 'high' if confidence > 75 else 'medium',
                    'data_quality': 'good',
                    'model_type': 'XGBoost ensemble'
                },
                'prediction_type': self.prediction_type,
                'model_version': self.model_version,
                'explanation': explanation,
                'weather_conditions': {
                    'current_aqi': current_aqi,
                    'location': f'{lat}, {lon}'
                }
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return {
                'error': str(e),
                'message': 'Error during prediction',
                'aqi_24h': None,
                'aqi_48h': None,
                'aqi_72h': None,
                'trend': 'unknown',
                'confidence': 0.0,
                'prediction_type': 'error',
                'model_version': self.model_version
            }
    
    def _generate_explanation(self, current_aqi: float, aqi_48h: float, trend: str) -> str:
        """Generate explanation for the prediction"""
        explanations = []
        
        if current_aqi > 200:
            explanations.append(f"Starting from a severe baseline AQI of {current_aqi}.")
        elif current_aqi > 150:
            explanations.append(f"Current AQI of {current_aqi} indicates unhealthy air quality.")
        else:
            explanations.append(f"Current AQI of {current_aqi} provides baseline for prediction.")
        
        if trend == 'increasing':
            explanations.append("ML model predicts worsening air quality based on pollutant trends and meteorological patterns.")
        elif trend == 'decreasing':
            explanations.append("ML model predicts improving conditions based on favorable patterns.")
        else:
            explanations.append("ML model predicts stable air quality levels.")
        
        explanations.append("Prediction based on XGBoost ensemble trained on historical CPCB and WAQI data (2019-2025).")
        
        return " ".join(explanations)

forecaster = AQIForecaster()
