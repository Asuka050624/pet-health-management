import datetime
from ..extensions import db


class News(db.Model):
    __tablename__ = 'news'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(20), nullable=False)
    summary = db.Column(db.String(500), nullable=True)
    content = db.Column(db.Text, nullable=False)
    cover_image = db.Column(db.String(500), nullable=True)
    author = db.Column(db.String(50), nullable=True)
    view_count = db.Column(db.Integer, default=0)
    is_published = db.Column(db.Boolean, default=False)
    published_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)

    comments = db.relationship('NewsComment', backref='news', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_content=False):
        data = {
            'id': self.id,
            'title': self.title,
            'category': self.category,
            'summary': self.summary,
            'cover_image': self.cover_image,
            'author': self.author,
            'view_count': self.view_count,
            'comment_count': self.comments.count(),
            'is_published': self.is_published,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_content:
            data['content'] = self.content
        return data


class NewsComment(db.Model):
    __tablename__ = 'news_comments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    news_id = db.Column(db.Integer, db.ForeignKey('news.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)

    def to_dict(self):
        return {
            'id': self.id,
            'news_id': self.news_id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else '',
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
