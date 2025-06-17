import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    LANGUAGES = ['es', 'en']
    BABEL_DEFAULT_LOCALE = 'es'
    BABEL_DEFAULT_TIMEZONE = 'UTC'
    
    FAMILY_MEMBERS = {
        'oscar': {
            'name': 'Oscar',
            'role': 'padre',
            'color': '#198754'
        },
        'eva': {
            'name': 'Eva',
            'role': 'madre',
            'color': '#198754'
        },
        'pablo': {
            'name': 'Pablo',
            'role': 'hijo',
            'color': '#198754'
        },
        'carlitos': {
            'name': 'Carlitos',
            'role': 'hijo',
            'color': '#198754'
        }
    }
    
    APPLICATIONS = {
        'mecanografia': {
            'name': 'Mecanografía',
            'url': '/apps/mecanografia',
            'requires_login': False,
            'members': ['pablo', 'carlitos'],
            'description': 'Aplicación para practicar mecanografía'
        },
        'grafana': {
            'name': 'Grafana',
            'url': 'https://grafana.neirapinuela.es',
            'requires_login': True,
            'members': ['oscar'],
            'description': 'Panel de monitorización y métricas'
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