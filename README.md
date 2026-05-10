# 宠物健康管理系统

全栈宠物健康管理平台，包含移动用户端和管理员后台。

## 技术栈

- **后端**: Python 3 + Flask + SQLAlchemy + JWT
- **前端**: React 18 + Vite + React Router
- **数据库**: MySQL 8.0
- **认证**: JWT (Access Token + Refresh Token)

## 项目结构

```
├── backend/                 # Flask 后端 API
│   ├── app/
│   │   ├── models/          # 数据模型（12张表）
│   │   ├── routes/          # API 路由（12个Blueprint）
│   │   ├── services/        # 业务逻辑层
│   │   ├── utils/           # 工具函数、装饰器
│   │   └── seeds/           # 种子数据
│   ├── migrations/          # 数据库迁移文件
│   ├── uploads/             # 上传文件目录
│   ├── tests/               # Pytest 测试
│   └── run.py               # 启动入口
├── frontend/                # React SPA
│   ├── src/
│   │   ├── api/             # API 调用封装
│   │   ├── components/      # 共享组件 (layout/common/mobile/admin)
│   │   ├── pages/           # 页面组件 (mobile/ 13页 + admin/ 9页)
│   │   ├── context/         # AuthContext + CartContext
│   │   └── styles/          # 全局样式
│   └── vite.config.js
└── archive/                 # 旧版前端代码（仅参考）
```

## 环境搭建

### 前置条件

- Python 3.9+
- Node.js 18+
- MySQL 8.0+

### 1. 创建数据库

```sql
CREATE DATABASE pet_health_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pet_app'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON pet_health_db.* TO 'pet_app'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 后端启动

```bash
cd backend

# 创建虚拟环境
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量（编辑 .env 文件中的数据库连接信息）
cp .env.example .env

# 数据库迁移
flask db init        # 仅首次
flask db migrate -m "initial migration"
flask db upgrade

# 加载种子数据
flask seed

# 启动后端服务 (http://localhost:5000)
python run.py
```

### 3. 前端启动

```bash
cd frontend
npm install
npm run dev      # 启动开发服务器 (http://localhost:5173)
```

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 演示用户 | testuser | 123456 |

### 4. 运行测试

```bash
cd backend
pytest tests/ -v
```

## API 概览

| 模块 | 端点 | 认证 |
|------|------|------|
| 认证 | `/api/auth/register\|login\|refresh\|me` | JWT |
| 宠物 | `/api/pets` CRUD | 用户 JWT |
| 商品 | `/api/products` (只读) | 无 |
| 购物车 | `/api/cart` CRUD | 用户 JWT |
| 订单 | `/api/orders` | 用户 JWT |
| 预约 | `/api/reservations` | 用户 JWT |
| 反馈 | `/api/feedbacks` | 用户 JWT |
| 资讯 | `/api/news` + 评论 | 部分 JWT |
| 消息 | `/api/messages` | 用户 JWT |
| 管理后台 | `/api/admin/*` | 管理员 JWT |
| 上传 | `/api/upload/*` | JWT |
