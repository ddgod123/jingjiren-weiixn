// 测试后端API接口的Node.js脚本
const https = require('https');
const http = require('http');

// 测试数据
const testData = {
  code: 'test_code_123456',
  nickName: '测试用户_9999_1234',
  avatarUrl: '/static/head/avatar1.png',
  phoneNumber: '',
  gender: 1,
  country: '中国',
  province: '北京',
  city: '北京',
  language: 'zh_CN'
};

// 发送POST请求
function testWechatLogin() {
  const postData = JSON.stringify(testData);
  
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

  console.log('🚀 测试后端微信登录接口...');
  console.log('📤 请求地址:', `http://${options.hostname}:${options.port}${options.path}`);
  console.log('📤 请求数据:', testData);

  const req = http.request(options, (res) => {
    console.log(`📥 响应状态码: ${res.statusCode}`);
    console.log(`📥 响应头:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const responseData = JSON.parse(data);
        console.log('✅ 响应数据:', JSON.stringify(responseData, null, 2));
        
        if (res.statusCode === 200 && responseData.code === 200) {
          console.log('🎉 测试成功！用户注册/登录成功');
          console.log('👤 用户ID:', responseData.data.user.id);
          console.log('🏷️ Token:', responseData.data.token);
        } else {
          console.log('❌ 测试失败:', responseData.message);
        }
      } catch (error) {
        console.log('❌ 解析响应数据失败:', error.message);
        console.log('📄 原始响应:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ 请求失败:', error.message);
    console.log('💡 请确保后端服务已启动在端口 8002');
  });

  req.write(postData);
  req.end();
}

// 运行测试
testWechatLogin();
