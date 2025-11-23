import os
from dotenv import load_dotenv
from flask_babel import lazy_gettext as _l

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    LANGUAGES = ['es', 'en']
    BABEL_DEFAULT_LOCALE = 'es'
    BABEL_DEFAULT_TIMEZONE = 'UTC'
    
    FAMILY_MEMBERS = {
        'oscar': {
            'name': 'Oscar',
            'role': _l('padre'),
            'color': '#198754'
        },
        'eva': {
            'name': 'Eva',
            'role': _l('madre'),
            'color': '#198754'
        },
        'pablo': {
            'name': 'Pablo',
            'role': _l('hijo'),
            'color': '#198754'
        },
        'carlitos': {
            'name': 'Carlitos',
            'role': _l('hijo'),
            'color': '#198754'
        }
    }
    
    APPLICATIONS = {
        'mecanografia': {
            'name': _l('Mecanografía'),
            'url': '/apps/mecanografia',
            'requires_login': False,
            'members': ['pablo', 'carlitos'],
            'description': _l('Aplicación para practicar mecanografía')
        },
        'geografia': {
            'name': _l('Geografía'),
            'url': '/apps/geografia',
            'requires_login': False,
            'members': ['pablo', 'carlitos'],
            'description': _l('Aplicación para practicar geografia')
        },
        'grafana': {
            'name': 'Grafana',
            'url': 'https://grafana.neirapinuela.es',
            'requires_login': True,
            'members': ['oscar'],
            'description': _l('Panel de monitorización y métricas')
        },
        'quiz': {
            'name': _l('Quiz'),
            'url': '/apps/quiz',
            'requires_login': False,
            'members': ['pablo', 'carlitos'],
            'description': _l('Repaso de capitales, verbos y más')
        },
        'gas': {
            'name': _l('Gas'),
            'url': '/apps/gas',
            'requires_login': False,
            'members': ['oscar'],
            'description': _l('Conversor de unidades de gas')
        }
    }


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False


class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False


class TestingConfig(Config):
    DEBUG = True
    TESTING = True
    WTF_CSRF_ENABLED = False