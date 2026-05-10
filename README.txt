宠物健康管理系统 - 运行指南

由于这是一个纯前端的单页应用程序，您可以通过以下几种方式运行：

方式一：直接在浏览器中打开
1. 在Windows资源管理器中，导航到以下路径：
   d:\ai 编码 trea\宠物健康管理系统\mobile_app
2. 在mobile_app目录中，您会看到index.html文件
3. 双击index.html文件
4. 系统会自动在您的默认浏览器中加载应用

方式二：使用任意Web服务器
如果您希望通过HTTP服务器方式运行（推荐用于更稳定的体验），可以使用以下方法：

A. 使用Python（如果已安装）
1. 打开命令提示符（CMD）
2. 导航到项目的 mobile_app 目录：
   cd d:\ai 编码 trea\宠物健康管理系统\mobile_app
3. 运行以下命令启动服务器：
   - Python 2.x: python -m SimpleHTTPServer 8000
   - Python 3.x: python -m http.server 8000
4. 打开浏览器，访问 http://localhost:8000

B. 使用VS Code的Live Server插件
1. 如果您有安装VS Code，可以安装Live Server插件
2. 在VS Code中打开项目的 mobile_app 目录
3. 右键点击 index.html 文件，选择 "Open with Live Server"
4. 系统会自动在浏览器中打开应用

C. 使用其他Web服务器软件
您也可以使用Apache、Nginx等任何Web服务器软件来托管这个应用

系统功能说明：

1. 登录功能
   - 默认用户名：user
   - 默认密码：123456
   - 登录后可以使用所有功能模块

2. 主要功能模块
   - 宠物资讯：查看宠物健康相关资讯
   - 挂号预约：预约宠物医生就诊
   - 宠物商城：购买宠物用品
   - 反馈中心：提交建议或问题反馈
   - 用户中心：管理个人信息和查看历史记录

3. 模拟数据
   系统会自动初始化一些模拟数据，让您可以立即体验各项功能。

注意事项：
- 本系统使用浏览器的localStorage存储数据，刷新页面不会丢失数据
- 清除浏览器缓存或使用隐私模式可能会清除存储的数据
- 为了获得最佳体验，请使用现代浏览器（Chrome、Firefox、Edge等）