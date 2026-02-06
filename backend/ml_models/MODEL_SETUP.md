# ML Model Setup Guide

This guide explains how to set up your ML models for AQI forecasting and pollution source attribution.

## Directory Structure

```
/app/backend/ml_models/
├── model1/                      # AQI Forecasting Model
│   ├── artifact_wrapper.pkl
│   ├── booster_seed42.json
│   ├── booster_seed53.json
│   ├── booster_seed64.json
│   ├── booster_seed75.json
│   ├── booster_seed86.json
│   └── ensemble_metadata.json
│
├── model2/                      # Pollution Source Attribution Model
│   ├── pollution_source_model.pkl
│   └── pollution_source_regression_model.pkl
│
├── aqi_forecaster.py           # AQI forecasting loader
├── source_attribution.py       # Source attribution loader
└── MODEL_SETUP.md             # This file
```

## Model 1: AQI Forecasting

**Location:** `/app/backend/ml_models/model1/`

**Required Files:**
- `artifact_wrapper.pkl` - Contains feature names and model paths
- `booster_seed42.json` - XGBoost booster model (seed 42)
- `booster_seed53.json` - XGBoost booster model (seed 53)
- `booster_seed64.json` - XGBoost booster model (seed 64)
- `booster_seed75.json` - XGBoost booster model (seed 75)
- `booster_seed86.json` - XGBoost booster model (seed 86)
- `ensemble_metadata.json` - Ensemble configuration

**Model Type:** XGBoost Ensemble
**Purpose:** Predict AQI for 24h, 48h, and 72h ahead

**Input Features Expected:**
- Pollutants: PM2.5, PM10, NO2, SO2, CO, O3
- Time features: hour, day, month, day_of_week, is_weekend
- Cyclic features: month_sin, month_cos, hour_sin, hour_cos
- Location: lat, lon
- AQI memory: AQI_t-1, AQI_t-6, AQI_t-12, AQI_t-24, rolling_mean_24h, rolling_mean_72h
- Derived: pm_ratio, traffic_ratio

## Model 2: Pollution Source Attribution

**Location:** `/app/backend/ml_models/model2/`

**Required Files:**
- `pollution_source_regression_model.pkl` - Main regression model
- `pollution_source_model.pkl` - (Optional) Alternative model

**Model Type:** Random Forest / Regression
**Purpose:** Attribute pollution to sources (Traffic, Industry, Construction, Stubble Burning, Other)

**Input Features Expected:**
- Pollutants: PM2.5, PM10, NO2, SO2, CO, O3
- Derived: pm_ratio (PM10/PM2.5), no2_co_ratio (NO2/CO)
- Time: month, hour

**Output:** Percentage contribution from each source

## Setup Instructions

### Step 1: Create Directories

```bash
cd /app/backend/ml_models/
mkdir -p model1 model2
```

### Step 2: Copy Your Model Files

**For Model 1 (AQI Forecasting):**
```bash
# Copy all model files to model1 directory
cp /your/local/path/artifact_wrapper.pkl /app/backend/ml_models/model1/
cp /your/local/path/booster_seed*.json /app/backend/ml_models/model1/
cp /your/local/path/ensemble_metadata.json /app/backend/ml_models/model1/
```

**For Model 2 (Source Attribution):**
```bash
# Copy model files to model2 directory
cp /your/local/path/pollution_source_regression_model.pkl /app/backend/ml_models/model2/
```

### Step 3: Restart Backend

```bash
sudo supervisorctl restart backend
```

### Step 4: Verify Model Loading

Check backend logs:
```bash
tail -f /var/log/supervisor/backend.out.log
```

You should see:
```
✅ Loaded booster: booster_seed42.json
✅ Loaded booster: booster_seed53.json
✅ Loaded booster: booster_seed64.json
✅ Loaded booster: booster_seed75.json
✅ Loaded booster: booster_seed86.json
✅ AQI Forecasting Model loaded successfully (5 boosters)
✅ Pollution Source Attribution Model loaded successfully
```

## What Happens If Models Are Not Found?

- The system will log warnings about missing models
- API endpoints will return error responses with clear messages
- Frontend will show "ML model not integrated" notice
- No crashes - the system gracefully handles missing models

## Model Status Check

Once models are loaded, the prediction endpoints will return:
- `prediction_type: "ml"` (instead of "not_loaded")
- `model_version: "v2.0-ml"`

## Testing Your Models

After placing model files:

1. Test AQI Forecast:
```bash
curl http://localhost:8001/api/aqi/forecast
```

2. Test Source Attribution:
```bash
curl http://localhost:8001/api/aqi/sources
```

Both should return `"prediction_type": "ml"` if successful.

## Troubleshooting

### Models Not Loading

1. Check file permissions:
```bash
chmod 644 /app/backend/ml_models/model1/*
chmod 644 /app/backend/ml_models/model2/*
```

2. Verify file paths:
```bash
ls -la /app/backend/ml_models/model1/
ls -la /app/backend/ml_models/model2/
```

3. Check backend error logs:
```bash
tail -50 /var/log/supervisor/backend.err.log
```

### Missing Dependencies

If you see import errors, install dependencies:
```bash
cd /app/backend
pip install -r requirements.txt
```

Required packages:
- `xgboost==2.1.3`
- `scikit-learn==1.8.0`
- `joblib==1.5.3`
- `pandas==3.0.0`
- `numpy==2.4.2`

## Environment Variables (Optional)

You can override model paths using environment variables:

```bash
# In /app/backend/.env
ML_MODEL1_DIR=/custom/path/to/model1
ML_MODEL2_DIR=/custom/path/to/model2
```

## Support

If you encounter issues:
1. Check this guide first
2. Review backend logs
3. Verify model file formats match expected structure
4. Ensure all required dependencies are installed
