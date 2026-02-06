#!/usr/bin/env python3
"""
Backend API Testing Suite for Delhi Air Command
Tests all 5 new endpoints plus existing endpoints for functionality and response structure
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, List

# Configuration
BASE_URL = "https://aqi-predict-1.preview.emergentagent.com/api"
TIMEOUT = 10  # seconds

class APITester:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def log_result(self, endpoint: str, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
            
        result = {
            "endpoint": endpoint,
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        print(f"{status} - {endpoint} - {test_name}")
        if details and not passed:
            print(f"   Details: {details}")
    
    def test_endpoint(self, endpoint: str, expected_fields: List[str] = None, params: Dict = None):
        """Generic endpoint test"""
        url = f"{BASE_URL}{endpoint}"
        test_name = f"Basic functionality"
        
        try:
            start_time = time.time()
            response = requests.get(url, params=params, timeout=TIMEOUT)
            response_time = time.time() - start_time
            
            # Test response time
            if response_time > 2.0:
                self.log_result(endpoint, "Response time", False, f"Took {response_time:.2f}s (>2s)")
            else:
                self.log_result(endpoint, "Response time", True, f"{response_time:.2f}s")
            
            # Test status code
            if response.status_code == 200:
                self.log_result(endpoint, "Status code", True, "200 OK")
            else:
                self.log_result(endpoint, "Status code", False, f"Got {response.status_code}")
                return None
            
            # Test JSON parsing
            try:
                data = response.json()
                self.log_result(endpoint, "JSON parsing", True, "Valid JSON")
            except json.JSONDecodeError as e:
                self.log_result(endpoint, "JSON parsing", False, f"Invalid JSON: {str(e)}")
                return None
            
            # Test expected fields
            if expected_fields:
                missing_fields = []
                for field in expected_fields:
                    if field not in data:
                        missing_fields.append(field)
                
                if missing_fields:
                    self.log_result(endpoint, "Required fields", False, f"Missing: {missing_fields}")
                else:
                    self.log_result(endpoint, "Required fields", True, "All fields present")
            
            return data
            
        except requests.exceptions.Timeout:
            self.log_result(endpoint, test_name, False, "Request timeout")
            return None
        except requests.exceptions.RequestException as e:
            self.log_result(endpoint, test_name, False, f"Request error: {str(e)}")
            return None
    
    def test_heatmap_endpoint(self):
        """Test GET /api/aqi/heatmap"""
        print("\n🗺️ Testing Heatmap Endpoint")
        expected_fields = ["points", "timestamp", "prediction_type", "model_version"]
        
        data = self.test_endpoint("/aqi/heatmap", expected_fields)
        if not data:
            return
        
        # Test points structure
        if "points" in data and isinstance(data["points"], list) and len(data["points"]) > 0:
            point = data["points"][0]
            point_fields = ["lat", "lng", "intensity", "aqi", "category"]
            missing_point_fields = [f for f in point_fields if f not in point]
            
            if missing_point_fields:
                self.log_result("/aqi/heatmap", "Point structure", False, f"Missing: {missing_point_fields}")
            else:
                self.log_result("/aqi/heatmap", "Point structure", True, "All point fields present")
                
                # Test intensity range (0-1)
                intensity = point.get("intensity", -1)
                if 0 <= intensity <= 1:
                    self.log_result("/aqi/heatmap", "Intensity range", True, f"Intensity: {intensity}")
                else:
                    self.log_result("/aqi/heatmap", "Intensity range", False, f"Intensity {intensity} not in 0-1 range")
        else:
            self.log_result("/aqi/heatmap", "Points array", False, "Empty or invalid points array")
    
    def test_recommendations_endpoint(self):
        """Test GET /api/recommendations with different user types"""
        print("\n🤖 Testing Recommendations Endpoint")
        expected_fields = ["user_type", "current_aqi", "recommendations", "context", "prediction_type", "model_version", "generated_at"]
        
        # Test citizen recommendations
        print("  Testing citizen recommendations...")
        citizen_data = self.test_endpoint("/recommendations", expected_fields, {"user_type": "citizen"})
        
        if citizen_data:
            if citizen_data.get("user_type") == "citizen":
                self.log_result("/recommendations", "Citizen user_type", True, "Correct user_type")
            else:
                self.log_result("/recommendations", "Citizen user_type", False, f"Got: {citizen_data.get('user_type')}")
            
            # Test recommendations structure
            recommendations = citizen_data.get("recommendations", [])
            if recommendations and isinstance(recommendations, list):
                rec = recommendations[0]
                rec_fields = ["title", "description", "priority", "icon"]
                missing_rec_fields = [f for f in rec_fields if f not in rec]
                
                if missing_rec_fields:
                    self.log_result("/recommendations", "Recommendation structure", False, f"Missing: {missing_rec_fields}")
                else:
                    self.log_result("/recommendations", "Recommendation structure", True, "All recommendation fields present")
            else:
                self.log_result("/recommendations", "Recommendations array", False, "Empty or invalid recommendations")
        
        # Test policymaker recommendations
        print("  Testing policymaker recommendations...")
        policy_data = self.test_endpoint("/recommendations", expected_fields, {"user_type": "policymaker"})
        
        if policy_data:
            if policy_data.get("user_type") == "policymaker":
                self.log_result("/recommendations", "Policymaker user_type", True, "Correct user_type")
            else:
                self.log_result("/recommendations", "Policymaker user_type", False, f"Got: {policy_data.get('user_type')}")
            
            # Compare recommendations (should be different)
            if citizen_data and policy_data:
                citizen_recs = [r.get("title", "") for r in citizen_data.get("recommendations", [])]
                policy_recs = [r.get("title", "") for r in policy_data.get("recommendations", [])]
                
                if citizen_recs != policy_recs:
                    self.log_result("/recommendations", "Different user types", True, "Recommendations differ by user type")
                else:
                    self.log_result("/recommendations", "Different user types", False, "Same recommendations for both user types")
    
    def test_alerts_endpoint(self):
        """Test GET /api/alerts"""
        print("\n🚨 Testing Alerts Endpoint")
        expected_fields = ["alerts", "forecast_period", "prediction_type", "model_version", "generated_at"]
        
        data = self.test_endpoint("/alerts", expected_fields)
        if not data:
            return
        
        # Test alerts structure
        alerts = data.get("alerts", [])
        if alerts and isinstance(alerts, list):
            alert = alerts[0]
            alert_fields = ["id", "severity", "title", "message", "time_window", "affected_groups", "aqi_range"]
            missing_alert_fields = [f for f in alert_fields if f not in alert]
            
            if missing_alert_fields:
                self.log_result("/alerts", "Alert structure", False, f"Missing: {missing_alert_fields}")
            else:
                self.log_result("/alerts", "Alert structure", True, "All alert fields present")
                
                # Test severity levels
                severity = alert.get("severity", "")
                valid_severities = ["critical", "high", "medium", "low", "info"]
                if severity in valid_severities:
                    self.log_result("/alerts", "Severity levels", True, f"Valid severity: {severity}")
                else:
                    self.log_result("/alerts", "Severity levels", False, f"Invalid severity: {severity}")
                
                # Test affected_groups is array
                affected_groups = alert.get("affected_groups", [])
                if isinstance(affected_groups, list) and len(affected_groups) > 0:
                    self.log_result("/alerts", "Affected groups", True, f"Groups: {len(affected_groups)}")
                else:
                    self.log_result("/alerts", "Affected groups", False, "Empty or invalid affected_groups")
        else:
            self.log_result("/alerts", "Alerts array", False, "Empty or invalid alerts array")
    
    def test_insights_endpoint(self):
        """Test GET /api/insights/summary"""
        print("\n📊 Testing Insights Summary Endpoint")
        expected_fields = ["key_insights", "dominant_source", "trend", "forecast_summary", "recommendation", "prediction_type", "model_version", "confidence", "generated_at"]
        
        data = self.test_endpoint("/insights/summary", expected_fields)
        if not data:
            return
        
        # Test key_insights structure
        key_insights = data.get("key_insights", [])
        if isinstance(key_insights, list) and len(key_insights) > 0:
            self.log_result("/insights/summary", "Key insights", True, f"Found {len(key_insights)} insights")
        else:
            self.log_result("/insights/summary", "Key insights", False, "Empty or invalid key_insights array")
        
        # Test confidence value (can be 0-1 or 0-100 scale)
        confidence = data.get("confidence")
        if isinstance(confidence, (int, float)) and (0 <= confidence <= 1 or 0 <= confidence <= 100):
            self.log_result("/insights/summary", "Confidence range", True, f"Confidence: {confidence}")
        else:
            self.log_result("/insights/summary", "Confidence range", False, f"Invalid confidence: {confidence}")
    
    def test_transparency_endpoint(self):
        """Test GET /api/model/transparency"""
        print("\n🔍 Testing Model Transparency Endpoint")
        expected_fields = ["data_sources", "model_approach", "current_version", "ml_upgrade_path", "limitations", "update_frequency"]
        
        data = self.test_endpoint("/model/transparency", expected_fields)
        if not data:
            return
        
        # Test data_sources structure
        data_sources = data.get("data_sources", [])
        if isinstance(data_sources, list) and len(data_sources) > 0:
            source = data_sources[0]
            source_fields = ["name", "type", "coverage", "update_frequency", "parameters"]
            missing_source_fields = [f for f in source_fields if f not in source]
            
            if missing_source_fields:
                self.log_result("/model/transparency", "Data source structure", False, f"Missing: {missing_source_fields}")
            else:
                self.log_result("/model/transparency", "Data source structure", True, "All source fields present")
                
                # Check for expected data sources
                source_names = [s.get("name", "") for s in data_sources]
                expected_sources = ["CPCB", "WAQI", "Satellite", "Weather"]
                found_sources = [exp for exp in expected_sources if any(exp in name for name in source_names)]
                
                if len(found_sources) >= 3:
                    self.log_result("/model/transparency", "Expected data sources", True, f"Found: {found_sources}")
                else:
                    self.log_result("/model/transparency", "Expected data sources", False, f"Only found: {found_sources}")
        else:
            self.log_result("/model/transparency", "Data sources array", False, "Empty or invalid data_sources")
        
        # Test limitations array
        limitations = data.get("limitations", [])
        if isinstance(limitations, list) and len(limitations) > 0:
            self.log_result("/model/transparency", "Limitations", True, f"Found {len(limitations)} limitations")
        else:
            self.log_result("/model/transparency", "Limitations", False, "Empty or invalid limitations array")
    
    def test_existing_endpoints(self):
        """Test existing endpoints for regression"""
        print("\n🔄 Testing Existing Endpoints (Regression Check)")
        
        # Test current AQI
        aqi_fields = ["aqi", "category", "location", "pollutants", "timestamp"]
        self.test_endpoint("/aqi/current", aqi_fields)
        
        # Test forecast
        forecast_fields = ["aqi_48h", "aqi_72h", "trend", "confidence", "prediction_type", "model_version"]
        self.test_endpoint("/aqi/forecast", forecast_fields)
        
        # Test sources
        source_fields = ["contributions", "dominant_source", "confidence", "prediction_type", "model_version"]
        self.test_endpoint("/aqi/sources", source_fields)
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Delhi Air Command Backend API Tests")
        print(f"Base URL: {BASE_URL}")
        print("=" * 60)
        
        # Test new endpoints
        self.test_heatmap_endpoint()
        self.test_recommendations_endpoint()
        self.test_alerts_endpoint()
        self.test_insights_endpoint()
        self.test_transparency_endpoint()
        
        # Test existing endpoints
        self.test_existing_endpoints()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests)*100:.1f}%")
        
        # Print failed tests
        failed_tests = [r for r in self.results if "❌" in r["status"]]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"  - {test['endpoint']} - {test['test']}: {test['details']}")
        else:
            print("\n✅ ALL TESTS PASSED!")
        
        return self.passed_tests == self.total_tests

if __name__ == "__main__":
    tester = APITester()
    success = tester.run_all_tests()
    
    if not success:
        exit(1)