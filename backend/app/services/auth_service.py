from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token
from ..extensions import db
from ..models import User, Admin


def register_user(username, phone, email, password):
    if User.query.filter((User.username == username) | (User.phone == phone)).first():
        return None, '用户名或手机号已存在'
    if email and User.query.filter_by(email=email).first():
        return None, '邮箱已被注册'

    user = User(
        username=username,
        phone=phone,
        email=email or None,
        password_hash=generate_password_hash(password),
    )
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id), additional_claims={'role': 'user'})
    refresh_token = create_refresh_token(identity=str(user.id), additional_claims={'role': 'user'})

    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {**user.to_dict(), 'role': 'user'},
    }, None


def login_user(username, password):
    user = User.query.filter(
        (User.username == username) | (User.phone == username) | (User.email == username)
    ).first()
    if not user or not check_password_hash(user.password_hash, password):
        return None, '用户名或密码错误'

    access_token = create_access_token(identity=str(user.id), additional_claims={'role': 'user'})
    refresh_token = create_refresh_token(identity=str(user.id), additional_claims={'role': 'user'})

    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {**user.to_dict(), 'role': 'user'},
    }, None


def login_admin(username, password):
    admin = Admin.query.filter_by(username=username).first()
    if not admin or not check_password_hash(admin.password_hash, password):
        return None, '管理员账号或密码错误'
    if not admin.is_active:
        return None, '管理员账号已被禁用'

    admin.last_login_at = db.func.now()
    db.session.commit()

    access_token = create_access_token(identity=str(admin.id), additional_claims={'role': 'admin'})
    refresh_token = create_refresh_token(identity=str(admin.id), additional_claims={'role': 'admin'})

    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {**admin.to_dict(), 'role': 'admin'},
    }, None


def get_user_info(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return None
    return {**user.to_dict(), 'role': 'user'}


def get_admin_info(admin_id):
    admin = db.session.get(Admin, admin_id)
    if not admin:
        return None
    return {**admin.to_dict(), 'role': 'admin'}


def change_password(user_id, old_password, new_password):
    user = db.session.get(User, user_id)
    if not user:
        return False, '用户不存在'
    if not check_password_hash(user.password_hash, old_password):
        return False, '原密码错误'
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return True, None
