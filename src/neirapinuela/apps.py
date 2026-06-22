from flask import Blueprint, render_template, current_app, abort, jsonify, request
from flask_login import login_required, current_user
from flask_babel import _

bp = Blueprint("apps", __name__)


@bp.route("/mecanografia")
def mecanografia():
    return render_template("apps/mecanografia.html")


@bp.route("/mecanografia/progreso", methods=["GET"])
@login_required
def mecanografia_progreso():
    """Devuelve lecciones completadas, mejores stats y logros del usuario."""
    from .models import TypingCompletion, TypingAchievement

    username = current_user.username
    completions = TypingCompletion.query.filter_by(username=username).all()
    completed = sorted({c.lesson_index for c in completions})
    best = {}
    for c in completions:
        li = c.lesson_index
        cur = best.get(li)
        if cur is None or c.wpm > cur["wpm"]:
            best[li] = {"wpm": c.wpm, "accuracy": c.accuracy}
    achievements = [
        a.achievement_id
        for a in TypingAchievement.query.filter_by(username=username).all()
    ]
    return jsonify(
        completed_lessons=completed,
        achievements=achievements,
        best_stats=best,
    )


@bp.route("/mecanografia/progreso", methods=["POST"])
@login_required
def mecanografia_guardar():
    """Guarda una completación de lección con sus estadísticas."""
    from .models import TypingCompletion
    from .db import db

    data = request.get_json(silent=True) or {}
    li = data.get("lesson_index")
    if li is None or not isinstance(li, int) or li < 0:
        return jsonify(ok=False, error="lesson_index inválido"), 400
    try:
        record = TypingCompletion(
            username=current_user.username,
            lesson_index=li,
            wpm=int(data.get("wpm", 0)),
            accuracy=float(data.get("accuracy", 0)),
            errors=int(data.get("errors", 0)),
            time_seconds=float(data.get("time_seconds", 0)),
        )
        db.session.add(record)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify(ok=False, error=str(e)), 500
    return jsonify(ok=True)


@bp.route("/mecanografia/logro", methods=["POST"])
@login_required
def mecanografia_logro():
    """Guarda un logro desbloqueado (idempotente)."""
    from .models import TypingAchievement
    from .db import db

    data = request.get_json(silent=True) or {}
    aid = data.get("achievement_id")
    if aid not in ("perfect", "speed40", "persistent"):
        return jsonify(ok=False, error="achievement_id inválido"), 400
    try:
        exists = TypingAchievement.query.filter_by(
            username=current_user.username, achievement_id=aid
        ).first()
        if exists:
            return jsonify(ok=True, already=True)
        db.session.add(
            TypingAchievement(username=current_user.username, achievement_id=aid)
        )
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify(ok=False, error=str(e)), 500
    return jsonify(ok=True)


@bp.route("/geografia")
def geografia():
    return render_template("apps/geografia.html")


@bp.route("/quiz")
def quiz():
    return render_template("apps/quiz.html")


@bp.route("/gas")
def gas():
    return render_template("apps/gas.html")


@bp.route("/euro_coin_game")
def euro_coin_game():
    return render_template("apps/euro_coin_game.html")


@bp.route("/multiplications")
@bp.route("/multiplications/<int:max_value>")
def multiplications(max_value=9):
    return render_template("apps/multiplications.html", max_value=max_value)


@bp.route("/measurements")
@bp.route("/measurements/<kind>")
def measurements(kind="length"):
    from flask_babel import _

    kinds = ["length", "mass", "capacity"]
    translate_kinds = {
        "length": _("Longitud"),
        "mass": _("Masa"),
        "capacity": _("Capacidad"),
    }

    if kind not in kinds:
        kind = "length"

    units_data = {
        "length": ["km", "hm", "dam", "m", "dm", "cm", "mm"],
        "mass": ["kg", "hg", "dag", "g", "dg", "cg", "mg"],
        "capacity": ["kl", "hl", "dal", "l", "dl", "cl", "ml"],
    }

    return render_template(
        "apps/measurements.html",
        kind=kind,
        kinds=kinds,
        translate_kinds=translate_kinds,
        units=units_data[kind],
    )


@bp.route("/grafana")
@login_required
def grafana():
    from flask import redirect

    app_config = current_app.config["APPLICATIONS"]["grafana"]
    # Check if user has required group
    if not any(group in current_user.groups for group in app_config["required_groups"]):
        abort(403)
    return redirect("https://grafana.neirapinuela.es")


@bp.route("/sudoku")
@login_required
def sudoku():
    app_config = current_app.config["APPLICATIONS"]["sudoku"]
    if not any(group in current_user.groups for group in app_config["required_groups"]):
        abort(403)
    return render_template("apps/sudoku.html")


@bp.route("/wordle")
@login_required
def wordle():
    app_config = current_app.config["APPLICATIONS"]["wordle"]
    if not any(group in current_user.groups for group in app_config["required_groups"]):
        abort(403)
    return render_template("apps/wordle.html")


@bp.route("/sopas")
@login_required
def sopas():
    from .config import SOPAS_CATEGORIES, SOPAS_DEFAULTS

    app_config = current_app.config["APPLICATIONS"]["sopas"]
    if not any(group in current_user.groups for group in app_config["required_groups"]):
        abort(403)

    return render_template(
        "apps/sopas.html",
        sopas_categories=SOPAS_CATEGORIES,
        sopas_defaults=SOPAS_DEFAULTS,
    )


@bp.route("/")
def apps_index():
    apps = current_app.config["APPLICATIONS"]
    available_apps = []

    for app_id, app_config in apps.items():
        available_apps.append(
            {
                "id": app_id,
                "name": app_config["name"],
                "url": app_config["url"],
                "description": app_config["description"],
                "required_groups": app_config["required_groups"],
                "requires_login": app_config["requires_login"],
            }
        )

    return render_template("apps/index.html", apps=available_apps)
