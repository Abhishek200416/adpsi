# 🧠 ML Model Integration Guide

## ✅ Integration Status

**Backend**: ✅ READY - ML infrastructure fully implemented
**Frontend**: ✅ READY - UI updated to show ML model status
**Database**: ✅ READY - SQLite with PostgreSQL compatibility
**Dependencies**: ✅ INSTALLED - xgboost==2.1.3, sqlalchemy==2.0.36

---

## 📋 What's Been Implemented

### 1. Backend ML Infrastructure

#### Created Files:
- `/app/backend/database.py` - SQLAlchemy ORM models
- `/app/backend/ml_models/aqi_forecaster.py` - XGBoost ensemble loader
- `/app/backend/ml_models/source_attribution.py` - Random Forest loader
- `/app/backend/ml_models/MODEL_SETUP.md` - Comprehensive setup guide

#### Updated Files:
- `/app/backend/server.py` - API endpoints updated for ML
- `/app/backend/requirements.txt` - Added xgboost & sqlalchemy

#### Directory Structure Created:
```
/app/backend/ml_models/
├── model1/                      # AQI Forecasting Model
│   ├── README.md               # Setup instructions
│   └── [Upload your model files here]
├── model2/                      # Source Attribution Model
│   ├── README.md               # Setup instructions
│   └── [Upload your model files here]
├── aqi_forecaster.py            # Model loader
├── source_attribution.py        # Model loader
└── MODEL_SETUP.md              # Complete guide
```

### 2. Database (SQLite + PostgreSQL Compatible)

**Tables Created:**
- `admin_users` - Admin authentication
- `pollution_reports` - Citizen reports
- `aqi_prediction_logs` - Prediction history
- `source_attribution_logs` - Source prediction history

**Database Location:** `/app/backend/aqi_data.db`

### 3. API Endpoints Updated

#### `/api/aqi/forecast`
- **When models loaded**: Returns ML predictions with `prediction_type: "ml"`
- **When models NOT loaded**: Returns error with setup instructions
- **Response includes**: aqi_24h, aqi_48h, aqi_72h, confidence, trend, explanation

#### `/api/aqi/sources`
- **When models loaded**: Returns ML source attribution
- **When models NOT loaded**: Returns error with setup instructions
- **Response includes**: Traffic, Industry, Construction, Stubble Burning, Other percentages

#### `/api/model/transparency`
- Dynamically shows ML model status
- Provides setup instructions if models not loaded
- Shows model architecture when loaded

### 4. Frontend Updates

**Prediction Page** (`/app/frontend/src/pages/Prediction.jsx`):
- Shows amber warning banner when ML models not configured
- Shows green success banner when ML models are active
- Displays clear setup instructions with file paths
- Links to documentation

**Source Contribution Component** (`/app/frontend/src/components/SourceContribution.jsx`):
- Shows error state with setup message when model not loaded
- Normal visualization when model is active

---

## 🚀 How to Upload Your ML Models

### Step 1: Prepare Your Model Files

#### For Model 1 (AQI Forecasting):
You need these files from your local machine:
```
C:\Users\abhis\Downloads\clint2\aqi_model_artifacts\
├── artifact_wrapper.pkl
├── booster_seed42.json
├── booster_seed53.json
├── booster_seed64.json
├── booster_seed75.json
├── booster_seed86.json
└── ensemble_metadata.json
```

#### For Model 2 (Source Attribution):
You need this file from your local machine:
```
C:\Users\abhis\Downloads\clint2\polution\
└── pollution_source_regression_model.pkl
```

### Step 2: Upload Files to Server

**Option A: Using File Upload (if available in your environment)**
1. Navigate to `/app/backend/ml_models/model1/`
2. Upload all 7 files from your aqi_model_artifacts folder
3. Navigate to `/app/backend/ml_models/model2/`
4. Upload pollution_source_regression_model.pkl

**Option B: Using Command Line (if you have SSH/terminal access)**
```bash
# For Model 1
cd /app/backend/ml_models/model1/
# Upload your files here using scp, sftp, or file manager

# For Model 2
cd /app/backend/ml_models/model2/
# Upload your file here
```

**Option C: Using Docker/Container Copy (if running in container)**
```bash
# From your local machine
docker cp C:/Users/abhis/Downloads/clint2/aqi_model_artifacts/artifact_wrapper.pkl <container>:/app/backend/ml_models/model1/
docker cp C:/Users/abhis/Downloads/clint2/aqi_model_artifacts/booster_seed42.json <container>:/app/backend/ml_models/model1/
docker cp C:/Users/abhis/Downloads/clint2/aqi_model_artifacts/booster_seed53.json <container>:/app/backend/ml_models/model1/
docker cp C:/Users/abhis/Downloads/clint2/aqi_model_artifacts/booster_seed64.json <container>:/app/backend/ml_models/model1/
docker cp C:/Users/abhis/Downloads/clint2/aqi_model_artifacts/booster_seed75.json <container>:/app/backend/ml_models/model1/
docker cp C:/Users/abhis/Downloads/clint2/aqi_model_artifacts/booster_seed86.json <container>:/app/backend/ml_models/model1/
docker cp C:/Users/abhis/Downloads/clint2/aqi_model_artifacts/ensemble_metadata.json <container>:/app/backend/ml_models/model1/

docker cp C:/Users/abhis/Downloads/clint2/polution/pollution_source_regression_model.pkl <container>:/app/backend/ml_models/model2/
```

