import datetime
from ..extensions import db


class Reservation(db.Model):
    __tablename__ = 'reservations'

    id = db.Column(db.String(20), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    pet_name = db.Column(db.String(50), nullable=False)
    pet_type = db.Column(db.String(20), nullable=False)
    symptoms = db.Column(db.Text, nullable=False)
    doctor = db.Column(db.String(10), nullable=False)
    doctor_name = db.Column(db.String(50), nullable=False)
    appointment_date = db.Column(db.Date, nullable=False)
    appointment_time = db.Column(db.Time, nullable=False)
    contact_name = db.Column(db.String(50), nullable=False)
    contact_phone = db.Column(db.String(20), nullable=False)
    status = db.Column(db.Enum('pending', 'confirmed', 'completed', 'cancelled'), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'pet_name': self.pet_name,
            'pet_type': self.pet_type,
            'symptoms': self.symptoms,
            'doctor': self.doctor,
            'doctor_name': self.doctor_name,
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'appointment_time': str(self.appointment_time) if self.appointment_time else None,
            'contact_name': self.contact_name,
            'contact_phone': self.contact_phone,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
