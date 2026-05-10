def test_create_pet(client, auth_headers):
    resp = client.post('/api/pets', json={
        'name': '旺财',
        'type': 'dog',
        'breed': '柴犬',
        'age': 3,
        'gender': 'male',
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.get_json()['data']
    assert data['name'] == '旺财'
    assert data['type'] == 'dog'


def test_list_pets(client, auth_headers):
    client.post('/api/pets', json={'name': '喵喵', 'type': 'cat', 'age': 1}, headers=auth_headers)
    client.post('/api/pets', json={'name': '旺财', 'type': 'dog', 'age': 2}, headers=auth_headers)

    resp = client.get('/api/pets', headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.get_json()['data']) == 2


def test_update_pet(client, auth_headers):
    resp = client.post('/api/pets', json={'name': '旺财', 'type': 'dog', 'age': 2}, headers=auth_headers)
    pet_id = resp.get_json()['data']['id']

    resp = client.put(f'/api/pets/{pet_id}', json={'name': '旺财2号', 'age': 3}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()['data']['name'] == '旺财2号'


def test_delete_pet(client, auth_headers):
    resp = client.post('/api/pets', json={'name': '临时', 'type': 'other'}, headers=auth_headers)
    pet_id = resp.get_json()['data']['id']

    resp = client.delete(f'/api/pets/{pet_id}', headers=auth_headers)
    assert resp.status_code == 200

    resp = client.get(f'/api/pets/{pet_id}', headers=auth_headers)
    assert resp.status_code == 404


def test_cannot_access_other_users_pet(client, auth_headers):
    resp = client.post('/api/pets', json={'name': '我的宠物', 'type': 'dog'}, headers=auth_headers)
    pet_id = resp.get_json()['data']['id']

    # Register another user and try to access the pet
    client.post('/api/auth/register', json={
        'username': 'other',
        'phone': '13999999999',
        'password': 'test1234',
    })
    resp2 = client.post('/api/auth/login', json={'username': 'other', 'password': 'test1234'})
    other_token = resp2.get_json()['data']['access_token']

    resp = client.get(f'/api/pets/{pet_id}', headers={'Authorization': f'Bearer {other_token}'})
    assert resp.status_code == 404
