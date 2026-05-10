from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity
from ..extensions import db
from ..models import User
from ..utils.decorators import jwt_required, get_current_user_id
from ..utils.error_handlers import success_response, error_response

users_bp = Blueprint('users', __name__, url_prefix='/api/users')


@users_bp.route('/profile', methods=['GET'])
@jwt_required
def get_profile():
    user = db.session.get(User, get_current_user_id())
    if not user:
        return error_response('用户不存在', 404)
    return success_response(user.to_dict())


@users_bp.route('/profile', methods=['PUT'])
@jwt_required
def update_profile():
    user = db.session.get(User, get_current_user_id())
    if not user:
        return error_response('用户不存在', 404)

    data = request.get_json() or {}
    if 'email' in data:
        user.email = data['email'] or None
    if 'phone' in data:
        existing = User.query.filter(User.phone == data['phone'], User.id != user.id).first()
        if existing:
            return error_response('手机号已被使用')
        user.phone = data['phone']

    db.session.commit()
    return success_response(user.to_dict(), '个人信息已更新')
