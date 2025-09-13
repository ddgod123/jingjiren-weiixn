-- 检查注册用户表数据的SQL查询
-- 可以在MySQL客户端或phpMyAdmin中执行

-- 1. 查看表结构
DESCRIBE registered_users;

-- 2. 查看总用户数
SELECT COUNT(*) as total_users FROM registered_users WHERE deleted_at IS NULL;

-- 3. 按平台分组统计
SELECT 
    platform,
    COUNT(*) as count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM registered_users 
WHERE deleted_at IS NULL 
GROUP BY platform;

-- 4. 查看最近10条用户记录
SELECT 
    id,
    nick_name,
    platform,
    platform_user_id,
    status,
    login_count,
    last_login_at,
    created_at
FROM registered_users 
WHERE deleted_at IS NULL 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. 查看微信小程序用户
SELECT 
    id,
    nick_name,
    avatar_url,
    platform_user_id,
    gender,
    country,
    province,
    city,
    status,
    login_count,
    created_at
FROM registered_users 
WHERE platform = 'wechat_miniprogram' 
    AND deleted_at IS NULL 
ORDER BY created_at DESC;

-- 6. 查看今天新注册的用户
SELECT 
    id,
    nick_name,
    platform,
    created_at
FROM registered_users 
WHERE DATE(created_at) = CURDATE() 
    AND deleted_at IS NULL 
ORDER BY created_at DESC;

-- 7. 检查是否有重复的platform_user_id
SELECT 
    platform,
    platform_user_id,
    COUNT(*) as count
FROM registered_users 
WHERE deleted_at IS NULL 
GROUP BY platform, platform_user_id 
HAVING COUNT(*) > 1;

-- 8. 查看用户统计信息（与后端API返回的数据对比）
SELECT 
    COUNT(*) as totalUsers,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as activeUsers,
    COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as newUsersToday,
    COUNT(CASE WHEN platform = 'wechat_miniprogram' THEN 1 END) as wechatUsers,
    COUNT(CASE WHEN platform = 'app' THEN 1 END) as appUsers,
    COUNT(CASE WHEN platform = 'web' THEN 1 END) as webUsers,
    COUNT(CASE WHEN platform = 'h5' THEN 1 END) as h5Users
FROM registered_users 
WHERE deleted_at IS NULL;
