# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

宠物健康管理系统 — 纯前端演示项目，无需构建工具，所有数据存储在 `localStorage` 中，无真实后端。

## 运行方式

```bash
# 移动应用端（推荐）
cd mobile_app && python -m http.server 8000     # Python 3
# 或双击 mobile_app/start_server.bat

# 管理员后台 — 直接打开 admin_panel/dashboard.html，或通过根目录 index.html 统一登录入口
```

默认账号：用户端 `user` / `123456`，管理端 `admin` / `admin123`。

## 项目结构

```
根目录 index.html          # 统一登录页（用户/管理员双tab）
mobile_app/                # 移动端 SPA（多页面，底部导航栏切换）
  index.html               #   首页（轮播图 + 功能模块 + 资讯列表 + 商品推荐）
  js/
    init.js                #   共享层：登录状态读写（window.petApp）、mock数据初始化
    main.js                #   首页逻辑（轮播图、全局 addToCart/updateCartCount）
    login.js               #   登录页（非空即过，保存到 localStorage 后跳转）
    shop.js                #   商城（商品列表、搜索、购物车弹窗、支付弹窗）
    reservation.js         #   挂号预约
    news.js                #   宠物资讯
    feedback.js            #   反馈中心
    user_center.js         #   个人中心
    pets_management.js     #   宠物管理
    register.js            #   注册
    jquery.min.js          #   jQuery（唯一外部依赖）
  backend/                 #   Java 演示桩（User, UserAuthService, Main）
  automation_tests/        #   Java 自动化测试桩（AutomatedTestRunner）
admin_panel/               # 管理后台（侧边栏导航）
  dashboard.html           #   仪表盘（统计卡片 + 实时活动 + 待办列表）
  js/dashboard.js          #   登录检查、统计刷新（10秒轮询）、登出
  js/login.js              #   管理端登录逻辑
```

## 核心架构

### 跨页面共享

`mobile_app/js/init.js` 在 `<script>` 标签中最早加载，提供以下公共能力：

- **`window.petApp`** 命名空间：`getStoredUser()` / `saveUserState(user)` / `clearUserState()`
- **`initMockData()`**：首次访问时向 localStorage 写入模拟数据（用户、预约、反馈、购物车），由 `localStorage.initData` 标记防重复
- **`getCurrentUser()`** 和 **`isUserLoggedIn()`**：用于各页面检查登录状态
- **`updateBottomNavLoginStatus()`**：在底部导航栏显示已登录用户名

使用时检查 `window.petApp && typeof window.petApp.getStoredUser === 'function'`，回退时直接读 `localStorage.currentUser` 或 `localStorage.user`。

### localStorage 键名约定

| 键 | 内容 |
|---|---|
| `currentUser` / `user` | 当前登录用户 JSON（含 `isLogin`, `isLoggedIn`） |
| `isLoggedIn` / `isLogin` | 登录标记 `"true"` |
| `admin` | 管理员登录信息 |
| `cart` | 购物车 `[{id, name, price, image, quantity}]` |
| `reservations` | 预约列表 |
| `feedbacks` | 反馈列表 |
| `initData` | 防止 mock 数据重复写入 |

管理员后台使用 `admin*` 前缀键名（如 `adminReservations`, `adminPets`, `adminOrders`, `adminNews`, `adminFeedback`, `users`），与移动端数据独立。

### 登录流程

1. 移动端 `login.js`：接受任意非空用户名/密码 → 调用 `petApp.saveUserState()` 写入 localStorage → 跳转到 `redirectUrl` 或 `document.referrer` 或 `user_center.html`
2. 根目录 `index.html`：双 tab 切换（用户登录/管理员登录），管理员登录成功后跳转 `admin_panel/dashboard.html`
3. 管理端 `dashboard.js`：`checkAdminLogin()` 读取 `localStorage.admin`，未登录则重定向到 `login.html`

### 购物车流程

`window.addToCart(productId)` → 写入 `localStorage.cart` → `window.updateCartCount()` 更新角标 → `window.showAddToCartSuccess()` 显示 toast。产品数据硬编码在 `shop.js` 和 `main.js` 的 `window.products` 数组中。

## 注意事项

- **图片路径**：所有图片引用相对于 HTML 所在目录的 `images/` 子目录，直接打开 HTML 文件时路径正确，但 HTTP 服务器方式也兼容
- **jQuery 重复**：`jquery.min.js` 分别存放在 `mobile_app/js/` 和 `admin_panel/js/` 中，各自独立加载
- **Java 后端桩**：`mobile_app/backend/` 中的 Java 文件仅为概念演示，编译运行方式：`cd mobile_app && javac backend/*.java && java -cp . backend.Main`
- **管理端 login.html** 是自动跳转页（跳转到根目录统一登录），实际登录入口在根目录 `index.html`
