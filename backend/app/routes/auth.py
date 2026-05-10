from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from ..utils.decorators import admin_required as admin_jwt_required
from ..utils.error_handlers import success_response, error_response
from ..services.auth_service import (
    register_user, login_user, login_admin,
    get_user_info, get_admin_info, change_password,
)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not username or not phone or not password:
        return error_response('用户名、手机号和密码为必填项')
    if len(username) < 2:
        return error_response('用户名至少2个字符')
    if len(password) < 6:
        return error_response('密码至少6位')

    result, err = register_user(username, phone, email, password)
    if err:
        return error_response(err)
    return success_response(result, '注册成功', 201)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return error_response('请输入用户名和密码')

    result, err = login_user(username, password)
    if err:
        return error_response(err, 401)
    return success_response(result, '登录成功')


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    from flask_jwt_extended import get_jwt
    claims = get_jwt()
    role = claims.get('role', 'user')
    access_token = create_access_token(identity=identity, additional_claims={'role': role})
    return success_response({'access_token': access_token}, '令牌刷新成功')


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    from flask_jwt_extended import get_jwt
    claims = get_jwt()
    identity = int(get_jwt_identity())

    if claims.get('role') == 'admin':
        user = get_admin_info(identity)
    else:
        user = get_user_info(identity)

    if not user:
        return error_response('用户不存在', 404)
    return success_response(user)


@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_pwd():
    identity = int(get_jwt_identity())
    data = request.get_json() or {}
    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')

    if not old_password or not new_password:
        return error_response('请填写原密码和新密码')
    if len(new_password) < 6:
        return error_response('新密码至少6位')

    ok, err = change_password(identity, old_password, new_password)
    if not ok:
        return error_response(err)
    return success_response(message='密码修改成功')


@auth_bp.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return error_response('请输入管理员账号和密码')

    result, err = login_admin(username, password)
    if err:
        return error_response(err, 401)
    return success_response(result, '登录成功')


@auth_bp.route('/admin/me', methods=['GET'])
@admin_jwt_required
def admin_me():
    identity = int(get_jwt_identity())
    user = get_admin_info(identity)
    if not user:
        return error_response('管理员不存在', 404)
    return success_response(user)
