import os
from app import create_app

app = create_app()

# Auto-initialize database on first run (for Docker)
with app.app_context():
    from app.extensions import db
    from app.models import User
    db_dir = os.path.dirname(app.config.get('SQLALCHEMY_DATABASE_URI', '').replace('sqlite:////', '').replace('sqlite:///', ''))
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    db.create_all()
    if User.query.count() == 0:
        print('Seeding database...')
        from app.seeds.seed_data import run_seed
        run_seed()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
