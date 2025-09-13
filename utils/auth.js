// utils/auth.js - 微信授权登录工具模块
// 参考：https://leleweb.blog.csdn.net/article/details/150204312

/**
 * 微信登录 - 获取code并换取token
 * @returns {Promise<string>} 返回登录token
 */
const login = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async (res) => {
        if (res.code) {
          try {
            console.log('获取微信code成功:', res.code);
            
            // 这里应该发送到真实的后端服务器
            // const { token } = await wxRequest({
            //   url: '/auth/login',
            //   method: 'POST',
            //   data: { code: res.code }
            // });
            
            // 目前使用模拟token
            const token = 'wechat_token_' + Date.now();
            wx.setStorageSync('access_token', token);
            wx.setStorageSync('last_login_time', new Date().toISOString());
            
            resolve(token);
          } catch (error) {
            console.error('登录请求失败:', error);
            reject(error);
          }
        } else {
          reject(new Error('获取微信code失败'));
        }
      },
      fail: (err) => {
        console.error('wx.login调用失败:', err);
        reject(err);
      }
    });
  });
};

/**
 * 检查登录状态和session有效性
 * @returns {Promise<boolean>} 返回是否已登录
 */
const checkSession = () => {
  return new Promise((resolve) => {
    const token = wx.getStorageSync('access_token');
    
    if (!token) {
      console.log('没有登录token');
      resolve(false);
      return;
    }
    
    // 检查微信session是否有效
    wx.checkSession({
      success: () => {
        console.log('微信session有效，用户已登录');
        resolve(true);
      },
      fail: () => {
        console.log('微信session已失效，清除本地登录状态');
        // session失效，清除本地登录信息
        wx.removeStorageSync('access_token');
        wx.removeStorageSync('user_info');
        wx.removeStorageSync('openid');
        wx.removeStorageSync('unionid');
        wx.removeStorageSync('last_login_time');
        resolve(false);
      }
    });
  });
};

/**
 * 获取用户信息
 * @param {string} desc 获取用户信息的用途描述
 * @returns {Promise<Object>} 返回用户信息
 */
const getUserInfo = (desc = '用于完善会员资料') => {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: desc,
      success: async (res) => {
        try {
          console.log('获取用户信息成功:', res.userInfo);
          
          // 保存用户信息到本地
          const userInfo = {
            ...res.userInfo,
            loginTime: Date.now(),
            loginType: 'wechat'
          };
          wx.setStorageSync('user_info', userInfo);
          
          // 这里应该发送加密数据到服务器进行解密和存储
          // const result = await wxRequest({
          //   url: '/auth/userinfo',
          //   method: 'POST',
          //   data: {
          //     encryptedData: res.encryptedData,
          //     iv: res.iv,
          //     signature: res.signature
          //   },
          //   header: {
          //     'Authorization': `Bearer ${wx.getStorageSync('access_token')}`
          //   }
          // });
          
          resolve(userInfo);
        } catch (error) {
          console.error('处理用户信息失败:', error);
          reject(error);
        }
      },
      fail: (err) => {
        console.log('用户拒绝授权或获取用户信息失败:', err);
        reject(err);
      }
    });
  });
};

/**
 * 完整的登录流程
 * @param {boolean} needUserInfo 是否需要获取用户信息
 * @returns {Promise<Object>} 返回登录结果
 */
const performLogin = async (needUserInfo = false) => {
  try {
    // 1. 检查当前登录状态
    const isLoggedIn = await checkSession();
    if (isLoggedIn && !needUserInfo) {
      return {
        success: true,
        token: wx.getStorageSync('access_token'),
        userInfo: wx.getStorageSync('user_info'),
        message: '已登录'
      };
    }
    
    // 2. 执行登录获取token
    const token = await login();
    
    // 3. 如果需要用户信息，获取用户信息
    let userInfo = null;
    if (needUserInfo) {
      try {
        userInfo = await getUserInfo();
      } catch (userInfoError) {
        // 用户拒绝授权，但登录仍然成功
        console.log('用户拒绝授权，使用基础登录');
        userInfo = {
          nickName: '微信用户',
          avatarUrl: '/static/head/avatar1.png',
          gender: 0,
          loginTime: Date.now(),
          loginType: 'wechat'
        };
        wx.setStorageSync('user_info', userInfo);
      }
    }
    
    // 4. 更新全局登录状态
    const app = getApp();
    if (app && app.setLoginStatus) {
      app.setLoginStatus(true, userInfo);
    }
    
    return {
      success: true,
      token: token,
      userInfo: userInfo,
      message: '登录成功'
    };
    
  } catch (error) {
    console.error('登录流程失败:', error);
    return {
      success: false,
      error: error.message || '登录失败',
      message: '登录失败，请重试'
    };
  }
};

/**
 * 退出登录
 */
const logout = () => {
  // 清除所有本地存储的登录信息
  wx.removeStorageSync('access_token');
  wx.removeStorageSync('user_info');
  wx.removeStorageSync('openid');
  wx.removeStorageSync('unionid');
  wx.removeStorageSync('last_login_time');
  
  // 更新全局状态
  const app = getApp();
  if (app && app.setLoginStatus) {
    app.setLoginStatus(false, null);
  }
  
  console.log('已退出登录');
};

/**
 * 获取当前登录状态
 * @returns {Object} 登录状态信息
 */
const getLoginStatus = () => {
  const token = wx.getStorageSync('access_token');
  const userInfo = wx.getStorageSync('user_info');
  
  return {
    isLoggedIn: !!token,
    token: token,
    userInfo: userInfo
  };
};

// 导出所有方法
module.exports = {
  login,
  checkSession,
  getUserInfo,
  performLogin,
  logout,
  getLoginStatus
};
