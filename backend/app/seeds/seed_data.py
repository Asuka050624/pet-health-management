import datetime
from werkzeug.security import generate_password_hash
from ..extensions import db
from ..models import User, Admin, Pet, Product, News, Reservation, Feedback, Message


def run_seed():
    """Load initial seed data into the database."""
    print('Seeding database...')

    # Admin
    if not Admin.query.filter_by(username='admin').first():
        admin = Admin(
            username='admin',
            password_hash=generate_password_hash('admin123'),
            role='super',
        )
        db.session.add(admin)
        print('  Created admin: admin / admin123')

    # Demo user
    demo_user = User.query.filter_by(username='testuser').first()
    if not demo_user:
        demo_user = User(
            username='testuser',
            phone='13800138000',
            email='test@example.com',
            password_hash=generate_password_hash('123456'),
            points=100,
        )
        db.session.add(demo_user)
        db.session.flush()
        print('  Created user: testuser / 123456')

    user_id = demo_user.id

    # Demo pet
    if not Pet.query.filter_by(user_id=user_id).first():
        pet = Pet(
            user_id=user_id,
            name='小白',
            type='dog',
            breed='金毛',
            age=2,
            gender='male',
        )
        db.session.add(pet)
        print('  Created demo pet: 小白')

    # Products
    if Product.query.count() == 0:
        products = [
            Product(name='优质宠物罐头', category='食品', price=29.90, original_price=39.90,
                    description='采用优质食材制作，富含宠物所需的各种营养成分，口感鲜美，易于消化吸收。',
                    stock=500, sales=128, image=None),
            Product(name='宠物互动玩具球', category='玩具', price=19.90, original_price=29.90,
                    description='互动玩具球，能够发出声音吸引宠物注意力，增强主人与宠物的互动。',
                    stock=300, sales=95, image=None),
            Product(name='宠物秋冬保暖衣服', category='服饰', price=59.90, original_price=89.90,
                    description='专为秋冬季节设计的宠物保暖衣服，材质柔软舒适。',
                    stock=200, sales=78, image=None),
            Product(name='宠物沐浴露', category='洗护', price=39.90, original_price=49.90,
                    description='温和不刺激的宠物专用沐浴露，能够有效清洁宠物毛发。',
                    stock=400, sales=156, image=None),
            Product(name='猫粮幼猫专用', category='食品', price=89.90, original_price=109.90,
                    description='专门为幼猫设计的配方粮，富含幼猫成长所需的营养成分。',
                    stock=350, sales=112, image=None),
            Product(name='猫咪逗猫棒', category='玩具', price=15.90, original_price=25.90,
                    description='有趣的逗猫棒，能够激发猫咪的狩猎本能，提供丰富的互动乐趣。',
                    stock=500, sales=210, image=None),
        ]
        for p in products:
            db.session.add(p)
        print(f'  Created {len(products)} products')

    # News
    if News.query.count() == 0:
        news_items = [
            News(
                title='宠物春季常见疾病预防指南',
                category='疾病预防',
                summary='春季是宠物疾病的高发期，提前了解这些预防知识可以让你的宠物更健康。',
                content='<p>春季气温回暖，细菌和寄生虫也开始活跃。以下是春季宠物常见疾病及预防措施：</p>'
                        '<h3>1. 皮肤病</h3><p>春季潮湿容易引发宠物皮肤病，建议定期给宠物洗澡，保持毛发干燥清洁。</p>'
                        '<h3>2. 寄生虫感染</h3><p>跳蚤、蜱虫等寄生虫在春季大量繁殖，建议每月进行一次体外驱虫。</p>'
                        '<h3>3. 呼吸道疾病</h3><p>春季花粉过敏可能导致宠物咳嗽、打喷嚏，注意减少花粉接触。</p>',
                author='宠物健康管理中心',
                is_published=True,
                published_at=datetime.datetime.now() - datetime.timedelta(days=5),
            ),
            News(
                title='新手养狗必学：基础训练技巧',
                category='训练技巧',
                summary='作为一名新的狗主人，掌握这些基础训练技巧可以帮助你更好地与宠物相处。',
                content='<p>养狗不仅仅是喂食和遛狗，基础训练对于狗狗的身心健康非常重要。</p>'
                        '<h3>1. 坐下训练</h3><p>手持零食在狗狗头顶上方，慢慢向后移动，狗狗自然会坐下。</p>'
                        '<h3>2. 定点排便</h3><p>固定时间带狗狗到指定地点，排便后立即奖励，形成条件反射。</p>'
                        '<h3>3. 召回训练</h3><p>在安全的封闭环境中，用愉快的语气呼唤狗狗名字，过来后给予奖励。</p>',
                author='宠物行为研究',
                is_published=True,
                published_at=datetime.datetime.now() - datetime.timedelta(days=10),
            ),
            News(
                title='如何为猫咪选择最合适的猫粮',
                category='营养饮食',
                summary='选择合适的猫粮对猫咪的健康至关重要，不同年龄段的猫咪需求也不同。',
                content='<p>市面上的猫粮种类繁多，如何为爱猫选择最合适的猫粮？</p>'
                        '<h3>幼猫阶段（0-12个月）</h3><p>需要高蛋白、高脂肪的配方，支持快速成长。</p>'
                        '<h3>成猫阶段（1-7岁）</h3><p>均衡营养，控制热量摄入，预防肥胖。</p>'
                        '<h3>老年猫（7岁以上）</h3><p>易消化蛋白质，添加关节保健成分，控制磷含量保护肾脏。</p>',
                author='宠物营养师',
                is_published=True,
                published_at=datetime.datetime.now() - datetime.timedelta(days=15),
            ),
            News(
                title='狗狗疫苗接种时间表详解',
                category='疾病预防',
                summary='了解狗狗各阶段的疫苗需求，为狗狗建立完整的免疫保护。',
                content='<p>疫苗接种是保障狗狗健康的重要措施，以下是完整的疫苗接种时间表：</p>'
                        '<h3>6-8周龄</h3><p>犬瘟热、细小病毒、腺病毒、副流感（DA2PP）第一针。</p>'
                        '<h3>10-12周龄</h3><p>DA2PP第二针 + 钩端螺旋体疫苗。</p>'
                        '<h3>14-16周龄</h3><p>DA2PP第三针 + 狂犬病疫苗。</p>'
                        '<h3>每年</h3><p>年度加强针，保持免疫力。</p>',
                author='宠物健康管理中心',
                is_published=True,
                published_at=datetime.datetime.now() - datetime.timedelta(days=20),
            ),
            News(
                title='宠物行业最新趋势：智能养宠时代来临',
                category='行业动态',
                summary='智能宠物设备市场快速增长，AI技术助力宠物健康管理。',
                content='<p>随着科技进步，智能养宠设备越来越受到宠物主人的欢迎。</p>'
                        '<h3>智能喂食器</h3><p>可远程控制、定时定量，部分产品支持AI分析宠物饮食习惯。</p>'
                        '<h3>健康监测项圈</h3><p>实时监测宠物心率、活动量、睡眠质量等健康指标。</p>'
                        '<h3>智能猫砂盆</h3><p>自动清理，监测排泄情况，预警健康问题。</p>',
                author='行业观察',
                is_published=True,
                published_at=datetime.datetime.now() - datetime.timedelta(days=25),
            ),
        ]
        for n in news_items:
            db.session.add(n)
        print(f'  Created {len(news_items)} news articles')

    # Sample reservation
    if not Reservation.query.filter_by(user_id=user_id).first():
        reservation = Reservation(
            id=f"RES{int(datetime.datetime.now().timestamp() * 1000)}",
            user_id=user_id,
            pet_name='小白',
            pet_type='dog',
            symptoms='最近食欲不佳，精神状态较差',
            doctor='1',
            doctor_name='张医生 - 宠物内科',
            appointment_date=datetime.date.today() + datetime.timedelta(days=1),
            appointment_time=datetime.time(10, 0),
            contact_name='李先生',
            contact_phone='13800138000',
            status='pending',
        )
        db.session.add(reservation)
        print('  Created demo reservation')

    # Sample feedback
    if not Feedback.query.filter_by(user_id=user_id).first():
        fb = Feedback(
            id=f"FB{int(datetime.datetime.now().timestamp() * 1000)}",
            user_id=user_id,
            type='suggestion',
            content='希望能够增加更多的宠物食品选择，特别是有机天然的食品。',
            contact='test@example.com',
            status='pending',
        )
        db.session.add(fb)
        print('  Created demo feedback')

    # Welcome message
    if not Message.query.filter_by(user_id=user_id).first():
        msg = Message(
            user_id=user_id,
            title='欢迎使用宠物健康管理系统',
            content='感谢您注册宠物健康管理系统！您可以在这里管理您的宠物信息、预约医生、浏览资讯和购买宠物用品。',
        )
        db.session.add(msg)
        print('  Created welcome message')

    db.session.commit()
    print('Seed complete!')
