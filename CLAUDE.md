# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

宠物健康管理系统 — 全栈宠物健康管理平台，包含移动用户端和管理员后台。

## 技术栈

- **后端**: Python 3 + Flask + SQLAlchemy + Flask-JWT-Extended + Flask-Migrate + Flask-CORS
- **前端**: React 18 + Vite + React Router 6 + Axios
- **数据库**: SQLite（开发环境）/ MySQL 8.0（生产环境）

## 项目结构

```
.
├── backend/                     # Flask 后端 API
│   ├── app/
│   │   ├── __init__.py          # Flask 工厂函数、蓝图注册、错误处理
│   │   ├── config.py            # 配置（Dev/Prod/Test），默认 SQLite
│   │   ├── extensions.py        # SQLAlchemy, JWT, Migrate, CORS 实例
│   │   ├── models/              # 数据模型（12 张表）
│   │   │   ├── user.py          # User — 用户
│   │   │   ├── admin.py         # Admin — 管理员
│   │   │   ├── pet.py           # Pet — 宠物
│   │   │   ├── product.py       # Product — 商品
│   │   │   ├── cart_item.py     # CartItem — 购物车
│   │   │   ├── order.py         # Order + OrderItem — 订单/订单项
│   │   │   ├── reservation.py   # Reservation — 挂号预约
│   │   │   ├── feedback.py      # Feedback — 反馈
│   │   │   ├── news.py          # News + NewsComment — 资讯/评论
│   │   │   └── message.py       # Message — 系统消息
│   │   ├── routes/              # API 路由（12 个 Blueprint）
│   │   │   ├── auth.py          # /api/auth — 注册、登录、刷新令牌、改密码
│   │   │   ├── users.py         # /api/users — 用户相关
│   │   │   ├── pets.py          # /api/pets — 宠物 CRUD
│   │   │   ├── products.py      # /api/products — 商品（只读列表/详情）
│   │   │   ├── cart.py          # /api/cart — 购物车 CRUD
│   │   │   ├── orders.py        # /api/orders — 订单
│   │   │   ├── reservations.py  # /api/reservations — 预约
│   │   │   ├── feedbacks.py     # /api/feedbacks — 反馈
│   │   │   ├── news.py          # /api/news — 资讯/评论
│   │   │   ├── messages.py      # /api/messages — 系统消息
│   │   │   ├── admin.py         # /api/admin — 管理后台（仪表盘、CRUD）
│   │   │   └── upload.py        # /api/upload — 文件上传
│   │   ├── services/            # 业务逻辑层
│   │   │   ├── auth_service.py  # 注册、登录、改密码逻辑
│   │   │   └── order_service.py # 下单（购物车转订单、扣库存）
│   │   ├── utils/
│   │   │   ├── decorators.py    # @jwt_required, @admin_required, @optional_jwt
│   │   │   └── error_handlers.py # success_response / error_response / paginated_response
│   │   └── seeds/
│   │       └── seed_data.py     # 种子数据（管理员、用户、宠物、商品、资讯等）
│   ├── migrations/              # Alembic 数据库迁移
│   ├── uploads/                 # 上传文件目录（avatars/, pets/, products/, news/）
│   ├── tests/                   # Pytest 测试
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   └── test_pets.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── run.py                   # 启动入口：python run.py
│   └── pet_health.db            # SQLite 数据库文件（开发环境）
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── index.jsx            # 入口：ReactDOM + BrowserRouter + AuthProvider + CartProvider
│   │   ├── App.jsx              # 路由配置（/mobile/*, /admin/*, /auth/*）
│   │   ├── api/                 # Axios API 封装（每个模块一个文件 + axios 实例）
│   │   │   ├── axios.js         # Axios 实例：baseURL, JWT 拦截器, 自动刷新令牌
│   │   │   ├── auth.js          # 认证 API
│   │   │   ├── pets.js          # 宠物 API
│   │   │   ├── products.js      # 商品 API
│   │   │   ├── cart.js          # 购物车 API
│   │   │   ├── orders.js        # 订单 API
│   │   │   ├── reservations.js  # 预约 API
│   │   │   ├── feedbacks.js     # 反馈 API
│   │   │   ├── news.js          # 资讯 API
│   │   │   ├── messages.js      # 消息 API
│   │   │   └── admin.js         # 管理后台 API
│   │   ├── components/
│   │   │   ├── common/          # Toast, ProtectedRoute (UserRoute/AdminRoute/GuestRoute), Loading
│   │   │   ├── layout/          # AuthLayout, MobileLayout (含底部导航), AdminLayout (含侧边栏)
│   │   │   ├── mobile/          # BottomNav
│   │   │   └── admin/           # Sidebar, StatCard, DataTable, StatusBadge
│   │   ├── pages/
│   │   │   ├── mobile/          # 13 个页面：Home, Shop, News, NewsDetail, Reservation,
│   │   │   │                    #   Feedback, UserCenter, PetsManagement, Orders, Messages,
│   │   │   │                    #   PersonalInfo, Login, Register, NotFound
│   │   │   └── admin/           # 9 个页面：Dashboard, Users, Pets, Products, Orders,
│   │   │                        #   Reservations, News, Feedback, Settings, AdminLogin
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # 认证上下文（user, isAuthenticated, isAdmin, login, logout）
│   │   │   └── CartContext.jsx  # 购物车上下文
│   │   ├── utils/
│   │   │   ├── constants.js     # 常量（宠物类型、商品分类、订单/预约状态）
│   │   │   └── formatters.js    # 格式化函数（价格、日期、时间）
│   │   └── styles/
│   │       └── global.css       # 全局样式
│   ├── public/images/           # 静态图片资源
│   ├── index.html               # Vite 入口 HTML
│   ├── vite.config.js           # Vite 配置（代理 /api → localhost:5000）
│   ├── .env                     # 环境变量（VITE_API_BASE_URL）
│   └── package.json
└── archive/                     # 旧版纯前端演示代码（git-ignored，仅参考）
    ├── index.html               # 统一登录页
    ├── mobile_app/              # 移动端 SPA（jQuery + localStorage）
    └── admin_panel/             # 管理后台（jQuery + localStorage）
```

