#!/usr/bin/env python3

import os
import sys
from pathlib import Path

# Add the src directory to Python path
src_path = Path(__file__).parent / 'src'
sys.path.insert(0, str(src_path))

from neirapinuela import create_app
from neirapinuela.config import DevelopmentConfig, ProductionConfig

def main():
    # Determine configuration based on environment
    env = os.environ.get('FLASK_ENV', 'development')
    
    if env == 'production':
        config = ProductionConfig
    else:
        config = DevelopmentConfig
    
    # Create Flask application
    app = create_app(config)
    
    # Run development server
    if env == 'development':
        app.run(
            host='0.0.0.0',
            port=int(os.environ.get('PORT', 5000)),
            debug=True
        )
    else:
        print("For production, use Gunicorn:")
        print("gunicorn -c gunicorn_config.py 'neirapinuela:create_app()'")

if __name__ == '__main__':
    main()