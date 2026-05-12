from ..extensions import db
from ..models import Order, OrderItem, CartItem, Product


def create_order(user_id, payment_method=None):
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    if not cart_items:
        return None, '购物车为空'

    import time
    order_id = f"ORD{int(time.time() * 1000)}"
    total = 0
    order_items = []

    for ci in cart_items:
        product = ci.product
        if not product or not product.is_active:
            return None, f'商品 "{product.name if product else "未知"}" 已下架'
        if product.stock < ci.quantity:
            return None, f'商品 "{product.name}" 库存不足'

        item_total = float(product.price) * ci.quantity
        total += item_total
        order_items.append(OrderItem(
            product_id=product.id,
            product_name=product.name,
            price=product.price,
            quantity=ci.quantity,
            image=product.image,
        ))

        product.stock -= ci.quantity
        product.sales += ci.quantity

    order = Order(
        id=order_id,
        user_id=user_id,
        total_amount=total,
        status='pending',
        payment_method=payment_method,
    )
    order.items = order_items

    CartItem.query.filter_by(user_id=user_id).delete()

    db.session.add(order)
    db.session.commit()

    return order.to_dict(), None
