import request from '~/api/request';
import useToastBehavior from '~/behaviors/useToast';
const AuthUtil = require('../../utils/auth');

Page({
  behaviors: [useToastBehavior],

  data: {
    isLoad: false,
    isLoggedIn: false,
    service: [],
    personalInfo: {},
    userInfo: null,
    lastLoginTime: '',
    gridList: [
      {
        name: '全部发布',
        icon: 'root-list',
        type: 'all',
        url: '',
      },
      {
        name: '审核中',
        icon: 'search',
        type: 'progress',
        url: '',
      },
      {
        name: '已发布',
        icon: 'upload',
        type: 'published',
        url: '',
      },
      {
        name: '草稿箱',
        icon: 'file-copy',
        type: 'draft',
        url: '',
      },
    ],

    settingList: [
      { name: '联系客服', icon: 'service', type: 'service' },
      { name: '设置', icon: 'setting', type: 'setting', url: '/pages/setting/index' },
    ],
  },

  onLoad() {
    // 暂时禁用服务列表请求
    // this.getServiceList();
    console.log('我的页面加载，暂时不请求服务列表');
    this.checkLoginStatus();
  },

  async onShow() {
    await this.checkLoginStatus();
    if (this.data.isLoggedIn) {
      await this.loadUserData();
    }
  },

  /**
   * 检查登录状态 - 支持伪用户显示
   */
  async checkLoginStatus() {
    try {
      // 使用简化的登录状态检查
      const app = getApp();
      const isLoggedIn = app.globalData.isLoggedIn || false;
      const userInfo = app.globalData.userInfo || wx.getStorageSync('user_info') || null;
      
      if (isLoggedIn && userInfo) {
        // 格式化用户信息以便显示
        const displayUserInfo = this.formatUserInfoForDisplay(userInfo);
        
        this.setData({
          isLoggedIn: true,
          userInfo: displayUserInfo,
          lastLoginTime: this.formatLastLoginTime()
        });
        
        console.log('📱 显示用户信息:', displayUserInfo);
      } else {
        this.setData({
          isLoggedIn: false,
          userInfo: null,
          lastLoginTime: ''
        });
      }
      
      console.log('我的页面检查登录状态:', { isLoggedIn, userInfo });
    } catch (error) {
      console.error('检查登录状态失败:', error);
      this.setData({
        isLoggedIn: false,
        userInfo: null,
        lastLoginTime: ''
      });
    }
  },

  /**
   * 格式化用户信息用于显示
   */
  formatUserInfoForDisplay(userInfo) {
    const displayInfo = {
      ...userInfo,
      // 格式化性别显示
      genderText: this.getGenderText(userInfo.gender),
      // 格式化地址显示
      locationText: this.getLocationText(userInfo),
      // 格式化登录类型显示
      loginTypeText: this.getLoginTypeText(userInfo.loginType),
      // 添加用户标识
      userTag: userInfo.loginType === 'mock_wechat' ? '开发测试用户' : '微信用户'
    };
    
    return displayInfo;
  },

  /**
   * 获取性别文本
   */
  getGenderText(gender) {
    switch(gender) {
      case 1: return '男';
      case 2: return '女';
      default: return '未知';
    }
  },

  /**
   * 获取地址文本
   */
  getLocationText(userInfo) {
    if (userInfo.city && userInfo.province) {
      return `${userInfo.province} ${userInfo.city}`;
    } else if (userInfo.city) {
      return userInfo.city;
    } else if (userInfo.province) {
      return userInfo.province;
    }
    return '未知';
  },

  /**
   * 获取登录类型文本
   */
  getLoginTypeText(loginType) {
    switch(loginType) {
      case 'mock_wechat': return '伪微信登录';
      case 'wechat': return '微信登录';
      default: return '未知登录方式';
    }
  },

  /**
   * 加载用户数据
   */
  async loadUserData() {
    console.log('暂时禁用个人信息请求');
    try {
      // 暂时禁用个人信息请求
      // const personalInfo = await this.getPersonalInfo();
      this.setData({
        isLoad: true,
        personalInfo: {} // 使用空对象
      });
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  },

  /**
   * 格式化最后登录时间
   */
  formatLastLoginTime() {
    const loginTime = wx.getStorageSync('last_login_time');
    if (!loginTime) return '';
    
    const now = new Date();
    const login = new Date(loginTime);
    const diff = now - login;
    
    if (diff < 60000) { // 1分钟内
      return '刚刚登录';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 24小时内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return `${Math.floor(diff / 86400000)}天前`;
    }
  },

  getServiceList() {
    // 暂时禁用服务列表请求
    console.log('暂时禁用服务列表请求');
    // request('/api/getServiceList').then((res) => {
    //   const { service } = res.data.data;
    //   this.setData({ service });
    // });
    
    // 使用空数据
    this.setData({ service: [] });
  },

  async getPersonalInfo() {
    const info = await request('/api/genPersonalInfo').then((res) => res.data.data);
    return info;
  },

  onLogin(e) {
    // 由于app.js中已经做了全局登录检查，这里直接跳转
    wx.reLaunch({
      url: '/pages/login/login'
    });
  },

  onNavigateTo() {
    wx.navigateTo({ url: `/pages/my/info-edit/index` });
  },

  /**
   * 编辑用户资料
   */
  onEditProfile() {
    if (!this.data.isLoggedIn) {
      this.onLogin();
      return;
    }
    
    wx.navigateTo({ 
      url: `/pages/my/info-edit/index` 
    });
  },

  /**
   * 退出登录
   */
  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('用户确认退出登录');
          
          // 使用AuthUtil工具进行退出登录
          AuthUtil.logout();
          
          // 更新当前页面状态
          this.setData({
            isLoggedIn: false,
            userInfo: null,
            isLoad: false,
            personalInfo: {},
            lastLoginTime: ''
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 2000
          });
          
          // 延迟跳转到登录页，让用户看到退出成功的提示
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/login/login'
            });
          }, 2000);
        }
      }
    });
  },

  onEleClick(e) {
    const { name, url } = e.currentTarget.dataset.data;
    if (url) return;
    this.onShowToast('#t-toast', name);
  },
});
