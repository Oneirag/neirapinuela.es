import os
from pathlib import Path
from dotenv import load_dotenv
from flask_babel import lazy_gettext as _l

load_dotenv()


def _read_pyproject_version(default: str = "0.0.0") -> str:
    try:
        import tomllib
    except ImportError:
        try:
            import tomli as tomllib  # type: ignore
        except ImportError:
            return default
    pyproject = Path(__file__).resolve().parents[2] / "pyproject.toml"
    try:
        with open(pyproject, "rb") as f:
            data = tomllib.load(f)
        return data.get("project", {}).get("version", default)
    except (OSError, KeyError):
        return default


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-key-change-in-production"
    LANGUAGES = ["es", "en"]
    BABEL_DEFAULT_LOCALE = "es"
    BABEL_DEFAULT_TIMEZONE = "UTC"
    APP_VERSION = _read_pyproject_version()

    # Database (SQLite by default; file placed under app.instance_path)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///neirapinuela.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Session and Cookie Configuration
    SESSION_COOKIE_DOMAIN = ".neirapinuela.es"
    REMEMBER_COOKIE_DOMAIN = ".neirapinuela.es"
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"

    FAMILY_MEMBERS = {
        "oscar": {"name": "Oscar", "role": _l("padre"), "color": "#198754"},
        "eva": {"name": "Eva", "role": _l("madre"), "color": "#198754"},
        "pablo": {"name": "Pablo", "role": _l("hijo"), "color": "#198754"},
        "carlitos": {"name": "Carlitos", "role": _l("hijo"), "color": "#198754"},
    }

    # OIDC Configuration
    AUTH_OIDC_CLIENT_ID = os.environ.get("AUTH_OIDC_CLIENT_ID")
    AUTH_OIDC_CLIENT_SECRET = os.environ.get("AUTH_OIDC_CLIENT_SECRET")
    AUTH_OIDC_ISSUER = os.environ.get(
        "AUTH_OIDC_ISSUER", "https://auth.neirapinuela.es"
    )
    AUTH_OIDC_CONF_URL = (
        f"{AUTH_OIDC_ISSUER.rstrip('/')}/.well-known/openid-configuration"
    )
    AUTH_OIDC_LOGOUT_URL = os.environ.get("AUTH_OIDC_LOGOUT_URL")

    APPLICATIONS = {
        "mecanografia": {
            "name": _l("Mecanografía"),
            "url": "/apps/mecanografia",
            "requires_login": False,
            "required_groups": [],
            "description": _l("Aplicación para practicar mecanografía"),
        },
        "geografia": {
            "name": _l("Geografía"),
            "url": "/apps/geografia",
            "requires_login": False,
            "required_groups": [],
            "description": _l("Aplicación para practicar geografia"),
        },
        "grafana": {
            "name": "Grafana",
            "url": "https://grafana.neirapinuela.es",
            "requires_login": True,
            "required_groups": ["admins"],
            "description": _l("Panel de monitorización y métricas"),
        },
        "quiz": {
            "name": _l("Quiz"),
            "url": "/apps/quiz",
            "requires_login": False,
            "required_groups": [],
            "description": _l("Repaso de capitales, verbos y más"),
        },
        "gas": {
            "name": _l("Gas"),
            "url": "/apps/gas",
            "requires_login": False,
            "required_groups": [],
            "description": _l("Conversor de unidades de gas"),
        },
        "euro_coin_game": {
            "name": _l("Euro Coin Game"),
            "url": "/apps/euro_coin_game",
            "requires_login": False,
            "required_groups": [],
            "description": _l("Aprende a usar las monedas de euro"),
        },
        "measurements": {
            "name": _l("Conversor de Unidades"),
            "url": "/apps/measurements",
            "requires_login": False,
            "required_groups": [],
            "description": _l("Practica la conversión de unidades"),
        },
        "multiplications": {
            "name": _l("Multiplicaciones"),
            "url": "/apps/multiplications",
            "requires_login": False,
            "required_groups": [],
            "description": _l("Practica las tablas de multiplicar"),
        },
        "sudoku": {
            "name": _l("Sudoku Avanzado"),
            "url": "/apps/sudoku",
            "requires_login": True,
            "required_groups": ["admins", "family"],
            "description": _l("Juega al Sudoku Difícil, Samurai o Killer"),
        },
        "wordle": {
            "name": _l("Wordle ES"),
            "url": "/apps/wordle",
            "requires_login": True,
            "required_groups": ["admins", "family"],
            "description": _l("Adivina la palabra oculta en 6 intentos"),
        },
        "sopas": {
            "name": _l("Sopas de Letras"),
            "url": "/apps/sopas",
            "requires_login": True,
            "required_groups": ["admins", "family"],
            "description": _l("Encuentra las palabras ocultas en la cuadrícula"),
        },
        "ecuaciones": {
            "name": "Ecuaciones",
            "url": "/apps/ecuaciones",
            "requires_login": False,
            "required_groups": ["pablo"],
            "description": _l("Practica ecuaciones de primer grado paso a paso"),
        },
    }


SOPAS_CATEGORIES = [
    {"id": "animales", "name": "Animales"},
    {"id": "deportes", "name": "Deportes"},
    {"id": "comidas", "name": "Comidas"},
    {"id": "cocina", "name": "Cocina"},
]

SOPAS_DEFAULTS = {"gridSize": 15, "wordsPerGame": 8, "difficulty": "normal"}


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
