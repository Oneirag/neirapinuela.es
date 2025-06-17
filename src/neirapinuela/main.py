from flask import Blueprint, render_template, session, redirect, url_for, request
from flask_babel import _, get_locale
from flask_login import current_user

bp = Blueprint('main', __name__)


@bp.route('/')
def index():
    return render_template('index.html')


@bp.route('/set_language/<language>')
def set_language(language):
    if language in ['es', 'en']:
        session['language'] = language
    return redirect(request.referrer or url_for('main.index'))


@bp.route('/about')
def about():
    return render_template('about.html')


@bp.route('/family')
def family():
    return render_template('family.html')