### Step 3: Verify File Placement

Run this command to verify files are in place:
```bash
cd /app/backend/ml_models

# Check Model 1 files
echo "=== Model 1 Files ==="
ls -lh model1/

# Check Model 2 files
echo "=== Model 2 Files ==="
ls -lh model2/
```

**Expected output for Model 1:**
```
artifact_wrapper.pkl
booster_seed42.json
booster_seed53.json
booster_seed64.json
booster_seed75.json
booster_seed86.json
ensemble_metadata.json
```

**Expected output for Model 2:**
```
pollution_source_regression_model.pkl
```

### Step 4: Restart Backend

```bash
sudo supervisorctl restart backend
```

### Step 5: Check Logs

```bash
tail -50 /var/log/supervisor/backend.err.log
```

**Success indicators to look for:**
```
✅ Loaded booster: booster_seed42.json
✅ Loaded booster: booster_seed53.json
✅ Loaded booster: booster_seed64.json
✅ Loaded booster: booster_seed75.json
✅ Loaded booster: booster_seed86.json
✅ AQI Forecasting Model loaded successfully (5 boosters)
✅ Pollution Source Attribution Model loaded successfully
```

**If you see errors:**
- Check file permissions: `chmod 644 /app/backend/ml_models/model1/* /app/backend/ml_models/model2/*`
- Verify file names match exactly (case-sensitive)
- Ensure files are not corrupted during upload

### Step 6: Test the Integration

#### Test via API:
```bash
# Test AQI Forecast
curl http://localhost:8001/api/aqi/forecast

# Test Source Attribution
curl http://localhost:8001/api/aqi/sources

# Test Transparency
curl http://localhost:8001/api/model/transparency
```

**Look for:**
- `"prediction_type": "ml"` (not "not_loaded")
- `"model_version": "v2.0-ml"`
- Actual prediction values (not null)

#### Test via Frontend:
1. Open the website in browser
2. Go to "Prediction" page
3. You should see:
   - ✅ Green banner: "ML Models Active"
   - Prediction values populated
   - Source attribution chart working
   - No amber warning banners

---

## 🔍 Understanding the ML Models

### Model 1: AQI Forecasting (XGBoost Ensemble)

**Purpose**: Predict AQI for 24h, 48h, and 72h ahead

**Architecture**:
- 5 XGBoost boosters with different random seeds (42, 53, 64, 75, 86)
- Ensemble prediction (mean of all boosters)
- Confidence calculation (based on ensemble agreement)

**Input Features** (28 features):
```python
Pollutants (6):     PM2.5, PM10, NO2, SO2, CO, O3
Time (5):           hour, day, month, day_of_week, is_weekend
Cyclic (4):         month_sin, month_cos, hour_sin, hour_cos
Location (2):       lat, lon
AQI Memory (6):     AQI_t-1, AQI_t-6, AQI_t-12, AQI_t-24, 
                    rolling_mean_24h, rolling_mean_72h
Derived (2):        pm_ratio (PM10/PM2.5), traffic_ratio (NO2/CO)
```

**Outputs**:
```json
{
  "aqi_24h": 165.4,
  "aqi_48h": 175.2,
  "aqi_72h": 168.9,
  "trend": "increasing",
  "confidence": 78.6,
  "prediction_type": "ml",
  "model_version": "v2.0-ml"
}
```

### Model 2: Source Attribution (Random Forest)

**Purpose**: Identify pollution source contributions

**Architecture**:
- Multi-output Random Forest regression
- Trained on labeled CPCB data (2015-2024)
- Returns percentage contributions

**Input Features** (10 features):
```python
Pollutants (6):     PM2.5, PM10, NO2, SO2, CO, O3
Derived (2):        pm_ratio (PM10/PM2.5), no2_co_ratio (NO2/CO)
Time (2):           month, hour
```

**Outputs**:
```json
{
  "contributions": {
    "traffic": 35.2,
    "industry": 24.8,
    "construction": 15.1,
    "stubble_burning": 19.7,
    "other": 5.2
  },
  "dominant_source": "traffic",
  "confidence": 82.3,
  "prediction_type": "ml",
  "model_version": "v2.0-ml"
}
```

---

## 📊 Database Schema

