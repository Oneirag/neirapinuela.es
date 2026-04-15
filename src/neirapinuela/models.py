from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash
import pyotp
import os


class User(UserMixin):
    def __init__(self, id, username, groups=None):
        self.id = id
        self.username = username
        self.groups = groups or []
    
    def get_role(self):
        from flask import current_app
        family = current_app.config.get('FAMILY_MEMBERS', {})
        if self.username in family:
            return family[self.username].get('role', '')
        return ''

    def get_color(self):
        from flask import current_app
        family = current_app.config.get('FAMILY_MEMBERS', {})
        if self.username in family:
            return family[self.username].get('color', '#6c757d')
        return '#6c757d'
    
    @staticmethod
    def get(user_id):
        # In OIDC, we can use the username or sub as ID
        # Since we don't have a DB, we'll just reconstruct the user
        # This is called by flask-login's user_loader if using session
        # But we'll mostly use the one from the token
        if not user_id:
            return None
        
        # We might want to store groups in session to avoid fetching every time
        # For now, let's assume session stores minimal info
        from flask import session
        groups = session.get('user_groups', [])
        return User(id=user_id, username=user_id, groups=groups)

    @staticmethod
    def get_by_username(username, groups=None):
        return User(id=username, username=username, groups=groups)