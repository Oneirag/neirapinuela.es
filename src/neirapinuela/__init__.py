from flask import Flask
from flask_babel import Babel
from flask_login import LoginManager
from .config import Config


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    def get_locale():
        from flask import request, session
        if 'language' in session:
            return session['language']
        return request.accept_languages.best_match(['es', 'en']) or 'es'
    
    babel = Babel(app, locale_selector=get_locale)
    
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    
    from .models import User
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.get(user_id)
    
    from .main import bp as main_bp
    app.register_blueprint(main_bp)
    
    from .auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    from .apps import bp as apps_bp
    app.register_blueprint(apps_bp, url_prefix='/apps')
    
    # Context processor for all templates
    @app.context_processor
    def inject_conf_vars():
        from flask import current_app
        from flask_babel import get_locale
        return {
            'LANGUAGES': current_app.config['LANGUAGES'],
            'CURRENT_LANGUAGE': str(get_locale()),
            'FAMILY_MEMBERS': current_app.config['FAMILY_MEMBERS'],
            'APPLICATIONS': current_app.config['APPLICATIONS']
        }
    
    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        from flask import render_template
        return render_template('errors/404.html'), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        from flask import render_template
        return render_template('errors/500.html'), 500
    
    @app.errorhandler(403)
    def forbidden_error(error):
        from flask import render_template
        return render_template('errors/403.html'), 403
    
    return app