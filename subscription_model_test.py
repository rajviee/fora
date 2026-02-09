#!/usr/bin/env python3
"""
Additional tests for Subscription model methods
Tests calculateAmount() and getDaysUntilExpiry() methods
"""

import requests
import json
import sys
from datetime import datetime, timedelta

def test_subscription_model_methods():
    """Test subscription model methods through API responses"""
    print("🔍 Testing Subscription Model Methods...")
    
    base_url = "http://localhost:3000"
    
    # Register a test company
    reg_data = {
        "email": f"modeltest_{int(datetime.now().timestamp())}@example.com",
        "password": "TestPass123!",
        "firstName": "Model",
        "lastName": "Test",
        "contactNumber": "+919876543210",
        "dateOfBirth": "1990-01-01",
        "gender": "male",
        "designation": "CEO",
        "companyEmail": f"modelcompany_{int(datetime.now().timestamp())}@example.com",
        "companyName": f"Model Test Company {int(datetime.now().timestamp())}",
        "companyContactNumber": "+919876543210",
        "companyAddress": "123 Model Test Street"
    }
    
    # Register
    reg_resp = requests.post(f'{base_url}/auth/register', json=reg_data)
    if reg_resp.status_code != 201:
        print(f"❌ Registration failed: {reg_resp.status_code}")
        return False
    
    # Login
    login_resp = requests.post(f'{base_url}/auth/login', json={
        'email': reg_data['email'], 
        'password': reg_data['password']
    })
    if login_resp.status_code != 200:
        print(f"❌ Login failed: {login_resp.status_code}")
        return False
    
    token = login_resp.json()['token']
    
    # Test subscription status to get calculateAmount() and getDaysUntilExpiry() results
    sub_resp = requests.get(f'{base_url}/payment/subscription-status', 
                           headers={'Authorization': f'Bearer {token}'})
    
    if sub_resp.status_code != 200:
        print(f"❌ Subscription status failed: {sub_resp.status_code}")
        return False
    
    sub_data = sub_resp.json()['subscription']
    
    # Test calculateAmount() method
    print(f"📊 Testing calculateAmount() method:")
    print(f"   Current user count: {sub_data['currentUserCount']}")
    print(f"   Total amount: ₹{sub_data['totalAmount']}")
    
    # For 1 user, should be base price (249)
    if sub_data['currentUserCount'] == 1 and sub_data['totalAmount'] == 249:
        print("✅ calculateAmount() working correctly for 1 user")
    else:
        print(f"❌ calculateAmount() incorrect: expected 249 for 1 user, got {sub_data['totalAmount']}")
        return False
    
    # Test getDaysUntilExpiry() method
    print(f"📅 Testing getDaysUntilExpiry() method:")
    print(f"   Days until expiry: {sub_data['daysUntilExpiry']}")
    print(f"   Trial end date: {sub_data['trialEndDate']}")
    
    # Should be around 90 days for new trial
    if 85 <= sub_data['daysUntilExpiry'] <= 90:
        print("✅ getDaysUntilExpiry() working correctly")
    else:
        print(f"❌ getDaysUntilExpiry() incorrect: expected ~90 days, got {sub_data['daysUntilExpiry']}")
        return False
    
    # Test price calculation for different user counts
    print(f"💰 Testing price calculation for different user counts:")
    
    test_cases = [
        (1, 249),   # Base plan
        (3, 249),   # Still base plan
        (5, 249),   # Base plan limit
        (6, 299),   # Base + 1 additional user
        (10, 499),  # Base + 5 additional users
        (15, 749)   # Base + 10 additional users
    ]
    
    for user_count, expected_amount in test_cases:
        calc_resp = requests.get(f'{base_url}/payment/calculate-price?userCount={user_count}')
        if calc_resp.status_code == 200:
            calc_data = calc_resp.json()['pricing']
            actual_amount = calc_data['totalAmount']
            if actual_amount == expected_amount:
                print(f"✅ {user_count} users: ₹{actual_amount} (correct)")
            else:
                print(f"❌ {user_count} users: expected ₹{expected_amount}, got ₹{actual_amount}")
                return False
        else:
            print(f"❌ Price calculation failed for {user_count} users")
            return False
    
    print("✅ All subscription model methods working correctly!")
    return True

if __name__ == "__main__":
    success = test_subscription_model_methods()
    sys.exit(0 if success else 1)