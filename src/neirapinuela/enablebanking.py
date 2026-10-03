from flask import Blueprint, render_template
from flask_babel import force_locale

bp = Blueprint("enablebanking", __name__)


@bp.route("/privacy.html")
def privacy():
    with force_locale("en"):
        return render_template("apps/enablebanking/privacy.html")


@bp.route("/terms.html")
def terms():
    with force_locale("en"):
        return render_template("apps/enablebanking/terms.html")
