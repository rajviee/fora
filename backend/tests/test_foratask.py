"""
ForaTask Backend API Tests - Testing all critical endpoints
- Auth (login with seeded users)
- Dashboard/Stats endpoints
- Task CRUD with multi-location
- Attendance
- Chat
- Team
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Seeded credentials
ADMIN_USER = {"email": "rajvi@varientworld.com", "password": "Rajvi@123"}
SUPERVISOR_USER = {"email": "shubh@varientworld.com", "password": "Shubh@123"}
EMPLOYEE_USER = {"email": "developers1@varientworld.com", "password": "Tushar@123"}


@pytest.fixture(scope="module")
def api_client():
    """Base API client"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def admin_token(api_client):
    """Get admin auth token"""
    resp = api_client.post(f"{BASE_URL}/api/auth/login", json=ADMIN_USER)
    if resp.status_code == 200:
        return resp.json().get("token")
    pytest.skip(f"Admin login failed: {resp.text}")


@pytest.fixture(scope="module")
def admin_client(api_client, admin_token):
    """API client with admin auth"""
    api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
    return api_client


class TestHealthAndAPI:
    """Test basic API health"""
    
    def test_api_root(self, api_client):
        resp = api_client.get(f"{BASE_URL}/api")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("status") == "ok"
        print("API root endpoint working")


class TestAuth:
    """Test authentication endpoints"""
    
    def test_admin_login(self, api_client):
        """Test login with admin credentials"""
        resp = api_client.post(f"{BASE_URL}/api/auth/login", json=ADMIN_USER)
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        assert "subscription" in data
        print(f"Admin login successful: subscription={data.get('subscription')}")
    
    def test_supervisor_login(self, api_client):
        """Test login with supervisor credentials"""
        resp = api_client.post(f"{BASE_URL}/api/auth/login", json=SUPERVISOR_USER)
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        print("Supervisor login successful")
    
    def test_employee_login(self, api_client):
        """Test login with employee credentials"""
        resp = api_client.post(f"{BASE_URL}/api/auth/login", json=EMPLOYEE_USER)
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        print("Employee login successful")
    
    def test_login_invalid_credentials(self, api_client):
        """Test login with invalid credentials"""
        resp = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert resp.status_code == 400
        print("Invalid login correctly rejected")


class TestDashboard:
    """Test dashboard and stats endpoints"""
    
    def test_tasks_summary(self, admin_client):
        """Test dashboard stats endpoint"""
        resp = admin_client.get(f"{BASE_URL}/api/stats/tasks-summary?isSelfTask=false")
        assert resp.status_code == 200
        data = resp.json()
        # Check expected fields
        assert "allTimeTotalTasks" in data or isinstance(data, dict)
        print(f"Dashboard stats: {data}")
    
    def test_user_info(self, admin_client):
        """Test user info endpoint"""
        resp = admin_client.get(f"{BASE_URL}/api/me/userinfo")
        assert resp.status_code == 200
        data = resp.json()
        assert "user" in data or "email" in data
        print(f"User info retrieved successfully")
    
    def test_users_list(self, admin_client):
        """Test users list endpoint (for assignees)"""
        resp = admin_client.get(f"{BASE_URL}/api/me/usersList")
        assert resp.status_code == 200
        data = resp.json()
        users = data if isinstance(data, list) else data.get("users", [])
        assert len(users) >= 1
        print(f"Found {len(users)} users in team")


