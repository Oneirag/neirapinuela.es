from datetime import datetime

from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash
import pyotp
import os

from .db import db


class User(UserMixin):
    def __init__(self, id, username, groups=None):
        self.id = id
        self.username = username
        self.groups = groups or []

    def get_role(self):
        from flask import current_app

        family = current_app.config.get("FAMILY_MEMBERS", {})
        if self.username in family:
            return family[self.username].get("role", "")
        return ""

    def get_color(self):
        from flask import current_app

        family = current_app.config.get("FAMILY_MEMBERS", {})
        if self.username in family:
            return family[self.username].get("color", "#6c757d")
        return "#6c757d"

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

        groups = session.get("user_groups", [])
        return User(id=user_id, username=user_id, groups=groups)

    @staticmethod
    def get_by_username(username, groups=None):
        return User(id=username, username=username, groups=groups)


class TypingCompletion(db.Model):
    __tablename__ = "typing_completion"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, index=True)
    lesson_index = db.Column(db.Integer, nullable=False)
    wpm = db.Column(db.Integer, default=0)
    accuracy = db.Column(db.Float, default=0.0)
    errors = db.Column(db.Integer, default=0)
    time_seconds = db.Column(db.Float, default=0.0)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.Index("ix_typing_user_lesson", "username", "lesson_index"),)

    def __repr__(self):
        return (
            f"<TypingCompletion {self.username} L{self.lesson_index} "
            f"{self.wpm}wpm {self.accuracy}%>"
        )


class TypingAchievement(db.Model):
    __tablename__ = "typing_achievement"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, index=True)
    achievement_id = db.Column(db.String(50), nullable=False)
    unlocked_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint(
            "username", "achievement_id", name="uq_typing_user_achievement"
        ),
    )

    def __repr__(self):
        return f"<TypingAchievement {self.username} {self.achievement_id}>"
