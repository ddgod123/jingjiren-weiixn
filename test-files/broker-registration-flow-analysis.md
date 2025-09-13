# 经纪人注册业务流程分析

## 🎯 产品设计逻辑

**核心流程**: 普通微信注册用户 → 申请成为经纪人 → 管理员审核 → 审核通过 → 成为经纪人

## 📋 详细业务流程

### 1. 用户端流程（小程序）

#### 阶段1: 普通用户注册
- ✅ **已完成**: 微信用户通过小程序注册成为普通用户
- ✅ **数据存储**: `registered_users` 表
- ✅ **用户状态**: 普通注册用户

#### 阶段2: 申请成为经纪人
- 🔄 **入口修改**: "我的"页面 "全部发布" → "注册楼盘"
- 🆕 **申请表单页面**: 新建申请表单页面
- 📝 **申请信息**: 姓名、电话、楼盘选择、从业经验等
- 📤 **提交申请**: 调用后端API提交申请

#### 阶段3: 申请状态跟踪
- 📊 **状态显示**: 申请中/审核通过/审核拒绝
- 🔔 **消息通知**: 审核结果通知

### 2. 管理端流程（后端管理系统）

#### 阶段1: 接收申请
- 🆕 **新增菜单**: 用户业务 → 注册申请
- 📋 **申请列表**: 显示所有经纪人申请
- 🔍 **申请详情**: 查看申请人详细信息

#### 阶段2: 审核处理
- ✅ **审核通过**: 将用户添加到经纪人表
- ❌ **审核拒绝**: 记录拒绝原因
- 📧 **结果通知**: 通知申请人审核结果

#### 阶段3: 经纪人管理
- ✅ **审核通过后**: 自动添加到"租赁管理"→"经纪人管理"
- 🏢 **楼盘绑定**: 经纪人与楼盘的关联关系
- 👤 **权限管理**: 经纪人权限和角色管理

## 🗄️ 数据库设计

### 现有表结构分析

#### 1. `registered_users` 表 (已存在)
```sql
- id: 用户ID
- nick_name: 昵称
- phone_number: 手机号
- platform_user_id: 微信openid
- status: 用户状态
```

#### 2. `brokers` 表 (已存在)
```sql
- id: 经纪人ID
- user_id: 关联registered_users.id
- broker_code: 经纪人编号
- real_name: 真实姓名
- phone: 手机号
- status: pending/active/suspended/rejected
- verified_at: 认证时间
```

#### 3. `broker_buildings` 表 (已存在)
```sql
- broker_id: 经纪人ID
- building_id: 楼盘ID
- role: primary/secondary
- status: active/suspended/expired
```

#### 4. 需要新增: `broker_applications` 表
```sql
CREATE TABLE broker_applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '申请用户ID',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) NOT NULL COMMENT '手机号',
    building_id BIGINT COMMENT '申请楼盘ID',
    experience_years INT DEFAULT 0 COMMENT '从业年限',
    company_name VARCHAR(100) COMMENT '所属公司',
    license_no VARCHAR(50) COMMENT '从业资格证号',
    application_reason TEXT COMMENT '申请原因',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by BIGINT COMMENT '审核人ID',
    reviewed_at TIMESTAMP NULL COMMENT '审核时间',
    reject_reason TEXT COMMENT '拒绝原因',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_building_id (building_id),
    FOREIGN KEY (user_id) REFERENCES registered_users(id)
);
```

## 🚀 开发任务清单

### 小程序端修改

#### 1. 修改"我的"页面
- [ ] 将"全部发布"文本改为"注册楼盘"
- [ ] 修改图标和跳转逻辑

#### 2. 创建申请表单页面
- [ ] 新建页面: `pages/broker/apply/index`
- [ ] 表单字段: 姓名、电话、楼盘选择、从业经验等
- [ ] 楼盘选择: 调用后端楼盘列表API
- [ ] 表单验证和提交逻辑

#### 3. 申请状态页面
- [ ] 显示申请状态
- [ ] 审核结果展示
- [ ] 重新申请功能

### 后端管理系统修改

#### 1. 数据库迁移
- [ ] 创建 `broker_applications` 表
- [ ] 添加相关索引和外键

#### 2. 新增API接口
- [ ] `POST /api/v1/broker-applications` - 提交申请
- [ ] `GET /api/v1/broker-applications` - 获取申请列表
- [ ] `PUT /api/v1/broker-applications/{id}/approve` - 审核通过
- [ ] `PUT /api/v1/broker-applications/{id}/reject` - 审核拒绝
- [ ] `GET /api/v1/buildings` - 楼盘列表接口

#### 3. 前端管理页面
- [ ] 新增菜单: 用户业务 → 注册申请
- [ ] 申请列表页面
- [ ] 申请详情页面
- [ ] 审核操作界面

#### 4. 审核流程逻辑
- [ ] 审核通过: 自动创建经纪人记录
- [ ] 更新 `sys_user.is_broker` 字段
- [ ] 创建楼盘绑定关系
- [ ] 发送审核结果通知

## 🔄 业务流程图

```
普通用户
    ↓
点击"注册楼盘"
    ↓
填写申请表单
    ↓
提交申请
    ↓
[后端] 存储申请记录
    ↓
管理员审核
    ↓
    ├── 审核通过
    │   ├── 创建经纪人记录
    │   ├── 更新用户状态
    │   ├── 绑定楼盘权限
    │   └── 发送通过通知
    └── 审核拒绝
        ├── 记录拒绝原因
        └── 发送拒绝通知
```

## 📱 页面设计要点

### 申请表单页面设计
1. **个人信息区**
   - 真实姓名 (必填)
   - 手机号码 (必填，默认填充注册手机号)
   - 从业年限 (选择器: 0-1年、1-3年、3-5年、5年以上)

2. **楼盘信息区**
   - 申请楼盘 (下拉选择，来自后端楼盘表)
   - 申请原因 (文本域，可选)

3. **专业信息区**
   - 所属公司 (可选)
   - 从业资格证号 (可选)

4. **提交按钮**
   - 表单验证
   - 提交确认弹窗

### 管理端审核页面设计
1. **申请列表**
   - 申请人信息
   - 申请楼盘
   - 申请时间
   - 当前状态
   - 操作按钮

2. **审核详情**
   - 申请人完整信息
   - 申请楼盘详情
   - 审核操作区
   - 审核历史记录

这个设计方案完整覆盖了从普通用户到经纪人的转换流程，确保了数据的一致性和业务逻辑的完整性。
