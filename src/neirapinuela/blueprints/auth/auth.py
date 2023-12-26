from typing import Union

from flask import Blueprint, render_template, abort, request, redirect, g, make_response, flash
import flask_login

import pam
import secrets
import os
import time

from wtforms import Form, HiddenField, StringField, PasswordField
from wtforms.validators import DataRequired
from flask import session
from wtforms.csrf.session import SessionCSRF

login_manager = flask_login.LoginManager()
login_manager.session_protection = "strong"
login_manager.login_view = "auth.login"

auth = Blueprint('auth', __name__,
                 subdomain="<app>",
                 template_folder='templates')
auth.csrf_secret_key = secrets.token_bytes(32)


@auth.record_once
def on_load(state):
    login_manager.init_app(state.app)
    state.app.config['CSRF_SECRET_KEY'] = state.blueprint.csrf_secret_key
    state.app.config['I18N_TRANSLATION_FILES'] += [os.path.join(os.path.dirname(__file__), "i18n_translations.yaml")]


class LoginForm(Form):
    class Meta:
        csrf = True
        csrf_class = SessionCSRF
        csrf_secret = auth.csrf_secret_key

        @property
        def csrf_context(self):
            return session

    username = StringField('User', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    mfa_code = PasswordField('Code', render_kw=dict(autocomplete="off"), validators=[DataRequired()])
    target = HiddenField('Target', validators=[DataRequired()])


db_users = dict()


class User(flask_login.UserMixin):
    def __init__(self):
        super().__init__()
        self.timestamp = time.time()

    def valid(self):
        """Returns True if authenticated and active, and authenticated for less than a certain period"""
        res = super().is_active()
        if not res:
            return res
        else:
            return time.time() - self.timestamp > 30


@login_manager.user_loader
def user_loader(email):
    return db_users.get(email)


@login_manager.request_loader
def request_loader(request):
    email = request.form.get('email')
    return user_loader(email)


def do_logout():
    db_users.pop(flask_login.current_user.id)
    flask_login.logout_user()


def make_js_response(msg: str, http_code=200, **kwargs):
    return dict(msg=msg, http_code=http_code, ok=http_code <= 310, **kwargs), http_code


def login_json(app, url):
    if not request.data or request.method.upper() == "GET":
        target = request.headers.get('X-Original-URI', request.args.get("next", "/"))
        form = LoginForm(target=target)
        form.csrf_token.data = form.csrf_token.current_token
        return make_js_response(msg="Invalid auth", http_code=407, url=url, form=dict(form.data.items()))
    else:
        form = LoginForm(data=request.json)
        resp = authenticate(login_form=form)
        if resp is not None:
            return make_js_response(msg="Log in correct", http_code=200)
        else:
            return make_js_response(msg="Invalid user/pwd", http_code=407, **dict(form.data.items()))


def authenticate(login_form: LoginForm):
    """If correctly authenticated, returns Response instance redirecting to target, otherwise returns None"""
    if not login_form.validate():
        return None
    email = login_form.username.data
    password = login_form.password.data
    mfa_code = login_form.mfa_code.data
    if mfa_code:
        # Comment the next line to disable MFA. In order to work with users different to current one must be run as root
        password = password + mfa_code
        kwargs = dict(service="web")
        # For service to work, a web file must be created in /etc/pam.d/ with the following contents:
        """
        auth requisite pam_google_authenticator.so forward_pass
        auth required pam_unix.so use_first_pass  
        account required pam_unix.so audit
        account required pam_permit.so
        """
    else:
        kwargs = dict()
    if email is None or password is None:
        return None
    if pam.authenticate(email, password, **kwargs) and email != "root":
        user = User()
        user.id = email
        db_users[email] = user
        flask_login.login_user(user)
        redirect_target = request.headers.get("Origin", "") + login_form.target.data
        resp = make_response(redirect(redirect_target))
        # Set headers that will be received by the service for this request
        resp.headers['REMOTE_USER'] = user.id
        resp.headers['X-WEBAUTH-USER'] = user.id
        resp.headers['X-Forwarded-User'] = user.id
        return resp
    else:
        return None


def login_html(app):
    if request.method == 'GET':
        target = request.headers.get('X-Original-URI', request.args.get("next", "/"))
    else:
        login_form = LoginForm(request.form)
        resp = authenticate(login_form)
        if resp is not None:
            return resp
        else:
            flash(g.auth_login_invalid_login, "danger")
            target = login_form.target._value()
    form = LoginForm(target=target)
    # Translate fields
    form.username.label = g.auth_login_username
    form.password.label = g.auth_login_password
    form.mfa_code.label = g.auth_login_mfa_code
    return render_template("login.html", form=form, app=app)


@auth.route("/<lang_code>/login", methods=['GET', 'POST'])
def login(app):
    if request.content_type and request.content_type.startswith("application/json"):
        # Check ff user is already logged in. If so, it is not flask who is raising the error,
        # then the error comes from a proxied process: reraise it
        if flask_login.current_user.is_active:
            return make_js_response("Internal process authentication error", 401)
        return login_json(app, request.path)
    else:
        return login_html(app)


@auth.route("/auth")
def nginx_auth(app):
    if flask_login.current_user.is_active:
        resp = make_response()
        resp.headers['REMOTE_USER'] = flask_login.current_user.get_id()
        resp.headers['X-WEBAUTH-USER'] = flask_login.current_user.get_id()
        return resp
    else:
        if flask_login.current_user.is_authenticated:
            do_logout()  # Authenticated but not active ... do logout
        return abort(401)


@auth.route("/<lang_code>/test_auth")
def private(app):
    return "Esto es privado!" + str(request.headers)


@auth.route('/<lang_code>/logout')
def logout(app):
    redirect_url = f"https://www.neirapinuela.es/{g.lang_code}/"
    if flask_login.current_user.is_authenticated:
        do_logout()
        return render_template("logout.html", redirect=redirect_url)
    else:
        return redirect(redirect_url)
