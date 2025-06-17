import os
from . import create_app
from .config import ProductionConfig, DevelopmentConfig

config_class = ProductionConfig if os.environ.get('FLASK_ENV') == 'production' else DevelopmentConfig
app = create_app(config_class)

if __name__ == "__main__":
    app.run()