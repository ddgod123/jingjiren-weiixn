# 小程序注册功能测试指南

## 📋 测试目标

验证小程序伪微信注册功能是否正常工作，确保：
1. 小程序能生成伪用户信息（包含随机手机号和序号昵称）
2. 用户信息能成功注册到后端数据库
3. 后端管理页面能正确显示新注册用户

## 🔧 已优化的功能

### 1. 伪用户信息优化
- **昵称格式**: `微信用户{序号}` (如: 微信用户12345)
- **手机号**: 随机生成11位手机号 (138/139/158/159/188/189/178/198开头)
- **识别标识**: `mock_openid_{时间戳后4位}_{随机字符串}`

### 2. 用户识别标识规则
```javascript
// 昵称: 微信用户 + 5位序号
nickName: `微信用户${时间戳后3位}${随机数后2位}`

// 手机号: 随机生成
phoneNumber: "138xxxxxxxx" 

// 平台用户ID: 
platformUserId: "mock_openid_1234_abcdef"
```

## 🧪 测试步骤

### 步骤1: 检查当前用户数据
```bash
curl -X GET "http://localhost:8002/api/v1/user-business/registered-users/stats" | jq
```

### 步骤2: 在小程序中测试注册
1. 打开微信开发者工具
2. 加载 jingjiren-v 小程序项目
3. 点击"微信授权登录"按钮
4. 观察控制台日志输出

### 步骤3: 验证后端数据
```bash
# 查看最新注册用户
curl -X GET "http://localhost:8002/api/v1/user-business/registered-users?page=1&size=3" | jq '.data.list[0:2] | .[] | {id, nickName, phoneNumber, platformUserId, createdAt}'
```

### 步骤4: 检查前端管理页面
1. 访问后端管理系统
2. 进入"用户业务" -> "注册用户"页面
3. 验证新用户是否显示

## 📊 预期结果

### 新注册用户应包含：
```json
{
  "id": 26,
  "nickName": "微信用户12345",
  "phoneNumber": "13812345678",
  "platformUserId": "mock_openid_1234_abcdef",
  "platform": "wechat_miniprogram",
  "gender": 1,
  "city": "北京",
  "country": "中国",
  "createdAt": "2025-09-13T18:30:00+08:00"
}
```

## 🔍 识别标识说明

### 伪用户特征
- **昵称**: 以"微信用户"开头 + 5位数字序号
- **手机号**: 随机生成的11位手机号
- **platformUserId**: 以"mock_openid_"开头
- **platform**: "wechat_miniprogram"

### 与真实用户区别
- 真实用户：platformUserId 通常是 "wx_openid_xxx"
- 伪用户：platformUserId 是 "mock_openid_xxx"

## 🚀 测试验证

现在可以开始测试了！按照上述步骤进行验证。
