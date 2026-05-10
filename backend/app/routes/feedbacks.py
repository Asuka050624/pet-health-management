from flask import Blueprint, request
from ..extensions import db
from ..models import Feedback
from ..utils.decorators import jwt_required, get_current_user_id
from ..utils.error_handlers import success_response, error_response, paginated_response

feedbacks_bp = Blueprint('feedbacks', __name__, url_prefix='/api/feedbacks')


@feedbacks_bp.route('', methods=['GET'])
@jwt_required
def list_feedbacks():
    user_id = get_current_user_id()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    pagination = Feedback.query.filter_by(user_id=user_id).order_by(
        Feedback.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    items = [f.to_dict() for f in pagination.items]
    return paginated_response(items, page, per_page, pagination.total)


@feedbacks_bp.route('', methods=['POST'])
@jwt_required
def create_feedback():
    user_id = get_current_user_id()
    data = request.get_json() or {}

    if not data.get('content'):
        return error_response('请填写反馈内容')

    fb_id = f"FB{int(db.func.unix_timestamp(db.func.now()) * 1000)}"
    feedback = Feedback(
        id=fb_id,
        user_id=user_id,
        type=data.get('type', 'suggestion'),
        content=data['content'],
        contact=data.get('contact'),
    )
    db.session.add(feedback)
    db.session.commit()
    return success_response(feedback.to_dict(), '反馈已提交', 201)
