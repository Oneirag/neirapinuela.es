from flask import Blueprint, render_template

bp = Blueprint("enablebanking", __name__)


@bp.route("/privacy.html")
def privacy():
    return render_template("apps/enablebanking/privacy.html")


@bp.route("/terms.html")
def terms():
    return render_template("apps/enablebanking/terms.html")
