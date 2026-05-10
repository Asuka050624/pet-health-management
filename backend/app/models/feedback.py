import datetime
from ..extensions import db


class Feedback(db.Model):
    __tablename__ = 'feedbacks'

    id = db.Column(db.String(20), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.Enum('suggestion', 'bug', 'compliment', 'other'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    contact = db.Column(db.String(100), nullable=True)
    status = db.Column(db.Enum('pending', 'processing', 'replied', 'closed'), default='pending')
    reply = db.Column(db.Text, nullable=True)
    replied_by = db.Column(db.Integer, db.ForeignKey('admins.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)

    replier = db.relationship('Admin', lazy='joined', foreign_keys=[replied_by])

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else '',
            'type': self.type,
            'content': self.content,
            'contact': self.contact,
            'status': self.status,
            'reply': self.reply,
            'replied_by': self.replied_by,
            'replier_name': self.replier.username if self.replier else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
