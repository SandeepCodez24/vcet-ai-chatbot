#!/usr/bin/env python3
"""
API Health Check Script
Tests the Railway backend API endpoints
"""

import requests
import sys
import time

# Configuration
BACKEND_URL = "https://vcet-ai-chatbot-production.up.railway.app"
TIMEOUT = 60  # seconds (for cold starts)

def test_health():
    """Test the /api/health endpoint"""
    print(f"\n🔍 Testing: {BACKEND_URL}/api/health")
    print("-" * 50)
    
    try:
        start = time.time()
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=TIMEOUT)
        elapsed = time.time() - start
        
        print(f"⏱️  Response time: {elapsed:.2f}s")
        print(f"📊 Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {data.get('status', 'unknown')}")
            print(f"🤖 RAG Initialized: {data.get('rag_initialized', 'unknown')}")
            print(f"🕐 Timestamp: {data.get('timestamp', 'unknown')}")
            return True
        else:
            print(f"❌ Error: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out (server may be starting up)")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed (server may be down)")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_query():
    """Test the /api/query endpoint"""
    print(f"\n🔍 Testing: {BACKEND_URL}/api/query")
    print("-" * 50)
    
    try:
        start = time.time()
        response = requests.post(
            f"{BACKEND_URL}/api/query",
            json={"query": "What is VCET?"},
            timeout=TIMEOUT,
            headers={"Content-Type": "application/json"}
        )
        elapsed = time.time() - start
        
        print(f"⏱️  Response time: {elapsed:.2f}s")
        print(f"📊 Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {data.get('status', 'unknown')}")
            response_text = data.get('response', '')[:200]
            print(f"💬 Response preview: {response_text}...")
            return True
        else:
            print(f"❌ Error: HTTP {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_suggestions():
    """Test the /api/suggestions endpoint"""
    print(f"\n🔍 Testing: {BACKEND_URL}/api/suggestions")
    print("-" * 50)
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/suggestions", timeout=30)
        print(f"📊 Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            suggestions = data.get('suggestions', [])
            print(f"✅ Got {len(suggestions)} suggestions")
            return True
        else:
            print(f"❌ Error: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    print("=" * 50)
    print("🚀 VCET AI Chatbot - API Test Suite")
    print("=" * 50)
    print(f"Backend URL: {BACKEND_URL}")
    
    results = []
    
    # Run tests
    results.append(("Health Check", test_health()))
    results.append(("Suggestions", test_suggestions()))
    results.append(("Query", test_query()))
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 Test Results Summary")
    print("=" * 50)
    
    passed = 0
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {name}: {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{len(results)} tests passed")
    
    return 0 if passed == len(results) else 1

if __name__ == "__main__":
    sys.exit(main())
