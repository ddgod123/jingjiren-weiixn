// app.js
import config from './config';
import Mock from './mock/index';
import createBus from './utils/eventBus';
import { connectSocket, fetchUnreadNum } from './mock/chat';
const AuthUtil = require('./utils/auth');

if (config.isMock) {
  Mock();
}

App({
  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus();
    
    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate((res) => {
      // console.log(res.hasUpdate)
    });

    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        },
      });
    });

    // 只有登录后才初始化这些功能
    if (this.globalData.isLoggedIn) {
      this.getUnreadNum();
      this.connect();
    }
  },

  onShow() {
    // 每次显示小程序时检查登录状态（但不强制跳转）
    this.updateLoginStatus();
  },

  /**
   * 检查登录状态（启动时使用，会进行页面跳转）
   */
  async checkLoginStatus() {
    try {
      const isLoggedIn = await AuthUtil.checkSession();
      const loginStatus = AuthUtil.getLoginStatus();
      
      this.globalData.isLoggedIn = isLoggedIn;
      this.globalData.userInfo = loginStatus.userInfo;
      
      // 获取当前页面路径
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentRoute = currentPage ? currentPage.route : '';
      
      console.log('检查登录状态:', {
        isLoggedIn: this.globalData.isLoggedIn,
        currentRoute: currentRoute,
        hasToken: !!loginStatus.token
      });
      
      // 只有在启动时才进行自动跳转
      // 如果已登录且在登录页，跳转到首页
      if (this.globalData.isLoggedIn && currentRoute === 'pages/login/login') {
        console.log('已登录，从登录页跳转到首页');
        wx.switchTab({
          url: '/pages/home/index'
        });
      }
      // 如果未登录且不在登录页，跳转到登录页
      else if (!this.globalData.isLoggedIn && currentRoute !== 'pages/login/login') {
        console.log('未登录，跳转到登录页');
        wx.reLaunch({
          url: '/pages/login/login'
        });
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      // 发生错误时，跳转到登录页
      wx.reLaunch({
        url: '/pages/login/login'
      });
    }
  },

  /**
   * 更新登录状态（不进行页面跳转）
   */
  async updateLoginStatus() {
    try {
      const isLoggedIn = await AuthUtil.checkSession();
      const loginStatus = AuthUtil.getLoginStatus();
      
      this.globalData.isLoggedIn = isLoggedIn;
      this.globalData.userInfo = loginStatus.userInfo;
      
      console.log('更新登录状态:', {
        isLoggedIn: this.globalData.isLoggedIn,
        hasToken: !!loginStatus.token
      });
    } catch (error) {
      console.error('更新登录状态失败:', error);
      this.globalData.isLoggedIn = false;
      this.globalData.userInfo = null;
    }
  },

  /**
   * 设置登录状态
   */
  setLoginStatus(isLoggedIn, userInfo = null) {
    this.globalData.isLoggedIn = isLoggedIn;
    this.globalData.userInfo = userInfo;
    
    if (isLoggedIn) {
      // 登录成功后初始化功能
      this.getUnreadNum();
      this.connect();
      
      // 保存登录时间
      wx.setStorageSync('last_login_time', new Date().toISOString());
    } else {
      // 登出时清理
      this.globalData.unreadNum = 0;
      if (this.globalData.socket && typeof this.globalData.socket.close === 'function') {
        try {
          this.globalData.socket.close();
        } catch (error) {
          console.warn('关闭WebSocket连接失败:', error);
        }
        this.globalData.socket = null;
      }
    }
  },
  globalData: {
    isLoggedIn: false, // 登录状态
    userInfo: null,
    unreadNum: 0, // 未读消息数量
    socket: null, // SocketTask 对象
  },

  /** 全局事件总线 */
  eventBus: createBus(),

  /** 初始化WebSocket */
  connect() {
    const socket = connectSocket();
    socket.onMessage((data) => {
      data = JSON.parse(data);
      if (data.type === 'message' && !data.data.message.read) this.setUnreadNum(this.globalData.unreadNum + 1);
    });
    this.globalData.socket = socket;
  },

  /** 获取未读消息数量 */
  getUnreadNum() {
    fetchUnreadNum().then(({ data }) => {
      this.globalData.unreadNum = data;
      this.eventBus.emit('unread-num-change', data);
    });
  },

  /** 设置未读消息数量 */
  setUnreadNum(unreadNum) {
    this.globalData.unreadNum = unreadNum;
    this.eventBus.emit('unread-num-change', unreadNum);
  },
});
