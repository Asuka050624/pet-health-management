from flask import Blueprint, request
from ..extensions import db
from ..models import CartItem, Product
from ..utils.decorators import jwt_required, get_current_user_id
from ..utils.error_handlers import success_response, error_response

cart_bp = Blueprint('cart', __name__, url_prefix='/api/cart')


@cart_bp.route('', methods=['GET'])
@jwt_required
def get_cart():
    user_id = get_current_user_id()
    items = CartItem.query.filter_by(user_id=user_id).order_by(CartItem.created_at.desc()).all()
    return success_response([item.to_dict() for item in items])


@cart_bp.route('', methods=['POST'])
@jwt_required
def add_to_cart():
    user_id = get_current_user_id()
    data = request.get_json() or {}
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)

    if not product_id:
        return error_response('缺少商品ID')

    product = db.session.get(Product, product_id)
    if not product or not product.is_active:
        return error_response('商品不存在', 404)

    existing = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()
    if existing:
        existing.quantity += quantity
    else:
        existing = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
        db.session.add(existing)

    db.session.commit()
    return success_response(existing.to_dict(), '已加入购物车', 201)


@cart_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required
def update_cart_item(product_id):
    user_id = get_current_user_id()
    data = request.get_json() or {}
    quantity = data.get('quantity', 1)

    item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()
    if not item:
        return error_response('购物车中不存在该商品', 404)

    item.quantity = max(1, quantity)
    db.session.commit()
    return success_response(item.to_dict(), '数量已更新')


@cart_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required
def remove_from_cart(product_id):
    user_id = get_current_user_id()
    item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()
    if not item:
        return error_response('购物车中不存在该商品', 404)

    db.session.delete(item)
    db.session.commit()
    return success_response(message='已从购物车移除')
