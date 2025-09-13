import request from './request';

/**
 * 微信登录相关API
 */
class AuthAPI {
  /**
   * 微信登录
   * @param {string} code - 微信登录凭证
   * @returns {Promise} 返回登录结果
   */
  static async wechatLogin(code) {
    try {
      const response = await request('/auth/wechat/login', {
        method: 'POST',
        data: {
          code: code
        }
      });

      const { token, userInfo, openid, unionid } = response.data;
      
      // 保存token到本地存储
      if (token) {
        wx.setStorageSync('access_token', token);
      }
      
      // 保存用户基础信息
      if (userInfo) {
        wx.setStorageSync('user_info', userInfo);
      }
      
      // 保存openid
      if (openid) {
        wx.setStorageSync('openid', openid);
      }
      
      // 保存unionid（如果有）
      if (unionid) {
        wx.setStorageSync('unionid', unionid);
      }

      return {
        success: true,
        token,
        userInfo,
        openid,
        unionid
      };

    } catch (error) {
      console.error('微信登录失败:', error);
      return {
        success: false,
        error: error.message || '登录失败'
      };
    }
  }

  /**
   * 更新用户信息
   * @param {Object} userInfo - 用户信息
   * @returns {Promise} 返回更新结果
   */
  static async updateUserInfo(userInfo) {
    try {
      const response = await request('/auth/user/update', {
        method: 'POST',
        data: userInfo
      });

      // 更新本地存储的用户信息
      const existingUserInfo = wx.getStorageSync('user_info') || {};
      const updatedUserInfo = {
        ...existingUserInfo,
        ...userInfo
      };
      wx.setStorageSync('user_info', updatedUserInfo);

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('更新用户信息失败:', error);
      return {
        success: false,
        error: error.message || '更新失败'
      };
    }
  }

  /**
   * 上传用户头像
   * @param {string} avatarUrl - 头像临时文件路径
   * @returns {Promise} 返回上传结果
   */
  static async uploadAvatar(avatarUrl) {
    try {
      const token = wx.getStorageSync('access_token');
      if (!token) {
        throw new Error('未登录');
      }

      const uploadResult = await new Promise((resolve, reject) => {
        wx.uploadFile({
          url: `${request.baseURL}/auth/avatar/upload`,
          filePath: avatarUrl,
          name: 'avatar',
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            if (res.statusCode === 200) {
              resolve(JSON.parse(res.data));
            } else {
              reject(new Error('上传失败'));
            }
          },
          fail: reject
        });
      });

      // 更新本地用户信息中的头像URL
      const userInfo = wx.getStorageSync('user_info') || {};
      userInfo.avatarUrl = uploadResult.data.avatarUrl;
      wx.setStorageSync('user_info', userInfo);

      return {
        success: true,
        avatarUrl: uploadResult.data.avatarUrl
      };

    } catch (error) {
      console.error('上传头像失败:', error);
      return {
        success: false,
        error: error.message || '上传失败'
      };
    }
  }

  /**
   * 检查登录状态
   * @returns {boolean} 是否已登录
   */
  static checkLoginStatus() {
    const token = wx.getStorageSync('access_token');
    return !!token;
  }

  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息
   */
  static getUserInfo() {
    return wx.getStorageSync('user_info') || null;
  }

  /**
   * 退出登录
   */
  static logout() {
    // 清除所有本地存储的登录信息
    wx.removeStorageSync('access_token');
    wx.removeStorageSync('user_info');
    wx.removeStorageSync('openid');
    wx.removeStorageSync('unionid');
    
    // 跳转到登录页
    wx.reLaunch({
      url: '/pages/login/login'
    });
  }

  /**
   * 刷新token
   * @returns {Promise} 返回刷新结果
   */
  static async refreshToken() {
    try {
      const response = await request('/auth/token/refresh', {
        method: 'POST'
      });

      const { token } = response.data;
      if (token) {
        wx.setStorageSync('access_token', token);
      }

      return {
        success: true,
        token
      };

    } catch (error) {
      console.error('刷新token失败:', error);
      // token刷新失败，可能需要重新登录
      this.logout();
      return {
        success: false,
        error: error.message || '刷新失败'
      };
    }
  }

  /**
   * 获取微信授权设置
   * @returns {Promise} 返回授权设置
   */
  static getAuthSettings() {
    return new Promise((resolve) => {
      wx.getSetting({
        success: (res) => {
          resolve(res.authSetting);
        },
        fail: () => {
          resolve({});
        }
      });
    });
  }

  /**
   * 请求特定权限
   * @param {string} scope - 权限范围
   * @returns {Promise} 返回授权结果
   */
  static requestAuth(scope) {
    return new Promise((resolve) => {
      wx.authorize({
        scope: scope,
        success: () => {
          resolve(true);
        },
        fail: () => {
          resolve(false);
        }
      });
    });
  }
}

export default AuthAPI;

// 兼容旧的导出方式
export const wechatLogin = AuthAPI.wechatLogin;
export const updateUserInfo = AuthAPI.updateUserInfo;
export const uploadAvatar = AuthAPI.uploadAvatar;
export const checkLoginStatus = AuthAPI.checkLoginStatus;
export const getUserInfo = AuthAPI.getUserInfo;
export const logout = AuthAPI.logout;
export const refreshToken = AuthAPI.refreshToken;