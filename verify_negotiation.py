import sys
import os
sys.path.insert(0, os.path.abspath('src'))
from neirapinuela import create_app

try:
    app = create_app()
    client = app.test_client()

    def check(accept_header, expected_json):
        headers = {}
        if accept_header is not None:
            headers['Accept'] = accept_header
        
        # Trigger 404 which uses render_error
        response = client.get('/non-existent-url-9999', headers=headers)
        
        # Check if response is JSON
        # response.is_json checks Content-Type header
        actual_is_json = response.is_json
        
        # Also check content start just to be sure if header is missing
        if not actual_is_json and response.data.strip().startswith(b'{'):
            actual_is_json = True

        status = "PASS" if actual_is_json == expected_json else "FAIL"
        print(f"Accept: {accept_header!r:20} -> Is JSON: {str(actual_is_json):5} | Expected: {str(expected_json):5} | {status}")

    print("Running Content Negotiation Tests:")
    check('text/html', False)
    check('application/json', True)
    check('*/*', True)
    check(None, True)     # Missing header -> default JSON
    check('image/png', True) # No match -> default JSON (new behavior)

except ImportError as e:
    print(f"ImportError: {e}")
    # Fallback to visual inspection message if deps missing
except Exception as e:
    print(f"Error: {e}")
