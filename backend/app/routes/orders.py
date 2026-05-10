from flask import Blueprint, request
from ..extensions import db
from ..models import Order, Product
from ..utils.decorators import jwt_required, get_current_user_id
from ..utils.error_handlers import success_response, error_response, paginated_response
from ..services.order_service import create_order as create_order_svc

orders_bp = Blueprint('orders', __name__, url_prefix='/api/orders')


@orders_bp.route('', methods=['GET'])
@jwt_required
def list_orders():
    user_id = get_current_user_id()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    pagination = Order.query.filter_by(user_id=user_id).order_by(
        Order.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    items = [o.to_dict() for o in pagination.items]
    return paginated_response(items, page, per_page, pagination.total)


@orders_bp.route('', methods=['POST'])
@jwt_required
def create_order():
    user_id = get_current_user_id()
    data = request.get_json() or {}
    payment_method = data.get('payment_method', None)

    result, err = create_order_svc(user_id, payment_method)
    if err:
        return error_response(err)
    return success_response(result, '下单成功', 201)


@orders_bp.route('/<order_id>', methods=['GET'])
@jwt_required
def get_order(order_id):
    order = Order.query.filter_by(id=order_id, user_id=get_current_user_id()).first()
    if not order:
        return error_response('订单不存在', 404)
    return success_response(order.to_dict())


@orders_bp.route('/<order_id>/cancel', methods=['PUT'])
@jwt_required
def cancel_order(order_id):
    order = Order.query.filter_by(id=order_id, user_id=get_current_user_id()).first()
    if not order:
        return error_response('订单不存在', 404)
    if order.status != 'pending':
        return error_response('仅可取消待付款订单')

    order.status = 'cancelled'
    for item in order.items:
        product = db.session.get(Product, item.product_id)
        if product:
            product.stock += item.quantity

    db.session.commit()
    return success_response(message='订单已取消')
