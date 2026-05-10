def test_register(client):
    resp = client.post('/api/auth/register', json={
        'username': 'newuser',
        'phone': '13900000000',
        'password': 'test1234',
    })
    assert resp.status_code == 201
    data = resp.get_json()
    assert 'access_token' in data['data']
    assert data['data']['user']['username'] == 'newuser'
    assert data['data']['user']['role'] == 'user'


def test_register_duplicate(client):
    client.post('/api/auth/register', json={
        'username': 'dupuser',
        'phone': '13811111111',
        'password': 'test1234',
    })
    resp = client.post('/api/auth/register', json={
        'username': 'dupuser',
        'phone': '13822222222',
        'password': 'test1234',
    })
    assert resp.status_code == 400


def test_login_success(client):
    client.post('/api/auth/register', json={
        'username': 'loginuser',
        'phone': '13833333333',
        'password': 'test1234',
    })
    resp = client.post('/api/auth/login', json={
        'username': 'loginuser',
        'password': 'test1234',
    })
    assert resp.status_code == 200
    assert 'access_token' in resp.get_json()['data']


def test_login_wrong_password(client):
    client.post('/api/auth/register', json={
        'username': 'badpw',
        'phone': '13844444444',
        'password': 'test1234',
    })
    resp = client.post('/api/auth/login', json={
        'username': 'badpw',
        'password': 'wrongpass',
    })
    assert resp.status_code == 401


def test_get_me(client, auth_headers):
    resp = client.get('/api/auth/me', headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()['data']['username'] == 'testuser'


def test_admin_login(client):
    from app.models import Admin
    from werkzeug.security import generate_password_hash
    from app.extensions import db

    admin = Admin(username='admintest', password_hash=generate_password_hash('admin123'), role='super')
    db.session.add(admin)
    db.session.commit()

    resp = client.post('/api/auth/admin/login', json={
        'username': 'admintest',
        'password': 'admin123',
    })
    assert resp.status_code == 200
    data = resp.get_json()['data']
    assert data['user']['role'] == 'admin'


def test_unauthenticated_access(client):
    resp = client.get('/api/auth/me')
    assert resp.status_code == 401