## 运行方式

### 后端

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env           # 默认使用 SQLite，无需额外配置
flask db upgrade               # 数据库迁移（首次需 flask db init）
flask seed                     # 加载种子数据
python run.py                  # http://localhost:5000
```

### 前端

```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

Vite 开发服务器自动将 `/api` 和 `/uploads` 请求代理到后端 `localhost:5000`。

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 演示用户 | testuser | 123456 |

### 测试

```bash
cd backend
pytest tests/ -v
```

## 核心架构

### 认证流程

1. **登录/注册** → 后端返回 `access_token`（2h）+ `refresh_token`（30d），前端存入 localStorage
2. **请求拦截** → `axios.js` 请求拦截器自动附加 `Authorization: Bearer <token>`
3. **自动刷新** → 响应拦截器检测 401 → 自动用 `refresh_token` 换取新 `access_token` → 重放原请求
4. **角色区分** → JWT 内含 `role` claim（`user` / `admin`），前端 AuthContext 据此展示不同界面
5. **后端保护** → `@jwt_required`（用户）、`@admin_required`（管理员）装饰器
6. **登出** → 清除 localStorage 中的 token 和 role

### API 响应格式

```json
// 成功
{ "message": "操作成功", "data": {...}, "code": 200 }

// 分页
{ "data": [...], "page": 1, "per_page": 15, "total": 100, "total_pages": 7 }

// 错误
{ "error": "错误描述", "code": 400 }
```

### 数据库（12 张表）

