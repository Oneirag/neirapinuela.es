import os
from werkzeug.middleware.proxy_fix import ProxyFix
from . import create_app
from .config import ProductionConfig, DevelopmentConfig

config_class = ProductionConfig if os.environ.get('FLASK_ENV') == 'production' else DevelopmentConfig
application = create_app(config_class)

# Fix for mixed content issues when running behind Nginx (HTTPS)
# Trust the X-Forwarded-Proto header sent by Nginx
application.wsgi_app = ProxyFix(application.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1, x_prefix=1)

# For backwards compatibility
app = application

if __name__ == "__main__":
    app.run(port=os.getenv("FLASK_PORT", 5000))