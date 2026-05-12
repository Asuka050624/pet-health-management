from flask import Blueprint, request
from ..extensions import db
from ..models import Reservation
from ..utils.decorators import jwt_required, get_current_user_id
from ..utils.error_handlers import success_response, error_response, paginated_response

reservations_bp = Blueprint('reservations', __name__, url_prefix='/api/reservations')


@reservations_bp.route('', methods=['GET'])
@jwt_required
def list_reservations():
    user_id = get_current_user_id()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    pagination = Reservation.query.filter_by(user_id=user_id).order_by(
        Reservation.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    items = [r.to_dict() for r in pagination.items]
    return paginated_response(items, page, per_page, pagination.total)


@reservations_bp.route('', methods=['POST'])
@jwt_required
def create_reservation():
    user_id = get_current_user_id()
    data = request.get_json() or {}

    required = ['pet_name', 'pet_type', 'symptoms', 'doctor', 'doctor_name', 'appointment_date', 'appointment_time', 'contact_name', 'contact_phone']
    for field in required:
        if not data.get(field):
            return error_response(f'缺少必填字段: {field}')

    import time
    from datetime import date, time as dt_time
    res_id = f"RES{int(time.time() * 1000)}"
    reservation = Reservation(
        id=res_id,
        user_id=user_id,
        pet_name=data['pet_name'],
        pet_type=data['pet_type'],
        symptoms=data['symptoms'],
        doctor=str(data['doctor']),
        doctor_name=data['doctor_name'],
        appointment_date=date.fromisoformat(data['appointment_date']),
        appointment_time=dt_time.fromisoformat(data['appointment_time']),
        contact_name=data['contact_name'],
        contact_phone=data['contact_phone'],
    )
    db.session.add(reservation)
    db.session.commit()
    return success_response(reservation.to_dict(), '预约成功', 201)


@reservations_bp.route('/<res_id>/cancel', methods=['PUT'])
@jwt_required
def cancel_reservation(res_id):
    reservation = Reservation.query.filter_by(id=res_id, user_id=get_current_user_id()).first()
    if not reservation:
        return error_response('预约不存在', 404)
    if reservation.status not in ('pending', 'confirmed'):
        return error_response('该预约无法取消')

    reservation.status = 'cancelled'
    db.session.commit()
    return success_response(message='预约已取消')