| 表 | 说明 | 关键字段 |
|---|---|---|
| users | 用户 | username, phone, email, password_hash, avatar, points |
| admins | 管理员 | username, password_hash, role (super/admin), is_active |
| pets | 宠物 | user_id→users, name, type, breed, age, gender, birthday |
| products | 商品 | name, category, price, original_price, stock, sales, is_active |
| cart_items | 购物车 | user_id→users, product_id→products, quantity |
| orders | 订单 | id (ORD+timestamp), user_id→users, total_amount, status |
| order_items | 订单项 | order_id→orders, product_id→products, price, quantity |
| reservations | 预约 | id (RES+timestamp), user_id→users, pet_name, appointment_date, status |
| feedbacks | 反馈 | id (FB+timestamp), user_id→users, type, content, reply, status |
| news | 资讯 | title, category, summary, content, cover_image, is_published |
| news_comments | 资讯评论 | news_id→news, user_id→users, content |
| messages | 系统消息 | user_id→users, title, content, is_read |

### 数据库默认使用 SQLite

`.env` 中未配置 `SQLALCHEMY_DATABASE_URI` 时自动使用 SQLite（`backend/pet_health.db`），无需安装 MySQL。切换 MySQL 时取消 `.env` 中对应注释即可。

### 路由结构（React Router）

```
/auth/login              → 用户登录页
/auth/register           → 用户注册页
/auth/admin/login        → 管理员登录页
/mobile/home             → 首页（轮播、功能模块、资讯、商品推荐）
/mobile/shop             → 商城（商品列表、搜索、购物车、下单）
/mobile/news             → 资讯列表
/mobile/news/:id         → 资讯详情 + 评论
/mobile/reservation      → 挂号预约
/mobile/feedback         → 反馈中心
/mobile/user             → 用户中心
/mobile/user/pets        → 宠物管理
/mobile/user/orders      → 我的订单
/mobile/user/messages    → 消息中心
/mobile/user/profile     → 个人信息
/admin                   → 管理后台仪表盘
/admin/users             → 用户管理
/admin/pets              → 宠物管理
/admin/products          → 商品管理（CRUD）
/admin/orders            → 订单管理（状态更新）
/admin/reservations      → 预约管理（确认/取消）
/admin/news              → 资讯管理（CRUD）
/admin/feedback          → 反馈管理（回复）
/admin/settings          → 系统设置
```

### 路由保护

- `GuestRoute` — 已登录用户重定向至 `/mobile/home` 或 `/admin`
- `UserRoute` — 未登录重定向至 `/auth/login`，管理员重定向至 `/admin`
- `AdminRoute` — 非管理员重定向至 `/auth/admin/login`

## Docker 部署

项目已完整容器化，重启电脑后打开 Docker Desktop 即可一键启动。

### 启动

```bash
cd C:\Users\49319\Desktop\pets2\petshealthysystem
docker compose up -d
```

### 容器架构

```
docker-compose.yml
├── backend (pet-health-backend)
│   ├── build: ./backend
│   ├── port: 5000
│   ├── volumes: backend-db → /app/db（SQLite 数据库持久化）
│   │            backend-uploads → /app/uploads（上传文件持久化）
│   └── restart: unless-stopped（开机自启）
└── frontend (pet-health-frontend)
    ├── build: ./frontend（多阶段：Node 编译 + Nginx 服务）
    ├── port: 80
    ├── nginx 代理 /api 和 /uploads 到 backend:5000
    └── restart: unless-stopped
```

### Docker 相关文件

| 文件 | 用途 |
|------|------|
| `docker-compose.yml` | 编排定义 |
| `backend/Dockerfile` | Python 3.12-slim，pip 安装依赖，`CMD python run.py` |
| `backend/.dockerignore` | 排除缓存、数据库文件 |
| `frontend/Dockerfile` | Node 18-alpine 编译 + Nginx alpine 服务 |
| `frontend/nginx.conf` | SPA 路由 + API 代理 |
| `frontend/.dockerignore` | 排除 node_modules、dist |

