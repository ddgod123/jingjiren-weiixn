// 测试小程序登录流程的完整脚本
const http = require('http');

// 模拟多个不同的用户进行测试
const testUsers = [
  {
    code: 'test_code_001',
    nickName: '测试用户_001_小明',
    avatarUrl: '/static/head/avatar1.png',
    gender: 1,
    country: '中国',
    province: '北京',
    city: '北京',
    language: 'zh_CN'
  },
  {
    code: 'test_code_002', 
    nickName: '测试用户_002_小红',
    avatarUrl: '/static/head/avatar2.png',
    gender: 2,
    country: '中国',
    province: '上海',
    city: '上海',
    language: 'zh_CN'
  },
  {
    code: 'test_code_003',
    nickName: '测试用户_003_小李',
    avatarUrl: '/static/head/avatar3.png',
    gender: 1,
    country: '中国',
    province: '广东',
    city: '深圳',
    language: 'zh_CN'
  }
];

// 发送登录请求
function sendLoginRequest(userData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(userData);
    
    const options = {
      hostname: 'localhost',
      port: 8002,
      path: '/api/v1/auth/wechat/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const responseData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            user: userData
          });
        } catch (error) {
          reject({ error: error.message, rawData: data, user: userData });
        }
      });
    });

    req.on('error', (error) => {
      reject({ error: error.message, user: userData });
    });

    req.write(postData);
    req.end();
  });
}

// 获取用户统计信息
function getUserStats() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8002,
      path: '/api/v1/user-business/registered-users/stats',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const responseData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: responseData });
        } catch (error) {
          reject({ error: error.message, rawData: data });
        }
      });
    });

    req.on('error', (error) => {
      reject({ error: error.message });
    });

    req.end();
  });
}

// 获取用户列表
function getUserList(page = 1, pageSize = 10) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8002,
      path: `/api/v1/user-business/registered-users?page=${page}&pageSize=${pageSize}`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const responseData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: responseData });
        } catch (error) {
          reject({ error: error.message, rawData: data });
        }
      });
    });

    req.on('error', (error) => {
      reject({ error: error.message });
    });

    req.end();
  });
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试小程序登录流程...\n');

  // 1. 获取当前统计信息
  try {
    console.log('📊 获取当前用户统计信息...');
    const statsResult = await getUserStats();
    if (statsResult.statusCode === 200) {
      console.log('✅ 当前统计:', statsResult.data.data);
    } else {
      console.log('❌ 获取统计失败:', statsResult.data);
    }
  } catch (error) {
    console.log('❌ 获取统计信息失败:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 2. 测试用户登录
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    console.log(`👤 测试用户 ${i + 1}: ${user.nickName}`);
    console.log('📤 发送数据:', user);

    try {
      const result = await sendLoginRequest(user);
      
      if (result.statusCode === 200 && result.data.code === 200) {
        console.log('✅ 登录成功!');
        console.log('👤 用户ID:', result.data.data.user.id);
        console.log('🏷️ Token:', result.data.data.token.substring(0, 20) + '...');
        console.log('📊 登录次数:', result.data.data.user.loginCount);
      } else {
        console.log('❌ 登录失败:', result.data.message);
      }
    } catch (error) {
      console.log('❌ 请求失败:', error.error);
    }

    console.log('\n' + '-'.repeat(30) + '\n');

    // 添加延迟，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 3. 获取更新后的统计信息
  try {
    console.log('📊 获取更新后的用户统计信息...');
    const statsResult = await getUserStats();
    if (statsResult.statusCode === 200) {
      console.log('✅ 更新后统计:', statsResult.data.data);
    } else {
      console.log('❌ 获取统计失败:', statsResult.data);
    }
  } catch (error) {
    console.log('❌ 获取统计信息失败:', error);
  }

  // 4. 获取用户列表
  try {
    console.log('\n📋 获取用户列表...');
    const listResult = await getUserList(1, 10);
    if (listResult.statusCode === 200) {
      console.log('✅ 用户列表 (前10条):');
      listResult.data.data.list.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.nickName} (ID: ${user.id}, 平台: ${user.platform}, 登录: ${user.loginCount}次)`);
      });
      console.log(`📈 总用户数: ${listResult.data.data.total}`);
    } else {
      console.log('❌ 获取用户列表失败:', listResult.data);
    }
  } catch (error) {
    console.log('❌ 获取用户列表失败:', error);
  }

  console.log('\n🎉 测试完成!');
}

// 运行测试
runTests().catch(console.error);
