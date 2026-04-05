from flask import Blueprint, render_template, session, redirect, url_for, request
from flask_babel import _, get_locale
from flask_login import current_user
from . import render_error
from .config import SOPAS_CATEGORIES, SOPAS_DEFAULTS

bp = Blueprint("main", __name__)


@bp.route(
    "/error/<int:code>.html",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
)
def error_test(code):
    from flask import abort

    if code in [401, 403, 404, 405, 500, 502, 503, 504]:
        return render_error(code, return_code=code)
    # return render_template(f'errors/{code}.html'), 200
    # return render_template(f'errors/{code}.html'), code
    return abort(404)


@bp.route("/")
def index():
    return render_template("index.html")


@bp.route("/set_language/<language>")
def set_language(language):
    if language in ["es", "en"]:
        session["language"] = language
    return redirect(request.referrer or url_for("main.index"))


@bp.route("/about")
def about():
    return render_template("about.html")


@bp.route("/family")
def family():
    return render_template("family.html")


# --- Applications ---


@bp.route("/sudoku")
def sudoku():
    return render_template("apps/sudoku.html")


@bp.route("/wordle")
def wordle():
    from . import wordle_game

    game = wordle_game.WordleGame()
    return render_template("apps/wordle.html", word=game.get_word())


@bp.route("/sopas")
def sopas():
    return render_template(
        "apps/sopas.html",
        sopas_categories=SOPAS_CATEGORIES,
        sopas_defaults=SOPAS_DEFAULTS,
    )