### AQI Prediction Logs
```sql
CREATE TABLE aqi_prediction_logs (
    id INTEGER PRIMARY KEY,
    current_aqi FLOAT NOT NULL,
    aqi_24h FLOAT,
    aqi_48h FLOAT NOT NULL,
    aqi_72h FLOAT NOT NULL,
    trend VARCHAR(50),
    confidence FLOAT,
    model_version VARCHAR(100),
    prediction_type VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Source Attribution Logs
```sql
CREATE TABLE source_attribution_logs (
    id INTEGER PRIMARY KEY,
    traffic FLOAT NOT NULL,
    industry FLOAT NOT NULL,
    construction FLOAT NOT NULL,
    stubble_burning FLOAT NOT NULL,
    other FLOAT NOT NULL,
    dominant_source VARCHAR(100),
    confidence FLOAT,
    model_version VARCHAR(100),
    prediction_type VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚙️ Configuration (Optional)

### Environment Variables

You can override default model paths in `/app/backend/.env`:

```bash
# ML Model Paths (optional - defaults shown)
ML_MODEL1_DIR=/app/backend/ml_models/model1
ML_MODEL2_DIR=/app/backend/ml_models/model2

# Database (optional)
SQLITE_DB_URL=sqlite:////app/backend/aqi_data.db

# WAQI API (required for real-time data)
WAQI_API_TOKEN=your_token_here
```

---

## 🐛 Troubleshooting

### Issue: Models Not Loading

**Symptom**: Still seeing "ML Models Not Configured" after upload

**Solutions**:
1. Check file names (case-sensitive):
   ```bash
   ls -la /app/backend/ml_models/model1/
   ls -la /app/backend/ml_models/model2/
   ```

2. Check file permissions:
   ```bash
   chmod 644 /app/backend/ml_models/model1/*
   chmod 644 /app/backend/ml_models/model2/*
   ```

3. Check backend logs for specific errors:
   ```bash
   tail -100 /var/log/supervisor/backend.err.log
   ```

4. Verify Python can load the files:
   ```bash
   cd /app/backend
   python3 -c "import joblib; joblib.load('ml_models/model1/artifact_wrapper.pkl')"
   ```

### Issue: Import Errors

**Symptom**: `ModuleNotFoundError: No module named 'xgboost'`

**Solution**:
```bash
cd /app/backend
pip install -r requirements.txt
sudo supervisorctl restart backend
```

### Issue: Predictions Returning None

**Symptom**: API returns null for aqi_24h, aqi_48h, aqi_72h

**Possible causes**:
1. WAQI API token not configured
2. Model files corrupted
3. Feature names mismatch

**Check**:
```bash
# Test WAQI API
curl "https://api.waqi.info/feed/delhi/?token=YOUR_TOKEN"

# Verify artifact wrapper
python3 -c "
import joblib
artifact = joblib.load('/app/backend/ml_models/model1/artifact_wrapper.pkl')
print('Features:', artifact['features'])
print('Model paths:', artifact['model_paths'])
"
```

### Issue: High Memory Usage

**Symptom**: Backend using lots of RAM

**Cause**: Model files are large (especially booster JSONs are 11-13 MB each)

**Solutions**:
- This is normal - 5 boosters + model data
- Ensure container has at least 2GB RAM
- Models are loaded once at startup, not per request

---

## 📝 Testing Checklist

After uploading models, verify:

- [ ] Backend logs show ✅ for both models
- [ ] API /api/aqi/forecast returns `"prediction_type": "ml"`
- [ ] API /api/aqi/sources returns `"prediction_type": "ml"`
- [ ] Frontend Prediction page shows green "ML Models Active" banner
- [ ] Forecast chart shows 24h, 48h, 72h predictions
- [ ] Source attribution pie chart displays correctly
- [ ] No amber warning banners visible
- [ ] Confidence indicators show appropriate levels
- [ ] Transparency page shows "ML Models Active" status

---

## 🎓 Next Steps

Once ML models are active:

1. **Monitor Performance**: Check prediction accuracy over time
2. **Log Analysis**: Review prediction logs in database
3. **Model Updates**: Replace model files when retraining (restart backend after)
4. **Scaling**: Consider moving to PostgreSQL for production
5. **Enhancements**: Add prediction history visualization

---

## 📞 Support

**Documentation**:
- `/app/backend/ml_models/MODEL_SETUP.md` - Detailed technical guide
- `/app/backend/ml_models/model1/README.md` - Model 1 specific
- `/app/backend/ml_models/model2/README.md` - Model 2 specific

**Log Files**:
- Backend: `/var/log/supervisor/backend.err.log`
- Backend: `/var/log/supervisor/backend.out.log`
- Frontend: `/var/log/supervisor/frontend.err.log`

**Check Status**:
```bash
sudo supervisorctl status
```

**Restart Services**:
```bash
# Just backend
sudo supervisorctl restart backend

# Everything
sudo supervisorctl restart all
```

---

## ✨ Summary

You now have a complete ML-ready AQI prediction system:

✅ **Backend**: Full ML infrastructure with XGBoost & Random Forest loaders
✅ **Frontend**: Smart UI that adapts to model availability
✅ **Database**: SQLite with prediction logging capability
✅ **APIs**: Consistent response format regardless of model status
✅ **Documentation**: Comprehensive guides for setup and troubleshooting

**Current State**: System is running and waiting for model files
**Next Action**: Upload your model files following Step 2 above
**Expected Time**: 5-10 minutes to upload and verify

🚀 Once models are uploaded, your system will provide real ML-powered AQI predictions!
