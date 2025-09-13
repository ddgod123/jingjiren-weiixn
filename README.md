# 经纪人小程序 (jingjiren-weiixn)

基于 TDesign MiniProgram 开发的经纪人业务小程序，提供完整的登录、用户管理、消息聊天等功能。

## 🚀 项目特性

- ✅ **开发阶段伪用户系统** - 支持开发环境模拟微信用户登录
- ✅ **现代化UI设计** - 基于 TDesign 组件库的蓝白风格界面
- ✅ **完整登录流程** - 登录页作为入口，支持微信授权登录
- ✅ **四个主要页面** - 首页、发布、消息、我的、统计
- ✅ **热更新开发** - 配置热重载提升开发效率
- ✅ **代码包优化** - 移除大文件，优化小程序包大小

## 📱 功能模块

### 🏠 首页
- 信息展示卡片
- 轮播图组件
- 快速导航

### 📝 发布页面
- 信息发布功能
- 表单组件集成

### 💬 消息中心
- 实时聊天功能
- WebSocket 连接
- 消息状态管理

### 👤 我的页面
- 用户信息展示
- 伪用户信息支持
- 退出登录功能

### 📊 统计页面
- 数据统计展示
- 图表组件

## 🛠️ 开发环境

### 环境要求
- 微信开发者工具 >= 2.0
- 微信小程序基础库 >= 2.6.5
- Node.js >= 14.0

### 开发步骤

```bash
# 1. 克隆项目
git clone https://github.com/ddgod123/jingjiren-weiixn.git

# 2. 安装依赖
npm install

# 3. 微信开发者工具
# - 导入项目
# - 构建 npm
# - 开启热重载
# - 编译预览
```

### 项目配置
- `project.config.json` - 启用热重载 `compileHotReLoad: true`
- `app.json` - 页面路由和 TDesign 组件配置
- `app.less` - 全局样式配置

## 🎯 开发模式

### 伪用户登录系统
为了方便开发测试，项目实现了伪微信用户系统：
- 随机生成用户信息（昵称、头像、地址等）
- 模拟完整的注册登录流程
- 支持退出登录和重新登录
- 避免微信隐私协议限制

### 用户信息格式
```javascript
{
  nickName: "微信用户_3456_7892",
  avatarUrl: "/static/head/avatar1.png", 
  gender: 1, // 1:男 2:女
  city: "北京",
  province: "北京",
  openid: "mock_openid_1234567890_5678",
  loginType: "mock_wechat"
}
```

## 📂 项目结构

```
jingjiren-v/
├── pages/           # 页面文件
│   ├── login/       # 登录页面
│   ├── home/        # 首页
│   ├── release/     # 发布页
│   ├── message/     # 消息页
│   ├── my/          # 我的页面
│   └── statis/      # 统计页面
├── components/      # 自定义组件
├── static/          # 静态资源
│   ├── head/        # 头像图片
│   └── tabbar_icon/ # 底部导航图标
├── utils/           # 工具函数
├── api/             # 接口封装
├── mock/            # 模拟数据
└── custom-tab-bar/  # 自定义底部导航
```

## 🎨 UI 设计

- **设计风格**: 蓝白主题色彩
- **组件库**: TDesign MiniProgram
- **图标**: TDesign Icon (CDN加载)
- **布局**: 响应式设计，适配不同屏幕

## 🔧 技术栈

- **框架**: 微信小程序原生开发
- **UI库**: TDesign MiniProgram
- **样式**: Less 预处理器
- **状态管理**: 全局 App 状态 + 本地存储
- **网络**: 封装的 request 工具
- **构建**: 微信开发者工具

## 📝 更新日志

### v1.0.0 (2025-09-13)
- 🎉 项目初始化
- ✨ 实现伪用户登录系统
- 🎨 完成 UI 设计和页面布局
- 🔧 配置开发环境和热更新
- 📦 优化代码包大小

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 开源协议

本项目基于 [Apache-2.0](LICENSE) 协议开源。

## 🙏 致谢

- [TDesign](https://tdesign.tencent.com/) - 提供优秀的组件库
- [微信小程序](https://developers.weixin.qq.com/miniprogram/dev/framework/) - 小程序开发平台