import os
from . import create_app
from .config import ProductionConfig, DevelopmentConfig

config_class = ProductionConfig if os.environ.get('FLASK_ENV') == 'production' else DevelopmentConfig
application = create_app(config_class)

# For backwards compatibility
app = application

if __name__ == "__main__":
    app.run()