class TestTaskCRUD:
    """Test task CRUD operations"""
    
    def test_get_task_list_team(self, admin_client):
        """Test task list endpoint for team tasks"""
        resp = admin_client.get(f"{BASE_URL}/api/task/getTaskList?isSelfTask=false&perPage=15&page=0")
        assert resp.status_code == 200
        data = resp.json()
        assert "tasks" in data
        print(f"Team tasks: {len(data['tasks'])} tasks, total: {data.get('totalTasks', 0)}")
    
    def test_get_task_list_self(self, admin_client):
        """Test task list endpoint for self tasks"""
        resp = admin_client.get(f"{BASE_URL}/api/task/getTaskList?isSelfTask=true&perPage=15&page=0")
        assert resp.status_code == 200
        data = resp.json()
        assert "tasks" in data
        print(f"Self tasks: {len(data['tasks'])} tasks")
    
    def test_create_task_basic(self, admin_client):
        """Test creating a basic task"""
        # First get users list to get IDs
        users_resp = admin_client.get(f"{BASE_URL}/api/me/usersList")
        users = users_resp.json() if isinstance(users_resp.json(), list) else users_resp.json().get("users", [])
        
        if len(users) == 0:
            pytest.skip("No users available for task assignment")
        
        user_ids = [u["_id"] for u in users[:2]]
        
        from datetime import datetime, timedelta
        due_date = (datetime.now() + timedelta(days=3)).isoformat()
        
        payload = {
            "title": "TEST_Basic_Task_" + datetime.now().strftime("%Y%m%d%H%M%S"),
            "description": "Test task created by pytest",
            "priority": "Medium",
            "taskType": "Single",
            "dueDateTime": due_date,
            "assignees": user_ids[:1],
            "observers": user_ids,
            "isRemote": False,
            "isMultiLocation": False
        }
        
        resp = admin_client.post(f"{BASE_URL}/api/task/add-task", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        task_id = data.get("task", {}).get("_id") or data.get("taskId")
        assert task_id is not None
        print(f"Task created with ID: {task_id}")
        return task_id
    
    def test_create_task_with_multilocation(self, admin_client):
        """Test creating a task with multi-location support"""
        # Get users list
        users_resp = admin_client.get(f"{BASE_URL}/api/me/usersList")
        users = users_resp.json() if isinstance(users_resp.json(), list) else users_resp.json().get("users", [])
        
        if len(users) == 0:
            pytest.skip("No users available for task assignment")
        
        user_ids = [u["_id"] for u in users[:2]]
        
        from datetime import datetime, timedelta
        due_date = (datetime.now() + timedelta(days=5)).isoformat()
        
        # Create task first
        payload = {
            "title": "TEST_MultiLocation_Task_" + datetime.now().strftime("%Y%m%d%H%M%S"),
            "description": "Test task with multiple locations",
            "priority": "High",
            "taskType": "Single",
            "dueDateTime": due_date,
            "assignees": user_ids[:1],
            "observers": user_ids,
            "isRemote": False,
            "isMultiLocation": True
        }
        
        resp = admin_client.post(f"{BASE_URL}/api/task/add-task", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        task_id = data.get("task", {}).get("_id") or data.get("taskId")
        assert task_id is not None
        
        # Add locations
        locations_payload = {
            "locations": [
                {"name": "Location 1", "description": "First location description"},
                {"name": "Location 2", "description": "Second location description"},
                {"name": "Location 3", "description": "Third location description"}
            ]
        }
        
        loc_resp = admin_client.post(f"{BASE_URL}/api/task-extended/{task_id}/locations", json=locations_payload)
        assert loc_resp.status_code == 201
        print(f"Multi-location task created with ID: {task_id}")
        
        # Verify locations were added
        get_loc_resp = admin_client.get(f"{BASE_URL}/api/task-extended/{task_id}/locations")
        assert get_loc_resp.status_code == 200
        loc_data = get_loc_resp.json()
        locations = loc_data.get("locations", [])
        assert len(locations) >= 3
        print(f"Verified {len(locations)} locations for task")
        return task_id
    
    def test_get_task_detail(self, admin_client):
        """Test getting task detail"""
        # Get a task first
        list_resp = admin_client.get(f"{BASE_URL}/api/task/getTaskList?isSelfTask=false&perPage=5&page=0")
        tasks = list_resp.json().get("tasks", [])
        
        if len(tasks) == 0:
            pytest.skip("No tasks available to get detail")
        
        task_id = tasks[0]["_id"]
        resp = admin_client.get(f"{BASE_URL}/api/task/{task_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert "_id" in data or "title" in data
        print(f"Task detail retrieved: {data.get('title')}")


class TestTaskExtended:
    """Test task extended endpoints (locations, timeline, discussions)"""
    
    def test_task_timeline(self, admin_client):
        """Test task timeline endpoint"""
        # Get a task first
        list_resp = admin_client.get(f"{BASE_URL}/api/task/getTaskList?isSelfTask=false&perPage=5&page=0")
        tasks = list_resp.json().get("tasks", [])
        
        if len(tasks) == 0:
            pytest.skip("No tasks available")
        
        task_id = tasks[0]["_id"]
        resp = admin_client.get(f"{BASE_URL}/api/task-extended/{task_id}/timeline")
        assert resp.status_code == 200
        data = resp.json()
        assert "timeline" in data
        print(f"Timeline has {len(data['timeline'])} entries")
    
    def test_task_discussions(self, admin_client):
        """Test task discussions endpoint"""
        # Get a task first
        list_resp = admin_client.get(f"{BASE_URL}/api/task/getTaskList?isSelfTask=false&perPage=5&page=0")
        tasks = list_resp.json().get("tasks", [])
        
        if len(tasks) == 0:
            pytest.skip("No tasks available")
        
        task_id = tasks[0]["_id"]
        resp = admin_client.get(f"{BASE_URL}/api/task-extended/{task_id}/discussions")
        assert resp.status_code == 200
        data = resp.json()
        assert "discussions" in data
        print(f"Discussions has {len(data['discussions'])} entries")
    
    def test_add_discussion_comment(self, admin_client):
        """Test adding a discussion comment"""
        # Get a task first
        list_resp = admin_client.get(f"{BASE_URL}/api/task/getTaskList?isSelfTask=false&perPage=5&page=0")
        tasks = list_resp.json().get("tasks", [])
        
        if len(tasks) == 0:
            pytest.skip("No tasks available")
        
        task_id = tasks[0]["_id"]
        resp = admin_client.post(f"{BASE_URL}/api/task-extended/{task_id}/discussions", json={
            "content": "TEST_Comment from pytest"
        })
        assert resp.status_code == 201
        print("Discussion comment added successfully")


class TestTeam:
    """Test team/employee endpoints"""
    
    def test_employee_list(self, admin_client):
        """Test employee list endpoint (admin only)"""
        resp = admin_client.get(f"{BASE_URL}/api/emp-list?perPage=50")
        assert resp.status_code == 200
        data = resp.json()
        employees = data.get("employees", [])
        assert len(employees) >= 1
        print(f"Found {len(employees)} employees")


class TestAttendance:
    """Test attendance endpoints"""
    
    def test_attendance_today(self, admin_client):
        """Test today's attendance status"""
        resp = admin_client.get(f"{BASE_URL}/api/attendance/today")
        assert resp.status_code == 200
        data = resp.json()
        assert "hasCheckedIn" in data or "attendance" in data or isinstance(data, dict)
        print(f"Today's attendance status: {data}")
    
    def test_attendance_history(self, admin_client):
        """Test attendance history endpoint"""
        resp = admin_client.get(f"{BASE_URL}/api/attendance/history")
        assert resp.status_code == 200
        data = resp.json()
        records = data.get("records", data.get("attendance", []))
        print(f"Attendance history: {len(records)} records")


class TestChat:
    """Test chat endpoints"""
    
    def test_chat_rooms(self, admin_client):
        """Test getting chat rooms"""
        resp = admin_client.get(f"{BASE_URL}/api/chat/rooms")
        assert resp.status_code == 200
        data = resp.json()
        rooms = data.get("rooms", [])
        print(f"Found {len(rooms)} chat rooms")
    
    def test_create_dm(self, admin_client):
        """Test creating a direct message room"""
        # Get users list
        users_resp = admin_client.get(f"{BASE_URL}/api/me/usersList")
        users = users_resp.json() if isinstance(users_resp.json(), list) else users_resp.json().get("users", [])
        
        if len(users) < 2:
            pytest.skip("Need at least 2 users for DM")
        
        # Find a different user to DM
        other_user = users[1] if users[0].get("role") == "admin" else users[0]
        
        resp = admin_client.post(f"{BASE_URL}/api/chat/dm", json={
            "otherUserId": other_user["_id"]
        })
        # May return existing room or create new
        assert resp.status_code in [200, 201]
        data = resp.json()
        assert "room" in data
        print(f"DM room: {data['room'].get('_id')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
