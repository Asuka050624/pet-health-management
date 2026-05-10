from flask import Blueprint, request
from ..extensions import db
from ..models import News, NewsComment
from ..utils.decorators import jwt_required, optional_jwt, get_current_user_id
from ..utils.error_handlers import success_response, error_response, paginated_response

news_bp = Blueprint('news', __name__, url_prefix='/api/news')


@news_bp.route('', methods=['GET'])
def list_news():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category = request.args.get('category')

    query = News.query.filter_by(is_published=True)
    if category:
        query = query.filter_by(category=category)

    pagination = query.order_by(News.published_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    items = [n.to_dict() for n in pagination.items]
    return paginated_response(items, page, per_page, pagination.total)


@news_bp.route('/<int:news_id>', methods=['GET'])
def get_news(news_id):
    news = db.session.get(News, news_id)
    if not news or not news.is_published:
        return error_response('资讯不存在', 404)

    news.view_count = (news.view_count or 0) + 1
    db.session.commit()

    data = news.to_dict(include_content=True)
    comments = NewsComment.query.filter_by(news_id=news_id).order_by(
        NewsComment.created_at.desc()
    ).limit(50).all()
    data['comments'] = [c.to_dict() for c in comments]
    return success_response(data)


@news_bp.route('/<int:news_id>/comments', methods=['GET'])
def list_comments(news_id):
    comments = NewsComment.query.filter_by(news_id=news_id).order_by(
        NewsComment.created_at.desc()
    ).limit(50).all()
    return success_response([c.to_dict() for c in comments])


@news_bp.route('/<int:news_id>/comments', methods=['POST'])
@jwt_required
def add_comment(news_id):
    user_id = get_current_user_id()
    news = db.session.get(News, news_id)
    if not news or not news.is_published:
        return error_response('资讯不存在', 404)

    data = request.get_json() or {}
    content = data.get('content', '').strip()
    if not content:
        return error_response('请输入评论内容')

    comment = NewsComment(news_id=news_id, user_id=user_id, content=content)
    db.session.add(comment)
    db.session.commit()
    return success_response(comment.to_dict(), '评论成功', 201)
