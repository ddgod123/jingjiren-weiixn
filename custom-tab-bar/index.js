const app = getApp();

Component({
  data: {
    value: '', // 初始值设置为空，避免第一次加载时闪烁
    unreadNum: 0, // 未读消息数量
    isLoggedIn: false, // 登录状态
    list: [
      {
        icon: 'home',
        value: 'home',
        label: '首页',
      },
      {
        icon: 'chat',
        value: 'message',
        label: '消息',
      },
      {
        icon: 'dashboard',
        value: 'statis',
        label: '统计',
      },
      {
        icon: 'user',
        value: 'my',
        label: '我的',
      },
    ],
  },
  lifetimes: {
    ready() {
      this.initTabBar();
    },
  },
  
  pageLifetimes: {
    show() {
      this.initTabBar();
    }
  },
  methods: {
    /**
     * 初始化TabBar
     */
    initTabBar() {
      // 更新登录状态
      this.setData({
        isLoggedIn: app.globalData.isLoggedIn
      });
      
      // 检查登录状态，未登录时隐藏TabBar
      if (!app.globalData.isLoggedIn) {
        return;
      }
      
      const pages = getCurrentPages();
      const curPage = pages[pages.length - 1];
      if (curPage) {
        const nameRe = /pages\/(\w+)\/(index|login|loginCode)/.exec(curPage.route);
        if (nameRe === null) return;
        if (nameRe[1] && nameRe) {
          this.setData({
            value: nameRe[1],
          });
        }
      }

      // 同步全局未读消息数量
      this.setUnreadNum(app.globalData.unreadNum);
      app.eventBus.on('unread-num-change', (unreadNum) => {
        this.setUnreadNum(unreadNum);
      });
    },

    handleChange(e) {
      const { value } = e.detail;
      
      // 检查登录状态
      if (!app.globalData.isLoggedIn) {
        wx.reLaunch({
          url: '/pages/login/login'
        });
        return;
      }
      
      wx.switchTab({ url: `/pages/${value}/index` });
    },

    /** 设置未读消息数量 */
    setUnreadNum(unreadNum) {
      this.setData({ unreadNum });
    },
  },
});
