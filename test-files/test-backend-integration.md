# 小程序与后端联调测试指南

## 🎯 测试目标
验证小程序微信授权登录能够成功注册用户到后端的 `registered_users` 表中。

## 📋 数据模型对比

### 后端 RegisteredUser 结构
```go
type RegisteredUser struct {
    ID              uint       `json:"id" gorm:"primarykey"`
    NickName        string     `json:"nickName" gorm:"column:nick_name"`
    AvatarURL       string     `json:"avatarUrl" gorm:"column:avatar_url"`
    PhoneNumber     *string    `json:"phoneNumber" gorm:"column:phone_number"`
    Platform        string     `json:"platform"`                    // "wechat_miniprogram"
    PlatformUserID  string     `json:"platformUserId" gorm:"column:platform_user_id"`
    PlatformUnionID string     `json:"platformUnionId" gorm:"column:platform_union_id"`
    SessionKey      string     `json:"-" gorm:"column:session_key"`
    Gender          int        `json:"gender"`                      // 1:男 2:女 0:未知
    Country         string     `json:"country"`
    Province        string     `json:"province"`
    City            string     `json:"city"`
    Language        string     `json:"language"`
    Status          string     `json:"status"`                      // "active"
    IsVerified      int        `json:"isVerified" gorm:"column:is_verified"`
    LastLoginAt     *time.Time `json:"lastLoginAt" gorm:"column:last_login_at"`
    LoginCount      int        `json:"loginCount" gorm:"column:login_count"`
    LastLoginIP     string     `json:"lastLoginIp" gorm:"column:last_login_ip"`
    CreatedAt       time.Time  `json:"createdAt"`
    UpdatedAt       time.Time  `json:"updatedAt"`
}
```

### 小程序发送的数据格式
```javascript
const loginData = {
    code: mockCode,                    // 模拟微信code
    nickName: mockUser.nickName,       // "微信用户_3456_7892"
    avatarUrl: mockUser.avatarUrl,     // "/static/head/avatar1.png"
    phoneNumber: mockUser.phoneNumber || '',
    gender: mockUser.gender,           // 1 或 2
    country: mockUser.country,         // "中国"
    province: mockUser.province,       // "北京"
    city: mockUser.city,              // "北京"
    language: mockUser.language       // "zh_CN"
};
```

## 🔧 联调配置

### 1. 后端配置
- **服务地址**: `http://localhost:8002`
- **API接口**: `POST /api/v1/auth/wechat/login`
- **数据库**: MySQL `rentpro_admin.registered_users`

### 2. 小程序配置
- **配置文件**: `config.js`
  ```javascript
  export default {
    isMock: false,
    baseUrl: 'http://localhost:8002/api/v1',
  };
  ```

## 🧪 测试步骤

### Step 1: 启动后端服务
```bash
cd ../rentpro-admin-main
go run main.go api
# 或者
./rentpro-admin api
```
确认服务运行在 http://localhost:8002

### Step 2: 编译小程序
1. 打开微信开发者工具
2. 导入 `jingjiren-v` 项目
3. 构建 npm
4. 编译项目

### Step 3: 测试登录流程
1. 点击"微信授权登录"按钮
2. 确认"开发模式"弹窗
3. 观察控制台日志：
   - 生成的伪用户信息
   - 发送到后端的数据
   - 后端返回的响应

### Step 4: 验证后端数据
1. 打开后端管理系统: http://localhost:8002
2. 进入"用户业务" → "注册用户"页面
3. 查看是否有新注册的用户记录

## 🔍 预期结果

### 成功场景
- 小程序显示"注册成功"或"登录成功"提示
- 跳转到首页
- "我的"页面显示用户信息
- 后端管理系统中出现新的注册用户记录

### 失败场景（回退到模拟模式）
- 后端接口不可用时自动回退
- 显示"模拟注册成功"提示
- 仍然可以正常使用小程序功能

## 📊 数据验证点

### 用户信息映射
| 小程序字段 | 后端字段 | 示例值 |
|------------|----------|--------|
| nickName | nick_name | "微信用户_3456_7892" |
| avatarUrl | avatar_url | "/static/head/avatar1.png" |
| gender | gender | 1 (男) / 2 (女) |
| country | country | "中国" |
| province | province | "北京" |
| city | city | "北京" |
| language | language | "zh_CN" |
| code | platform_user_id | "mock_openid_xxx" |
| - | platform | "wechat_miniprogram" |
| - | status | "active" |
| - | login_count | 1 |

## 🐛 常见问题

### 1. 网络连接失败
- 检查后端服务是否启动
- 确认端口 8002 是否被占用
- 检查防火墙设置

### 2. 数据格式错误
- 检查小程序发送的数据格式
- 确认后端接口参数要求
- 查看控制台错误日志

### 3. 数据库连接问题
- 确认 MySQL 服务运行
- 检查数据库连接配置
- 验证 `registered_users` 表结构

## 📝 测试记录模板

```
测试时间: ___________
测试人员: ___________

[ ] 后端服务启动成功
[ ] 小程序编译成功
[ ] 登录请求发送成功
[ ] 后端响应正常
[ ] 用户数据保存成功
[ ] 管理后台显示正常

问题记录:
_________________________
_________________________

解决方案:
_________________________
_________________________
```
