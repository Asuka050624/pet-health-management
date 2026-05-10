from flask import Blueprint, request
from ..extensions import db
from ..models import User, Pet, Product, Order, Reservation, Feedback, News, Message
from ..utils.decorators import admin_required
from ..utils.error_handlers import success_response, error_response, paginated_response

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


def paginate_query(query, order_by=None):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 15, type=int)
    if order_by is not None:
        query = query.order_by(order_by)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return pagination, page, per_page


# Dashboard stats
@admin_bp.route('/dashboard/stats', methods=['GET'])
@admin_required
def dashboard_stats():
    today = db.func.date(db.func.now())
    return success_response({
        'total_users': User.query.count(),
        'total_pets': Pet.query.count(),
        'total_products': Product.query.count(),
        'total_orders': Order.query.count(),
        'total_reservations': Reservation.query.count(),
        'total_news': News.query.count(),
        'pending_reservations': Reservation.query.filter_by(status='pending').count(),
        'pending_orders': Order.query.filter(Order.status.in_(['pending', 'paid'])).count(),
        'unread_feedback': Feedback.query.filter_by(status='pending').count(),
        'today_reservations': Reservation.query.filter(
            Reservation.appointment_date == today,
            Reservation.status != 'cancelled'
        ).count(),
    })


# Users
@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    keyword = request.args.get('keyword')
    query = User.query
    if keyword:
        query = query.filter(User.username.contains(keyword) | User.phone.contains(keyword))
    pagination, page, per_page = paginate_query(query, User.created_at.desc())
    return paginated_response([u.to_dict() for u in pagination.items], page, per_page, pagination.total)


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return error_response('用户不存在', 404)
    return success_response(user.to_dict())


# Pets
@admin_bp.route('/pets', methods=['GET'])
@admin_required
def list_all_pets():
    pagination, page, per_page = paginate_query(Pet.query, Pet.created_at.desc())
    return paginated_response([p.to_dict() for p in pagination.items], page, per_page, pagination.total)


# Products admin CRUD
@admin_bp.route('/products', methods=['GET'])
@admin_required
def list_products():
    pagination, page, per_page = paginate_query(Product.query, Product.created_at.desc())
    return paginated_response([p.to_dict() for p in pagination.items], page, per_page, pagination.total)


@admin_bp.route('/products', methods=['POST'])
@admin_required
def create_product():
    data = request.get_json() or {}
    if not data.get('name') or not data.get('price'):
        return error_response('商品名称和价格为必填项')

    product = Product(
        name=data['name'],
        category=data.get('category', '食品'),
        price=data['price'],
        original_price=data.get('original_price'),
        description=data.get('description'),
        image=data.get('image'),
        stock=data.get('stock', 0),
    )
    db.session.add(product)
    db.session.commit()
    return success_response(product.to_dict(), '商品已添加', 201)


@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return error_response('商品不存在', 404)

    data = request.get_json() or {}
    for field in ['name', 'category', 'price', 'original_price', 'description', 'image', 'stock', 'is_active']:
        if field in data:
            setattr(product, field, data[field])

    db.session.commit()
    return success_response(product.to_dict(), '商品已更新')


@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return error_response('商品不存在', 404)
    product.is_active = False
    db.session.commit()
    return success_response(message='商品已下架')


# Orders
@admin_bp.route('/orders', methods=['GET'])
@admin_required
def list_orders():
    status = request.args.get('status')
    query = Order.query
    if status:
        query = query.filter_by(status=status)
    pagination, page, per_page = paginate_query(query, Order.created_at.desc())
    return paginated_response([o.to_dict() for o in pagination.items], page, per_page, pagination.total)


@admin_bp.route('/orders/<order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        return error_response('订单不存在', 404)

    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status not in ('pending', 'paid', 'shipped', 'delivered', 'cancelled'):
        return error_response('无效的订单状态')

    order.status = new_status
    db.session.commit()
    return success_response(order.to_dict(), '订单状态已更新')


# Reservations
@admin_bp.route('/reservations', methods=['GET'])
@admin_required
def list_reservations():
    status = request.args.get('status')
    query = Reservation.query
    if status:
        query = query.filter_by(status=status)
    pagination, page, per_page = paginate_query(query, Reservation.created_at.desc())
    return paginated_response([r.to_dict() for r in pagination.items], page, per_page, pagination.total)


@admin_bp.route('/reservations/<res_id>/status', methods=['PUT'])
@admin_required
def update_reservation_status(res_id):
    reservation = db.session.get(Reservation, res_id)
    if not reservation:
        return error_response('预约不存在', 404)

    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status not in ('pending', 'confirmed', 'completed', 'cancelled'):
        return error_response('无效的预约状态')

    reservation.status = new_status
    db.session.commit()
    return success_response(reservation.to_dict(), '预约状态已更新')


# Feedbacks
@admin_bp.route('/feedbacks', methods=['GET'])
@admin_required
def list_feedbacks():
    status = request.args.get('status')
    query = Feedback.query
    if status:
        query = query.filter_by(status=status)
    pagination, page, per_page = paginate_query(query, Feedback.created_at.desc())
    return paginated_response([f.to_dict() for f in pagination.items], page, per_page, pagination.total)


@admin_bp.route('/feedbacks/<fb_id>/reply', methods=['PUT'])
@admin_required
def reply_feedback(fb_id):
    feedback = db.session.get(Feedback, fb_id)
    if not feedback:
        return error_response('反馈不存在', 404)

    data = request.get_json() or {}
    reply = data.get('reply', '').strip()
    if not reply:
        return error_response('请输入回复内容')

    feedback.reply = reply
    feedback.status = 'replied'
    from flask_jwt_extended import get_jwt_identity
    feedback.replied_by = int(get_jwt_identity())

    db.session.commit()
    return success_response(feedback.to_dict(), '回复成功')


# News admin CRUD
@admin_bp.route('/news', methods=['GET'])
@admin_required
def list_news():
    pagination, page, per_page = paginate_query(News.query, News.created_at.desc())
    return paginated_response(
        [n.to_dict(include_content=True) for n in pagination.items],
        page, per_page, pagination.total
    )


@admin_bp.route('/news', methods=['POST'])
@admin_required
def create_news():
    data = request.get_json() or {}
    if not data.get('title') or not data.get('content'):
        return error_response('标题和内容为必填项')

    news = News(
        title=data['title'],
        category=data.get('category', '疾病预防'),
        summary=data.get('summary'),
        content=data['content'],
        cover_image=data.get('cover_image'),
        author=data.get('author'),
        is_published=data.get('is_published', False),
        published_at=db.func.now() if data.get('is_published') else None,
    )
    db.session.add(news)
    db.session.commit()
    return success_response(news.to_dict(include_content=True), '资讯已创建', 201)


@admin_bp.route('/news/<int:news_id>', methods=['PUT'])
@admin_required
def update_news(news_id):
    news = db.session.get(News, news_id)
    if not news:
        return error_response('资讯不存在', 404)

    data = request.get_json() or {}
    for field in ['title', 'category', 'summary', 'content', 'cover_image', 'author', 'is_published']:
        if field in data:
            setattr(news, field, data[field])

    if data.get('is_published') and not news.published_at:
        news.published_at = db.func.now()

    db.session.commit()
    return success_response(news.to_dict(include_content=True), '资讯已更新')


@admin_bp.route('/news/<int:news_id>', methods=['DELETE'])
@admin_required
def delete_news(news_id):
    news = db.session.get(News, news_id)
    if not news:
        return error_response('资讯不存在', 404)
    db.session.delete(news)
    db.session.commit()
    return success_response(message='资讯已删除')
