from flask import Blueprint, redirect, url_for, session, request, flash
from flask_login import login_user, logout_user, login_required, current_user
from . import oauth
from .models import User
from flask_babel import _

bp = Blueprint('auth', __name__)


@bp.route('/login')
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    redirect_uri = url_for('auth.callback', _external=True)
    # Match the exact redirect_uri in Authelia: https://www.neirapinuela.es/oauth/callback/
    if 'neirapinuela.es' in redirect_uri and 'www.' not in redirect_uri:
        redirect_uri = redirect_uri.replace('neirapinuela.es', 'www.neirapinuela.es')
    
    # Ensure HTTPS in production
    if redirect_uri.startswith('http://') and 'neirapinuela.es' in redirect_uri:
        redirect_uri = redirect_uri.replace('http://', 'https://')
        
    next_page = request.args.get('next')
    if next_page:
        session['next_page'] = next_page
        
    return oauth.authelia.authorize_redirect(redirect_uri)


@bp.route('/callback/')
def callback():
    try:
        token = oauth.authelia.authorize_access_token()
        userinfo = token.get('userinfo')
        if userinfo:
            # Prioritize real name over username as requested
            username = userinfo.get('name') or userinfo.get('preferred_username') or userinfo.get('nickname') or userinfo.get('sub')
            groups = userinfo.get('groups', [])
            
            user = User.get_by_username(username, groups=groups)
            login_user(user)
            
            # Store groups in session so they are available in user_loader
            session['user_groups'] = groups
            
            next_page = session.pop('next_page', None) or url_for('main.index')
            flash(_('Successfully logged in'), 'success')
            return redirect(next_page)
    except Exception as e:
        flash(_('Authentication failed'), 'error')
        
    return redirect(url_for('main.index'))


@bp.route('/logout')
@login_required
def logout():
    logout_user()
    session.clear()
    
    # Redirect to OIDC logout
    from flask import current_app
    logout_url = current_app.config.get('AUTH_OIDC_LOGOUT_URL')
    if logout_url:
        return redirect(f"{logout_url.rstrip('/')}/?rd={url_for('main.index', _external=True)}")
    
    # Fallback if not configured
    auth_issuer = current_app.config.get('AUTH_OIDC_ISSUER', 'https://auth.neirapinuela.es').rstrip('/')
    return redirect(f"{auth_issuer}/logout?rd={url_for('main.index', _external=True)}")