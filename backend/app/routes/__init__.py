def register_blueprints(app):
    from .auth import auth_bp
    from .users import users_bp
    from .pets import pets_bp
    from .products import products_bp
    from .cart import cart_bp
    from .orders import orders_bp
    from .reservations import reservations_bp
    from .feedbacks import feedbacks_bp
    from .news import news_bp
    from .messages import messages_bp
    from .admin import admin_bp
    from .upload import upload_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(pets_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(reservations_bp)
    app.register_blueprint(feedbacks_bp)
    app.register_blueprint(news_bp)
    app.register_blueprint(messages_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(upload_bp)