### run.py 启动自动初始化

`run.py` 已修改为启动时自动执行：
1. `db.create_all()` — 自动建表
2. 检查 `User` 表是否为空 → 调用 `run_seed()` 填充种子数据
3. 启动 Flask 服务

因此在 Docker 中首次启动即可使用，无需手动执行 `flask seed`。

### 访问地址

- 前端：`http://localhost`（端口 80）
- 后端：`http://localhost:5000`
- 数据存储于 Docker 命名卷，重启不丢失

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 演示用户 | testuser | 123456 |

## 已知 Bug 修复记录（2026-05-12）

以下问题已在本会话中修复，后续修改相关代码时注意不要回退：

### 后端修复

1. **产品搜索参数不匹配** — `products.py` 只接受 `keyword`，前端发送 `search`。修复：同时接受 `keyword or search`。

2. **预约/反馈/下单 ID 生成崩溃** — `int(db.func.unix_timestamp(db.func.now()) * 1000)` 将 SQLAlchemy 表达式传给 Python `int()` 导致 TypeError。修复：改用 `int(time.time() * 1000)`。

3. **预约日期/时间类型错误** — 前端发送字符串 `"2026-05-15"` 和 `"10:00"`，但模型定义为 `db.Date` 和 `db.Time`，SQLite 拒绝。修复：`reservations.py` 创建路由中用 `date.fromisoformat()` 和 `time.fromisoformat()` 转换。

4. **宠物日期字段问题** — `pets.py` 的创建和更新路由中 `birthday` 字符串需要转换为 Python `date` 对象；更新路由空字符串值需跳过。

5. **上传文件无法访问** — Flask 缺少 `/uploads/<path>` 静态文件服务路由。修复：在 `__init__.py` 中添加 `send_from_directory` 路由。

### 前端修复

6. **预约缺少 doctor_name** — 后端要求 `doctor_name` 为必填字段，前端 `ReservationPage.jsx` 只发送 `doctor`（ID）。修复：从 `DOCTOR_OPTIONS` 推导 `doctor_name` 并一并提交。

7. **分页参数名不匹配** — `ReservationPage.jsx` 和 `FeedbackPage.jsx` 发送 `pageSize`，后端期望 `per_page`。修复：改为 `per_page`。

8. **消息列表解析错误** — 后端消息 API 返回 `{items: [], unread_count: N}` 嵌套结构，`MessagesPage.jsx` 错误地将整个对象当作数组渲染。修复：正确解析 `data.data.items`。

9. **宠物表单空字符串问题** — `PetsManagementPage.jsx` 提交时 `birthday: ""` 和 `breed: ""` 导致后端 Date/String 列绑定问题。修复：空值改为 `undefined`（JSON 序列化时自动移除）。

10. **上传 URL 硬编码** — `constants.js` 中 `UPLOADS_URL` 硬编码为 `http://localhost:5000/uploads`，Docker 环境下应使用相对路径。修复：改为 `import.meta.env.VITE_UPLOADS_URL || '/uploads'`。

## 注意事项

- **archive/ 目录已归档**：`.gitignore` 中排除了 `archive/`，其中为旧版纯前端演示代码，使用 localStorage 模拟数据，无需后端。仅供架构参考，不参与 CI/CD。
- **SQLite 默认**：开发环境默认使用 SQLite，首次运行 `flask seed` 即可获得完整演示数据。
- **上传文件**：图片上传后保存在 `backend/uploads/` 下对应子目录，前端通过 `/uploads/...` 访问（Vite 代理或 Flask 静态文件）。
- **跨域**：`Flask-CORS` 已在所有 `/api/*` 路由上启用 `origins: *`。
- **Node 依赖**：`frontend/node_modules` 已安装，如需重新安装运行 `npm install`。
