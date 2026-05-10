from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from .error_handlers import error_response


def jwt_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get('role') == 'admin':
            return error_response('请使用用户账号操作', 403)
        return fn(*args, **kwargs)
    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return error_response('需要管理员权限', 403)
        return fn(*args, **kwargs)
    return wrapper


def optional_jwt(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request(optional=True)
        except Exception:
            pass
        return fn(*args, **kwargs)
    return wrapper


def get_current_user_id():
    from flask_jwt_extended import get_jwt_identity
    identity = get_jwt_identity()
    if identity:
        return int(identity)
    return None
