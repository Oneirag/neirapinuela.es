from flask import Flask
from flask_babel import Babel
from flask_login import LoginManager
from .config import Config
from flask import request, jsonify, render_template


def render_error(error_code, message=None, template=None, return_code=None):
    
    if request.accept_mimetypes.best_match(['application/json', 'text/html']) != 'text/html':
        response = {
            'error': message or 'Error',
            'code': error_code
        }
        return jsonify(response), return_code or error_code

    # This version forces english messages in JSON responses. JSON responses
    # could be used by other applications that are not in english, so it's
    # better to not to force english messages.
    # from flask_babel import force_locale, gettext
    # with force_locale('en'):
    #     response = {
    #         'error': gettext(message or 'Error'),
    #         'code': error_code
    #     }
    #     return jsonify(response), return_code or error_code
        
    template = template or f'errors/{error_code}.html'
    return render_template(template), return_code or error_code

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
            'APPLICATIONS': current_app.config['APPLICATIONS'],
            'IS_PRODUCTION': not current_app.debug
        }
    


    # Error handlers
    @app.errorhandler(401)
    def unauthorized_error(error):
        return render_error(401, 'Unauthorized')

    @app.errorhandler(403)
    def forbidden_error(error):
        return render_error(403, 'Forbidden')

    @app.errorhandler(404)
    def not_found_error(error):
        return render_error(404, 'Not Found')
    
    @app.errorhandler(405)
    def method_not_allowed_error(error):
        return render_error(405, 'Method Not Allowed')
    
    @app.errorhandler(500)
    def internal_error(error):
        return render_error(500, 'Internal Server Error')

    @app.errorhandler(502)
    def bad_gateway_error(error):
        return render_error(502, 'Bad Gateway')

    @app.errorhandler(503)
    def service_unavailable_error(error):
        return render_error(503, 'Service Unavailable')

    @app.errorhandler(504)
    def gateway_timeout_error(error):
        return render_error(504, 'Gateway Timeout')
    
    return app