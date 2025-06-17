from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash
import pyotp
import os


class User(UserMixin):
    def __init__(self, id, username, password_hash, totp_secret=None, is_active=True):
        self.id = id
        self.username = username
        self.password_hash = password_hash
        self.totp_secret = totp_secret
        self.is_active = is_active
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def verify_totp(self, token):
        if not self.totp_secret:
            return False
        totp = pyotp.TOTP(self.totp_secret)
        return totp.verify(token)
    
    def get_totp_uri(self, issuer_name='neirapinuela.es'):
        if not self.totp_secret:
            return None
        totp = pyotp.TOTP(self.totp_secret)
        return totp.provisioning_uri(
            name=self.username,
            issuer_name=issuer_name
        )
    
    @staticmethod
    def get(user_id):
        users = {
            '1': User(
                id='1',
                username='oscar',
                password_hash=generate_password_hash(os.environ.get('OSCAR_PASSWORD', 'change_me')),
                totp_secret=os.environ.get('OSCAR_TOTP_SECRET')
            ),
            '2': User(
                id='2',
                username='eva',
                password_hash=generate_password_hash(os.environ.get('EVA_PASSWORD', 'change_me')),
                totp_secret=os.environ.get('EVA_TOTP_SECRET')
            )
        }
        return users.get(user_id)
    
    @staticmethod
    def get_by_username(username):
        users = {
            'oscar': User.get('1'),
            'eva': User.get('2')
        }
        return users.get(username)