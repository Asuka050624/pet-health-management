import os

from flask import Flask, jsonify
from dotenv import load_dotenv

from .config import config_map
from .extensions import db, jwt, migrate, cors


def create_app(config_name=None):
    load_dotenv()

    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config_map.get(config_name, config_map['development']))

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Register error handlers
    register_error_handlers(app)

    # Register CLI commands
    register_commands(app)

    # Register blueprints
    from .routes import register_blueprints
    register_blueprints(app)

    # Health check
    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok'})

    return app


def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': '请求参数错误', 'code': 400}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': '未授权访问', 'code': 401}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'error': '禁止访问', 'code': 403}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': '资源不存在', 'code': 404}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({'error': '请求方法不允许', 'code': 405}), 405

    @app.errorhandler(422)
    def unprocessable_entity(error):
        return jsonify({'error': '请求数据验证失败', 'code': 422}), 422

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': '服务器内部错误', 'code': 500}), 500

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': '登录已过期，请重新登录', 'code': 401}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': '无效的登录凭证', 'code': 401}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': '请先登录', 'code': 401}), 401


def register_commands(app):
    @app.cli.command('seed')
    def seed_command():
        """Load seed data into the database."""
        from .seeds.seed_data import run_seed
        run_seed()
