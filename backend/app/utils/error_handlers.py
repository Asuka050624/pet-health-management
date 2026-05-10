from flask import jsonify


def error_response(message, code=400):
    return jsonify({'error': message, 'code': code}), code


def success_response(data=None, message='操作成功', code=200):
    return jsonify({
        'message': message,
        'data': data,
        'code': code,
    }), code


def paginated_response(items, page, per_page, total):
    return jsonify({
        'data': items,
        'page': page,
        'per_page': per_page,
        'total': total,
        'total_pages': max(1, (total + per_page - 1) // per_page) if total > 0 else 0,
    }), 200
