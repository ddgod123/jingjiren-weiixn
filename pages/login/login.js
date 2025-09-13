// pages/login/login.js
// const AuthUtil = require('../../utils/auth');

Page({
  data: {
    isWechatLoading: false
  },

  onLoad() {
    console.log('登录页面加载成功');
    this.checkLoginStatus();
  },

  /**
   * 检查登录状态 - 暂时简化
   */
  checkLoginStatus() {
    console.log('检查登录状态 - 暂时跳过');
  },

  /**
   * 微信授权登录 - 开发阶段使用伪用户模拟
   */
  handleWechatLogin() {
    console.log('🚀 点击微信授权登录按钮');
    
    if (this.data.isWechatLoading) return;
    this.setData({ isWechatLoading: true });

    // 开发阶段：直接生成伪微信用户
              wx.showModal({
      title: '开发模式',
      content: '当前为开发阶段，将生成伪微信用户进行测试',
                showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
                success: (modalRes) => {
                  if (modalRes.confirm) {
          // 生成伪微信用户并登录
          this.generateMockWechatUser();
        } else {
          this.setData({ isWechatLoading: false });
        }
      },
      fail: () => {
        this.setData({ isWechatLoading: false });
      }
    });
  },

  /**
   * 生成伪微信用户
   */
  generateMockWechatUser() {
    console.log('📱 生成伪微信用户');
    
    // 1. 生成伪微信用户信息
    const mockUser = this.createMockWechatUser();
    console.log('👤 生成的伪用户:', mockUser);
    
    // 2. 模拟获取微信code
    const mockCode = this.generateMockCode();
    console.log('🔑 生成的模拟code:', mockCode);
    
    // 3. 模拟注册到后端
    this.registerMockUserToBackend(mockUser, mockCode);
  },

  /**
   * 创建伪微信用户信息
   */
  createMockWechatUser() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 9999) + 1000;
    
    // 生成序号：基于时间戳后3位和随机数的简短标识
    const serialNumber = `${String(timestamp).slice(-3)}${String(random).slice(-2)}`;
    
    // 伪微信用户名字规则：微信用户+序号
    const nickName = `微信用户${serialNumber}`;
    
    // 随机选择头像
    const avatars = [
      '/static/head/avatar1.png',
      '/static/head/avatar2.png',
      '/static/head/avatar3.png',
      '/static/head/avatar4.png',
      '/static/head/avatar5.png'
    ];
    const avatarUrl = avatars[Math.floor(Math.random() * avatars.length)];
    
    // 随机性别
    const gender = Math.random() > 0.5 ? 1 : 2; // 1:男 2:女
    
    // 随机城市
    const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安'];
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    // 生成随机手机号（以138开头，后面8位随机）
    const generateRandomPhone = () => {
      const prefixes = ['138', '139', '158', '159', '188', '189', '178', '198'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      let suffix = '';
      for (let i = 0; i < 8; i++) {
        suffix += Math.floor(Math.random() * 10);
      }
      return prefix + suffix;
    };
    
    return {
      nickName: nickName,
      avatarUrl: avatarUrl,
      phoneNumber: generateRandomPhone(), // 添加随机手机号
      gender: gender,
      city: city,
      province: city === '北京' ? '北京' : city === '上海' ? '上海' : '广东',
      country: '中国',
      language: 'zh_CN',
      // 伪openid规则：mock_openid_时间戳后4位_随机字符串
      openid: `mock_openid_${timestamp.toString().slice(-4)}_${random}`,
      // 伪unionid
      unionid: `mock_unionid_${timestamp.toString().slice(-4)}_${random}`,
      // 登录时间
      loginTime: timestamp,
      loginType: 'mock_wechat'
    };
  },

  /**
   * 生成模拟的微信code
   */
  generateMockCode() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `mock_code_${timestamp}_${random}`;
  },

  /**
   * 注册用户到后端（真实接口）
   */
  async registerMockUserToBackend(mockUser, mockCode) {
    console.log('📡 注册用户到后端');
    
    try {
      // 准备后端接口需要的数据格式
      const loginData = {
        code: mockCode,
        nickName: mockUser.nickName,
        avatarUrl: mockUser.avatarUrl,
        phoneNumber: mockUser.phoneNumber || '',
        gender: mockUser.gender,
        country: mockUser.country,
        province: mockUser.province,
        city: mockUser.city,
        language: mockUser.language
      };
      
      console.log('📤 发送到后端的数据:', loginData);
      
      // 调用后端微信登录接口
      const request = require('../../api/request.js').default;
      const response = await request('/auth/wechat/login', 'POST', loginData);
      
      console.log('✅ 后端注册响应:', response);
      
      // 处理request.js返回的数据结构 {statusCode, data}
      const responseData = response.data;
      
      if (response.statusCode === 200 && responseData.code === 200) {
        // 处理登录成功
        await this.processWechatLogin({
          code: mockCode,
          userInfo: mockUser,
          backendResponse: {
            success: true,
            data: {
              token: responseData.data.token,
              userInfo: {
                ...mockUser,
                userId: responseData.data.user.id,
                registeredUserId: responseData.data.user.id,
                platform: responseData.data.user.platform,
                status: responseData.data.user.status,
                loginCount: responseData.data.user.loginCount,
                lastLoginAt: responseData.data.user.lastLoginAt
              }
            },
            message: responseData.message || '注册成功'
          }
        });
      } else {
        throw new Error(responseData?.message || '注册失败');
      }
      
    } catch (error) {
      console.error('❌ 后端注册失败:', error);
      
      // 检查是否是域名白名单错误
      if (error.errMsg && error.errMsg.includes('url not in domain list')) {
        wx.showModal({
          title: '网络配置提示',
          content: '检测到域名校验错误，请在微信开发者工具中：\n1. 点击右上角"详情"\n2. 勾选"不校验合法域名"\n3. 重新编译项目',
          showCancel: false,
          confirmText: '我知道了'
        });
      }
      
      // 如果后端接口失败，回退到模拟模式
      console.log('🔄 回退到模拟模式');
      await this.fallbackToMockRegistration(mockUser, mockCode);
    }
  },

  /**
   * 回退到模拟注册（当后端接口不可用时）
   */
  async fallbackToMockRegistration(mockUser, mockCode) {
    console.log('📱 使用模拟注册模式');
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟后端返回的用户ID
    const userId = `mock_user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // 模拟后端注册成功
    const backendResponse = {
      success: true,
      data: {
        userId: userId,
        token: `mock_token_${Date.now()}_${Math.random().toString(36)}`,
        userInfo: {
          ...mockUser,
          userId: userId,
          registeredUserId: userId,
          platform: 'wechat_miniprogram',
          status: 'active',
          registrationTime: Date.now(),
          isVip: false,
          level: 1,
          points: 100
        }
      },
      message: '模拟注册成功'
    };
    
    console.log('✅ 模拟注册响应:', backendResponse);
    
    // 处理登录成功
    await this.processWechatLogin({
      code: mockCode,
      userInfo: mockUser,
      backendResponse: backendResponse
    });
  },

  /**
   * 处理微信登录数据 - 支持伪用户
   */
  async processWechatLogin(loginData) {
    console.log('🔄 处理微信登录数据:', loginData);
    
    try {
    let userInfo;
      let token;
      const timestamp = Date.now();
      
      // 检查是否有后端响应（伪用户模式）
      if (loginData.backendResponse) {
        console.log('📱 使用伪用户模式');
        const response = loginData.backendResponse;
        token = response.data.token;
        userInfo = response.data.userInfo;
      } else {
        // 处理真实微信登录数据
        console.log('🌐 处理真实微信登录数据');
        token = `wechat_token_${timestamp}`;
        
    if (loginData.userInfo) {
      userInfo = {
        ...loginData.userInfo,
        loginTime: timestamp,
        loginType: 'wechat'
      };
          
          // 如果有加密数据，保存供后端使用
          if (loginData.encryptedData && loginData.iv) {
            console.log('💾 保存加密数据供后端使用');
            wx.setStorageSync('encrypted_data', {
              encryptedData: loginData.encryptedData,
              iv: loginData.iv,
              signature: loginData.signature,
              code: loginData.code
            });
          }
    } else {
      // 使用默认用户信息
      userInfo = {
        nickName: '微信用户',
            avatarUrl: '/static/head/avatar1.png',
        gender: 0,
        loginTime: timestamp,
        loginType: 'wechat'
      };
    }
      }
      
      console.log('💾 保存登录信息到本地');
      console.log('🏷️ Token:', token);
      console.log('👤 用户信息:', userInfo);
      
      // 保存登录信息到本地存储
      wx.setStorageSync('access_token', token);
      wx.setStorageSync('user_info', userInfo);
      wx.setStorageSync('last_login_time', timestamp);

      
      // 更新全局状态
      const app = getApp();
      if (app && app.setLoginStatus) {
        app.setLoginStatus(true, userInfo);
    }

    // 显示登录成功提示
      const userType = userInfo.loginType === 'mock_wechat' ? '伪用户' : '微信用户';
      const successMessage = `${userType}登录成功`;
      
    wx.showToast({
        title: successMessage,
      icon: 'success',
      duration: 2000
    });

    // 安全跳转到首页
    const navigateToHome = () => {
      try {
        console.log('🏠 跳转到首页');
        wx.switchTab({
          url: '/pages/home/index',
          success: () => {
            console.log('✅ switchTab跳转成功');
          },
          fail: (err) => {
            console.warn('⚠️ switchTab失败，尝试reLaunch:', err);
            // 备用方案：使用reLaunch
            wx.reLaunch({
              url: '/pages/home/index',
              success: () => {
                console.log('✅ reLaunch跳转成功');
              },
              fail: (err2) => {
                console.error('❌ 所有跳转方式都失败:', err2);
              }
            });
          }
        });
      } catch (error) {
        console.error('❌ 跳转异常:', error);
      }
    };

    // 短暂延迟后跳转，让用户看到成功提示
    setTimeout(navigateToHome, 800);
      
    } catch (error) {
      console.error('❌ 处理登录失败:', error);
      this.showLoginError('登录处理失败: ' + error.message);
    } finally {
      this.setData({ isWechatLoading: false });
    }
  },

  /**
   * 发送登录数据到服务器（示例）
   */
  sendToServer(data) {
    console.log('发送数据到服务器:', data);
    // 实际项目中的实现：
    // wx.request({
    //   url: 'https://your-server.com/api/wechat/login',
    //   method: 'POST',
    //   data: data,
    //   success: (res) => {
    //     console.log('服务器响应:', res.data);
    //     // 处理服务器返回的 openid, session_key 等
    //   },
    //   fail: (err) => {
    //     console.error('服务器请求失败:', err);
    //   }
    // });
  },

  /**
   * 显示授权提示弹窗
   */
  showAuthModal() {
    return new Promise((resolve) => {
      wx.showModal({
        title: '授权提示',
        content: '为了提供更好的服务体验，建议您授权获取头像和昵称信息',
        showCancel: true,
        cancelText: '基础登录',
        confirmText: '重新授权',
        success: resolve,
        fail: () => resolve({ confirm: false })
      });
    });
  },

  /**
   * 显示登录错误
   */
  showLoginError(message) {
    wx.showToast({
      title: message || '登录失败，请重试',
      icon: 'error',
      duration: 3000
    });
    this.setData({ isWechatLoading: false });
  },

  /**
   * 页面分享
   */
  onShareAppMessage() {
    return {
      title: '经纪人助手 - 专业的房产经纪服务平台',
      path: '/pages/login/login'
    };
  }
});