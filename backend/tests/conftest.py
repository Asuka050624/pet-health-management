import pytest
from app import create_app
from app.extensions import db as _db


@pytest.fixture
def app():
    app = create_app('testing')
    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def db(app):
    return _db


@pytest.fixture
def auth_headers(client):
    """Register and login a test user, return headers with JWT token."""
    client.post('/api/auth/register', json={
        'username': 'testuser',
        'phone': '13800000000',
        'password': 'test1234',
    })
    resp = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'test1234',
    })
    token = resp.get_json()['data']['access_token']
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def admin_headers(client):
    """Login as admin (using seed credentials), return headers with JWT token."""
    from app.models import Admin
    from werkzeug.security import generate_password_hash
    from app.extensions import db

    admin = Admin(username='admin', password_hash=generate_password_hash('admin123'), role='super')
    db.session.add(admin)
    db.session.commit()

    resp = client.post('/api/auth/admin/login', json={
        'username': 'admin',
        'password': 'admin123',
    })
    token = resp.get_json()['data']['access_token']
    return {'Authorization': f'Bearer {token}'}
