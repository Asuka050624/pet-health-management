import os
import uuid
from flask import Blueprint, request, current_app
from werkzeug.utils import secure_filename
from ..utils.decorators import jwt_required, admin_required, get_current_user_id
from ..utils.error_handlers import success_response, error_response
from ..extensions import db
from ..models import User, Pet, Product, News

upload_bp = Blueprint('upload', __name__, url_prefix='/api/upload')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_uploaded_file(file, subfolder):
    upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder)
    os.makedirs(upload_folder, exist_ok=True)

    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)

    return f"/uploads/{subfolder}/{filename}"


@upload_bp.route('/avatar', methods=['POST'])
@jwt_required
def upload_avatar():
    if 'file' not in request.files:
        return error_response('请选择文件')
    file = request.files['file']
    if not file.filename:
        return error_response('请选择文件')
    if not allowed_file(file.filename):
        return error_response('仅支持 PNG、JPG、GIF、WebP 格式')

    url = save_uploaded_file(file, 'avatars')
    user = db.session.get(User, get_current_user_id())
    if user:
        user.avatar = url
        db.session.commit()

    return success_response({'url': url}, '头像上传成功')


@upload_bp.route('/pet', methods=['POST'])
@jwt_required
def upload_pet_image():
    if 'file' not in request.files:
        return error_response('请选择文件')
    file = request.files['file']
    if not file.filename:
        return error_response('请选择文件')
    if not allowed_file(file.filename):
        return error_response('仅支持 PNG、JPG、GIF、WebP 格式')

    url = save_uploaded_file(file, 'pets')
    return success_response({'url': url}, '图片上传成功')


@upload_bp.route('/product', methods=['POST'])
@admin_required
def upload_product_image():
    if 'file' not in request.files:
        return error_response('请选择文件')
    file = request.files['file']
    if not file.filename:
        return error_response('请选择文件')
    if not allowed_file(file.filename):
        return error_response('仅支持 PNG、JPG、GIF、WebP 格式')

    url = save_uploaded_file(file, 'products')
    return success_response({'url': url}, '图片上传成功')


@upload_bp.route('/news', methods=['POST'])
@admin_required
def upload_news_image():
    if 'file' not in request.files:
        return error_response('请选择文件')
    file = request.files['file']
    if not file.filename:
        return error_response('请选择文件')
    if not allowed_file(file.filename):
        return error_response('仅支持 PNG、JPG、GIF、WebP 格式')

    url = save_uploaded_file(file, 'news')
    return success_response({'url': url}, '图片上传成功')
