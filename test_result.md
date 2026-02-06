#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  ML MODEL INTEGRATION - Integrate trained ML models for AQI forecasting and pollution source attribution
  
  Requirements:
  1. Replace simulation-based predictions with actual ML models
  2. Model 1 (AQI Forecasting): XGBoost ensemble with 5 boosters
     - Files: artifact_wrapper.pkl, booster_seed42-86.json, ensemble_metadata.json
     - Location: /app/backend/ml_models/model1/
  3. Model 2 (Source Attribution): Random Forest regression model
     - File: pollution_source_regression_model.pkl
     - Location: /app/backend/ml_models/model2/
  4. Create SQLite database with ORM models (PostgreSQL compatible)
  5. Remove OpenWeather API dependency
  6. Show appropriate messages in frontend when models are not configured
  7. Update transparency endpoint to reflect ML model status

backend:
  - task: "Add heatmap data endpoint (/api/aqi/heatmap)"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Implemented heatmap endpoint returning grid of AQI points with lat/lng/intensity. Returns ML-ready metadata (prediction_type, model_version)"
  
  - task: "Add AI recommendations endpoint (/api/recommendations)"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Implemented recommendations endpoint with Gemini AI integration. Returns contextual recommendations for citizens and policymakers. Falls back to simulation if AI unavailable."
  
  - task: "Add forecast alerts endpoint (/api/alerts)"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Implemented alerts endpoint analyzing 48-72h forecasts. Returns alerts with severity, time window, affected groups, AQI range"
  
  - task: "Add insights summary endpoint (/api/insights/summary)"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Implemented insights endpoint with AI-enhanced analysis. Returns key insights, dominant source, trend, forecast summary, recommendations"
  
  - task: "Add model transparency endpoint (/api/model/transparency)"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Implemented transparency endpoint returning data sources (CPCB, WAQI, Satellite, Weather), model approach, ML upgrade path, limitations"
  
  - task: "Integrate Gemini API for AI enhancements"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Integrated Google Gemini API (gemini-1.5-flash) for enhanced recommendations and insights. Added helper function with fallback to simulation"

frontend:
  - task: "Update MapView component with heatmap toggle"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/components/MapView.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Updated MapView with toggle between markers and heatmap. Integrated leaflet.heat plugin. Added 'High Pollution Zone Heatmap' label. Fetches data from /api/aqi/heatmap"
  
  - task: "Create RecommendationAssistant component"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/components/RecommendationAssistant.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created AI Recommendation Assistant with toggle for citizen/policymaker views. Shows contextual, prioritized recommendations with icons and explanations"
  
  - task: "Create ForecastAlerts component"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/components/ForecastAlerts.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created Forecast-Based Alerts component. Displays alerts with severity badges, time windows, affected groups, and AQI ranges. Color-coded by severity level"
  
  - task: "Create InsightsSummary component"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/components/InsightsSummary.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created Analytical Insights Summary component. Auto-generates key insights as bullet points, shows dominant source, trend, forecast summary, and recommended actions"
  
  - task: "Create TransparencyPanel component"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/components/TransparencyPanel.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created collapsible Data & Model Transparency Panel. Explains data sources (CPCB, WAQI, Satellite, Weather), simulation approach, ML upgrade path in 3 phases, and current limitations"
  
  - task: "Integrate new components into Dashboard page"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/Dashboard.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Integrated all 5 new components into Dashboard page. Added after map: RecommendationAssistant, ForecastAlerts, InsightsSummary, and TransparencyPanel before footer"
  
  - task: "Integrate new components into Prediction page"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/Prediction.jsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Added ForecastAlerts and InsightsSummary to Prediction page for comprehensive forecast analysis"

metadata:
  created_by: "main_agent"
  version: "2.0"
  test_sequence: 0
  run_ui: false

test_plan:
  current_focus:
    - "Test all 5 new backend endpoints"
    - "Test MapView heatmap toggle functionality"
    - "Test RecommendationAssistant citizen/policymaker toggle"
    - "Test ForecastAlerts display with different severity levels"
    - "Test InsightsSummary with AI-enhanced insights"
    - "Test TransparencyPanel collapsible behavior"
    - "Verify Gemini API integration for recommendations"
  stuck_tasks: []
  test_all: true
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      Implementation completed for all 5 requested features:
      
      BACKEND (5 new endpoints):
      ✅ /api/aqi/heatmap - Returns pollution heatmap grid data
      ✅ /api/recommendations - AI-powered recommendations (citizen/policymaker)
      ✅ /api/alerts - Forecast-based alerts with risk assessment
      ✅ /api/insights/summary - Analytical insights with AI enhancement
      ✅ /api/model/transparency - Data sources and ML upgrade path info
      
      FRONTEND (5 new components):
      ✅ MapView - Updated with heatmap/marker toggle (leaflet.heat)
      ✅ RecommendationAssistant - Contextual AI recommendations panel
      ✅ ForecastAlerts - 48-72h forecast alerts with severity
      ✅ InsightsSummary - Auto-generated analytical insights
      ✅ TransparencyPanel - Collapsible data & model transparency
      
      INTEGRATIONS:
      ✅ Gemini API integrated (gemini-1.5-flash) for enhanced recommendations
      ✅ All APIs return ML-ready metadata (prediction_type, model_version, confidence)
      ✅ Fallback mechanisms for simulation-based responses
      
      KEY FEATURES:
      - Heatmap shows intensity-based pollution zones with clear labeling
      - Recommendations are contextual, explainable, and prioritized
      - Alerts include time windows, affected groups, and risk levels
      - Insights are AI-enhanced when Gemini available
      - Transparency panel explains entire data pipeline and ML roadmap
      
      NOTES:
      - No existing routes or layouts were changed
      - UI seamlessly supports switching from simulation to ML models
      - All components integrated into Dashboard and Prediction pages
      - Ready for frontend testing to verify UI/UX and API integrations