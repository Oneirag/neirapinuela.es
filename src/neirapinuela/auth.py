from flask import Blueprint, render_template, redirect, url_for, flash, request, session
from flask_login import login_user, logout_user, login_required, current_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length
from flask_babel import _, lazy_gettext as _l
from .models import User
import pyotp
import qrcode
import io
import base64

bp = Blueprint('auth', __name__)


class LoginForm(FlaskForm):
    username = StringField(_l('Username'), validators=[DataRequired()])
    password = PasswordField(_l('Password'), validators=[DataRequired()])
    totp_token = StringField(_l('TOTP Token'), validators=[DataRequired(), Length(min=6, max=6)])
    submit = SubmitField(_l('Sign In'))


class SetupTOTPForm(FlaskForm):
    totp_token = StringField(_l('TOTP Token'), validators=[DataRequired(), Length(min=6, max=6)])
    submit = SubmitField(_l('Verify'))


@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.get_by_username(form.username.data)
        if user and user.check_password(form.password.data):
            if user.totp_secret and user.verify_totp(form.totp_token.data):
                login_user(user)
                next_page = request.args.get('next')
                if not next_page or not next_page.startswith('/'):
                    next_page = url_for('main.index')
                return redirect(next_page)
            elif not user.totp_secret:
                session['setup_user_id'] = user.id
                return redirect(url_for('auth.setup_totp'))
            else:
                flash(_('Invalid TOTP token'), 'error')
        else:
            flash(_('Invalid username or password'), 'error')
    
    return render_template('auth/login.html', form=form)


@bp.route('/setup_totp', methods=['GET', 'POST'])
def setup_totp():
    if 'setup_user_id' not in session:
        return redirect(url_for('auth.login'))
    
    user = User.get(session['setup_user_id'])
    if not user:
        session.pop('setup_user_id', None)
        return redirect(url_for('auth.login'))
    
    if not user.totp_secret:
        user.totp_secret = pyotp.random_base32()
    
    qr_img = qrcode.make(user.get_totp_uri())
    img_buffer = io.BytesIO()
    qr_img.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    qr_code_data = base64.b64encode(img_buffer.getvalue()).decode()
    
    form = SetupTOTPForm()
    if form.validate_on_submit():
        if user.verify_totp(form.totp_token.data):
            login_user(user)
            session.pop('setup_user_id', None)
            flash(_('TOTP setup completed successfully'), 'success')
            return redirect(url_for('main.index'))
        else:
            flash(_('Invalid TOTP token'), 'error')
    
    return render_template('auth/setup_totp.html', 
                         form=form, 
                         qr_code_data=qr_code_data,
                         secret=user.totp_secret)


@bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))