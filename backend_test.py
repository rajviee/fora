#!/usr/bin/env python3
"""
Foratask Backend API Test Suite
Tests all major API endpoints for the enhanced Foratask application
"""

import requests
import json
import sys
from datetime import datetime

class ForataskAPITester:
    def __init__(self):
        self.base_url = "https://foratask-plus.preview.emergentagent.com/api"
        self.token = None
        self.user = None
        self.tests_run = 0
        self.tests_passed = 0
        
        # Test credentials from seed data
        self.test_accounts = {
            "admin": {"email": "rajvi@varientworld.com", "password": "Rajvi@123"},
            "supervisor": {"email": "shubh@varientworld.com", "password": "Shubh@123"},
            "employee": {"email": "tushar@varientworld.com", "password": "Tushar@123"}
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        
        # Set default headers
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   {method} {endpoint}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            # Check status code
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_login(self, role="admin"):
        """Test login and get token"""
        creds = self.test_accounts[role]
        success, response = self.run_test(
            f"Login as {role}",
            "POST",
            "/auth/login",
            200,
            data=creds
        )
        
        if success and response.get('token'):
            self.token = response['token']
            self.user = response.get('user', {})
            print(f"   Logged in as: {self.user.get('firstName', 'Unknown')} ({role})")
            return True
        return False

    def test_employees_api(self):
        """Test employee management endpoints"""
        print("\n📋 Testing Employee Management APIs...")
        
        # Check if user is admin
        is_admin = self.user.get('role') == 'admin'
        expected_status = 200 if is_admin else 403
        
        # Get employees list
        success, employees_data = self.run_test(
            "Get employees list",
            "GET", 
            "/employees",
            expected_status
        )
        
        if success and is_admin:
            employees = employees_data.get('employees', employees_data)
            if isinstance(employees, list) and len(employees) >= 3:
                print(f"   Found {len(employees)} employees")
                
                # Test individual employee endpoint
                employee_id = employees[0].get('_id')
                if employee_id:
                    self.run_test(
                        "Get employee by ID",
                        "GET",
                        f"/employees/{employee_id}",
                        200
                    )
        elif not is_admin:
            print("   Expected 403 for non-admin user - correct behavior")
        
        return True

    def test_tasks_api(self):
        """Test task management endpoints"""
        print("\n📝 Testing Task Management APIs...")
        
        # Get tasks
        success, tasks_data = self.run_test(
            "Get tasks",
            "GET",
            "/task",
            200
        )
        
        if success:
            tasks = tasks_data if isinstance(tasks_data, list) else tasks_data.get('tasks', [])
            print(f"   Found {len(tasks)} tasks")
        
        # Test task creation
        new_task_data = {
            "title": "Test Task " + datetime.now().strftime("%H:%M:%S"),
            "description": "This is a test task created by API test",
            "priority": "Medium",
            "dueDateTime": "2024-12-31T23:59:59.000Z",
            "doers": [],
            "viewers": [],
            "isRemote": True,
            "locations": [{"name": "Location 1", "description": "Test location", "address": "Test address"}]
        }
        
        create_success, created_task = self.run_test(
            "Create new task",
            "POST",
            "/task",
            201,
            data=new_task_data
        )
        
        if create_success and created_task.get('_id'):
            task_id = created_task['_id']
            print(f"   Created task with ID: {task_id}")
            
            # Test get task by ID
            self.run_test(
                "Get task by ID",
                "GET",
                f"/task/{task_id}",
                200
            )
            
            # Test task timeline
            self.run_test(
                "Get task timeline",
                "GET",
                f"/task/{task_id}/timeline",
                200
            )
            
            # Test task discussions
            self.run_test(
                "Get task discussions",
                "GET",
                f"/task/{task_id}/discussions",
                200
            )
        
        return success

    def test_attendance_api(self):
        """Test attendance endpoints"""
        print("\n⏰ Testing Attendance APIs...")
        
        # Get today's attendance status
        self.run_test(
            "Get today's attendance",
            "GET",
            "/attendance/today",
            200
        )
        
        # Get attendance history
        self.run_test(
            "Get attendance history",
            "GET",
            "/attendance/history",
            200
        )
        
        # Get monthly stats
        current_month = datetime.now().strftime("%Y-%m")
        self.run_test(
            "Get monthly attendance stats",
            "GET",
            f"/attendance/monthly-stats?month={current_month}",
            200
        )
        
        # Test check-in (might fail if already checked in)
        checkin_data = {
            "coordinates": {"latitude": 28.6139, "longitude": 77.2090},
            "address": "Test Location",
            "accuracy": 10
        }
        
        success, _ = self.run_test(
            "Check-in (may fail if already checked in)",
            "POST",
            "/attendance/check-in", 
            200,
            data=checkin_data
        )
        
        return True

    def test_chat_api(self):
        """Test chat endpoints"""
        print("\n💬 Testing Chat APIs...")
        
        # Get chat rooms
        self.run_test(
            "Get chat rooms",
            "GET",
            "/chat/rooms",
            200
        )
        
        return True

    def test_admin_apis(self):
        """Test admin-specific endpoints"""
        print("\n👑 Testing Admin APIs...")
        
        # Test organization settings
        self.run_test(
            "Get organization settings",
            "GET",
            "/organization-settings",
            200
        )
        
        # Test admin employees endpoint
        self.run_test(
            "Get employees (admin)",
            "GET",
            "/employees",
            200
        )
        
        # Test salary configs
        if self.user.get('_id'):
            self.run_test(
                "Get salary config",
                "GET",
                f"/salary/config/{self.user['_id']}",
                200
            )
        
        return True

    def test_stats_apis(self):
        """Test statistics endpoints"""
        print("\n📊 Testing Statistics APIs...")
        
        # Test task summary stats with required parameter
        self.run_test(
            "Get task summary stats",
            "GET",
            "/stats/tasks-summary?isSelfTask=false",
            200
        )
        
        # Test today's tasks with required parameter
        self.run_test(
            "Get today's tasks",
            "GET",
            "/stats/todaysTasks?isSelfTask=false",
            200
        )
        
        return True

    def run_comprehensive_test(self):
        """Run all API tests"""
        print("🚀 Starting Foratask API Test Suite")
        print("=" * 50)
        
        # Test with different user roles
        for role in ["admin", "supervisor", "employee"]:
            print(f"\n🔐 Testing with {role.upper()} role...")
            
            if not self.test_login(role):
                print(f"❌ Failed to login as {role}, skipping role-specific tests")
                continue
                
            # Core API tests
            self.test_employees_api()
            self.test_tasks_api()
            self.test_attendance_api()
            self.test_chat_api()
            self.test_stats_apis()
            
            # Admin-only tests
            if role == "admin":
                self.test_admin_apis()
                
            # Clear token for next role
            self.token = None
            self.user = None
        
        # Print final results
        print("\n" + "=" * 50)
        print("📊 TEST RESULTS")
        print("=" * 50)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("✅ All tests passed!")
            return 0
        else:
            failed = self.tests_run - self.tests_passed
            print(f"❌ {failed} tests failed")
            return 1

if __name__ == "__main__":
    tester = ForataskAPITester()
    exit_code = tester.run_comprehensive_test()
    sys.exit(exit_code)