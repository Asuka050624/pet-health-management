from flask import Blueprint, request
from ..extensions import db
from ..models import Message
from ..utils.decorators import jwt_required, get_current_user_id
from ..utils.error_handlers import success_response, error_response, paginated_response

messages_bp = Blueprint('messages', __name__, url_prefix='/api/messages')


@messages_bp.route('', methods=['GET'])
@jwt_required
def list_messages():
    user_id = get_current_user_id()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    pagination = Message.query.filter_by(user_id=user_id).order_by(
        Message.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    items = [m.to_dict() for m in pagination.items]
    unread_count = Message.query.filter_by(user_id=user_id, is_read=False).count()
    return paginated_response({
        'items': items,
        'unread_count': unread_count,
    }, page, per_page, pagination.total)


@messages_bp.route('/<int:msg_id>/read', methods=['PUT'])
@jwt_required
def mark_read(msg_id):
    msg = Message.query.filter_by(id=msg_id, user_id=get_current_user_id()).first()
    if not msg:
        return error_response('消息不存在', 404)
    msg.is_read = True
    db.session.commit()
    return success_response(message='已标记为已读')
