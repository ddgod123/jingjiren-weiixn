import Message from 'tdesign-miniprogram/message/index';
import request from '~/api/request';

// 获取应用实例
// const app = getApp()

Page({
  data: {
    enable: false,
    swiperList: [],
    cardInfo: [],
    // 发布
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
  },
  // 生命周期
  async onReady() {
    console.log('首页加载完成，暂时不请求远程数据');
    
    // 暂时禁用数据请求，使用空数据
    // const [cardRes, swiperRes] = await Promise.all([
    //   request('/home/cards').then((res) => res.data),
    //   request('/home/swipers').then((res) => res.data),
    // ]);

    this.setData({
      cardInfo: [], // 暂时使用空数据
      focusCardInfo: [], // 暂时使用空数据
      swiperList: [], // 暂时使用空数据
    });
  },
  onLoad(option) {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      });
    }
    if (option.oper) {
      let content = '';
      if (option.oper === 'release') {
        content = '发布成功';
      } else if (option.oper === 'save') {
        content = '保存成功';
      }
      this.showOperMsg(content);
    }
  },
  onRefresh() {
    this.refresh();
  },
  async refresh() {
    console.log('首页刷新，暂时不请求远程数据');
    this.setData({
      enable: true,
    });
    
    // 暂时禁用数据请求
    // const [cardRes, swiperRes] = await Promise.all([
    //   request('/home/cards').then((res) => res.data),
    //   request('/home/swipers').then((res) => res.data),
    // ]);

    setTimeout(() => {
      this.setData({
        enable: false,
        cardInfo: [], // 暂时使用空数据
        swiperList: [], // 暂时使用空数据
      });
    }, 1500);
  },
  showOperMsg(content) {
    Message.success({
      context: this,
      offset: [120, 32],
      duration: 4000,
      content,
    });
  },
  goRelease() {
    wx.navigateTo({
      url: '/pages/release/index',
    });
  },
});
