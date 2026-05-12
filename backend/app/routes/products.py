from flask import Blueprint, request
from ..extensions import db
from ..models import Product
from ..utils.error_handlers import success_response, error_response, paginated_response

products_bp = Blueprint('products', __name__, url_prefix='/api/products')


@products_bp.route('', methods=['GET'])
def list_products():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category = request.args.get('category')
    keyword = request.args.get('keyword') or request.args.get('search')

    query = Product.query.filter_by(is_active=True)
    if category:
        query = query.filter_by(category=category)
    if keyword:
        query = query.filter(Product.name.contains(keyword) | Product.description.contains(keyword))

    pagination = query.order_by(Product.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    items = [p.to_dict() for p in pagination.items]
    return paginated_response(items, page, per_page, pagination.total)


@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = db.session.get(Product, product_id)
    if not product or not product.is_active:
        return error_response('商品不存在', 404)
    return success_response(product.to_dict())
