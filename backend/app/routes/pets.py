from flask import Blueprint, request
from ..extensions import db
from ..models import Pet
from ..utils.decorators import jwt_required, get_current_user_id
from ..utils.error_handlers import success_response, error_response, paginated_response

pets_bp = Blueprint('pets', __name__, url_prefix='/api/pets')


@pets_bp.route('', methods=['GET'])
@jwt_required
def list_pets():
    user_id = get_current_user_id()
    pets = Pet.query.filter_by(user_id=user_id).order_by(Pet.created_at.desc()).all()
    return success_response([p.to_dict() for p in pets])


@pets_bp.route('', methods=['POST'])
@jwt_required
def create_pet():
    user_id = get_current_user_id()
    data = request.get_json() or {}

    if not data.get('name'):
        return error_response('宠物名称为必填项')

    pet = Pet(
        user_id=user_id,
        name=data['name'],
        type=data.get('type', 'dog'),
        other_type=data.get('other_type'),
        breed=data.get('breed'),
        age=data.get('age'),
        gender=data.get('gender', 'unknown'),
        birthday=data.get('birthday'),
        image=data.get('image'),
    )
    db.session.add(pet)
    db.session.commit()
    return success_response(pet.to_dict(), '宠物添加成功', 201)


@pets_bp.route('/<int:pet_id>', methods=['GET'])
@jwt_required
def get_pet(pet_id):
    pet = Pet.query.filter_by(id=pet_id, user_id=get_current_user_id()).first()
    if not pet:
        return error_response('宠物不存在', 404)
    return success_response(pet.to_dict())


@pets_bp.route('/<int:pet_id>', methods=['PUT'])
@jwt_required
def update_pet(pet_id):
    pet = Pet.query.filter_by(id=pet_id, user_id=get_current_user_id()).first()
    if not pet:
        return error_response('宠物不存在', 404)

    data = request.get_json() or {}
    for field in ['name', 'type', 'other_type', 'breed', 'age', 'gender', 'birthday', 'image']:
        if field in data:
            setattr(pet, field, data[field])

    db.session.commit()
    return success_response(pet.to_dict(), '宠物信息已更新')


@pets_bp.route('/<int:pet_id>', methods=['DELETE'])
@jwt_required
def delete_pet(pet_id):
    pet = Pet.query.filter_by(id=pet_id, user_id=get_current_user_id()).first()
    if not pet:
        return error_response('宠物不存在', 404)
    db.session.delete(pet)
    db.session.commit()
    return success_response(message='宠物已删除')
