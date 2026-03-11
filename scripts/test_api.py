"""
API Testing Script
Tests all endpoints of the Fake News Detector API.
"""
import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"


def print_response(title: str, response: requests.Response):
    """Pretty print API response."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    print(f"\nResponse:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
    print(f"{'='*60}\n")


def test_health():
    """Test health endpoint."""
    response = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", response)
    return response.status_code == 200


def test_analyze(text: str = None):
    """Test analyze endpoint."""
    if text is None:
        text = """
        Scientists have discovered a cure for all types of cancer using only 
        lemon juice and baking soda. Major pharmaceutical companies are trying 
        to hide this information from the public.
        """
    
    payload = {"text": text.strip()}
    response = requests.post(f"{BASE_URL}/analyze", json=payload)
    print_response("Analyze News", response)
    
    if response.status_code == 200:
        return response.json()
    return None


def test_feedback(analysis_id: int, feedback_type: str = "correct", comment: str = None):
    """Test feedback endpoint."""
    payload = {
        "analysis_id": analysis_id,
        "feedback_type": feedback_type,
        "comment": comment
    }
    response = requests.post(f"{BASE_URL}/feedback", json=payload)
    print_response("Submit Feedback", response)
    return response.status_code == 200


def test_history(limit: int = 10, offset: int = 0):
    """Test history endpoint."""
    response = requests.get(f"{BASE_URL}/history?limit={limit}&offset={offset}")
    print_response("Get History", response)
    return response.status_code == 200


def test_stats():
    """Test statistics endpoint."""
    response = requests.get(f"{BASE_URL}/stats")
    print_response("Get Statistics", response)
    return response.status_code == 200


def run_all_tests():
    """Run all API tests in sequence."""
    print("\n" + "="*60)
    print("  🧪 FAKE NEWS DETECTOR API - COMPREHENSIVE TEST")
    print("="*60)
    
    # Test 1: Health Check
    print("\n[1/5] Testing Health Endpoint...")
    if not test_health():
        print("❌ Health check failed! Is the API running?")
        return
    print("✅ Health check passed")
    
    # Test 2: Analyze - Fake News Example
    print("\n[2/5] Testing Analyze Endpoint (Fake News)...")
    fake_news = """
    BREAKING: Government admits to hiding alien technology for 50 years! 
    Secret documents leaked by anonymous whistleblower reveal that 
    extraterrestrial spacecraft have been stored at Area 51 since 1970.
    """
    result1 = test_analyze(fake_news)
    if result1:
        print(f"✅ Analysis completed: {result1['label_text']} (confidence: {result1['confidence']})")
    
    # Test 3: Analyze - Real News Example
    print("\n[3/5] Testing Analyze Endpoint (Real News)...")
    real_news = """
    The Federal Reserve announced a 0.25% interest rate increase today, 
    citing continued inflationary pressures in the economy. The decision 
    was made during the Federal Open Market Committee meeting held in Washington.
    """
    result2 = test_analyze(real_news)
    if result2:
        print(f"✅ Analysis completed: {result2['label_text']} (confidence: {result2['confidence']})")
    
    # Test 4: Submit Feedback
    print("\n[4/5] Testing Feedback Endpoint...")
    if result1:
        if test_feedback(
            result1['id'], 
            'correct', 
            'This is clearly fake news'
        ):
            print("✅ Feedback submitted successfully")
    
    # Test 5: Get History
    print("\n[5/5] Testing History Endpoint...")
    if test_history(limit=5):
        print("✅ History retrieved successfully")
    
    # Bonus: Get Statistics
    print("\n[BONUS] Testing Statistics Endpoint...")
    if test_stats():
        print("✅ Statistics retrieved successfully")
    
    print("\n" + "="*60)
    print("  ✅ ALL TESTS COMPLETED")
    print("="*60 + "\n")


def interactive_test():
    """Interactive testing mode."""
    print("\n🎯 Interactive API Testing Mode")
    print("Enter 'quit' to exit\n")
    
    while True:
        print("\nEnter news text to analyze (or 'quit' to exit):")
        text = input("> ").strip()
        
        if text.lower() == 'quit':
            break
        
        if not text:
            print("❌ Please enter some text")
            continue
        
        result = test_analyze(text)
        
        if result:
            print(f"\n📊 Result:")
            print(f"   Label: {result['label_text']}")
            print(f"   Confidence: {result['confidence']}")
            print(f"   Score: {result['score']:.2%}")
            
            feedback = input("\nWas this prediction correct? (yes/no/skip): ").strip().lower()
            if feedback in ['yes', 'no']:
                feedback_type = 'correct' if feedback == 'yes' else 'incorrect'
                comment = input("Optional comment: ").strip() or None
                test_feedback(result['id'], feedback_type, comment)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--interactive":
        interactive_test()
    else:
        run_all_tests()
        
        print("\n💡 Tip: Run with --interactive flag for interactive testing")
        print("   python scripts/test_api.py --interactive\n")
