const request = require('../../../api/request').default;
const useToastBehavior = require('../../../behaviors/useToast').default;
const AuthUtil = require('../../../utils/auth');

Page({
  behaviors: [useToastBehavior],

  data: {
    // 表单数据
    formData: {
      realName: '',
      phone: '',
      buildingId: '',
      buildingName: '',
      companyName: '',
      licenseNo: ''
    },
    
    // 选择器相关
    showBuilding: false,
    buildingIndex: [],
    
    // 楼盘选项
    buildingOptions: [],
    
    // 提交状态
    submitting: false,
    canSubmit: false
  },

  onLoad() {
    this.loadBuildingList();
  },

  // 加载楼盘列表
  async loadBuildingList() {
    try {
      wx.showLoading({ title: '加载楼盘...' });
      
      // 调用后端API获取楼盘列表
      const response = await request('/buildings-for-application', 'GET');
      const result = response.data; // 获取实际的响应数据
      
      if (result.code === 200) {
        // 转换为选择器需要的格式 - TDesign picker需要的格式
        const buildingOptions = result.data.map((building, index) => ({
          label: `${building.name} (${building.address})`,
          value: building.id
        }));
        
        console.log('设置楼盘选项:', buildingOptions);
        
        this.setData({
          buildingOptions
        }, () => {
          console.log('设置完成后的data:', this.data.buildingOptions);
        });
      } else {
        throw new Error(result.message || '获取楼盘列表失败');
      }
      
      wx.hideLoading();
    } catch (error) {
      console.error('加载楼盘列表失败:', error);
      wx.hideLoading();
      this.onShowToast('#t-toast', error.message || '加载楼盘列表失败');
    }
  },

  // 输入框变化处理
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    }, () => {
      this.validateForm();
    });
  },


  // 显示楼盘选择器
  showBuildingPicker() {
    this.setData({
      showBuilding: true
    });
  },

  // 楼盘选择确认
  onBuildingChange(e) {
    console.log('picker change event:', e.detail);
    const { value } = e.detail;
    console.log('selected value:', value);
    console.log('available options:', this.data.buildingOptions);
    
    const selectedOption = this.data.buildingOptions[value[0]];
    console.log('selected option:', selectedOption);
    
    this.setData({
      showBuilding: false,
      buildingIndex: value,
      'formData.buildingId': selectedOption.value, // 使用value作为ID
      'formData.buildingName': selectedOption.label
    }, () => {
      this.validateForm();
    });
  },

  // 楼盘选择取消
  onBuildingCancel() {
    this.setData({
      showBuilding: false
    });
  },

  // 表单验证
  validateForm() {
    const { formData } = this.data;
    const canSubmit = formData.realName.trim() && 
                     formData.phone.trim() && 
                     formData.buildingId;
    
    this.setData({
      canSubmit
    });
  },

  // 提交申请
  async onSubmit() {
    if (!this.data.canSubmit || this.data.submitting) {
      return;
    }

    // 表单验证
    const { formData } = this.data;
    
    if (!formData.realName.trim()) {
      this.onShowToast('#t-toast', '请输入真实姓名');
      return;
    }
    
    if (!formData.phone.trim()) {
      this.onShowToast('#t-toast', '请输入手机号码');
      return;
    }
    
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      this.onShowToast('#t-toast', '请输入正确的手机号码');
      return;
    }
    
    if (!formData.buildingId) {
      this.onShowToast('#t-toast', '请选择申请楼盘');
      return;
    }

    // 确认提交
    const confirmResult = await this.showConfirmDialog();
    if (!confirmResult) {
      return;
    }

    this.setData({ submitting: true });

    try {
      // 获取用户信息
      const loginStatus = AuthUtil.getLoginStatus();
      if (!loginStatus.isLoggedIn || !loginStatus.userInfo) {
        throw new Error('用户未登录');
      }
      const userInfo = loginStatus.userInfo;

      // 准备提交数据
      const submitData = {
        userId: userInfo.id || userInfo.openid,
        realName: formData.realName.trim(),
        phone: formData.phone.trim(),
        buildingId: formData.buildingId,
        companyName: formData.companyName.trim(),
        licenseNo: formData.licenseNo.trim()
      };

      console.log('提交经纪人申请:', submitData);

      // 调用后端API提交申请
      const response = await request('/broker-applications', 'POST', submitData);
      const result = response.data; // 获取实际的响应数据

      if (result.code !== 200) {
        throw new Error(result.message || '提交申请失败');
      }

      // 提交成功
      wx.showModal({
        title: '申请提交成功',
        content: '您的经纪人申请已提交，我们将在1-3个工作日内完成审核，请耐心等待。',
        showCancel: false,
        confirmText: '我知道了',
        success: () => {
          wx.navigateBack();
        }
      });

    } catch (error) {
      console.error('提交申请失败:', error);
      this.onShowToast('#t-toast', error.message || '提交失败，请重试');
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 显示确认对话框
  showConfirmDialog() {
    return new Promise((resolve) => {
      wx.showModal({
        title: '确认提交',
        content: '请确认您填写的信息准确无误，提交后暂不支持修改。',
        confirmText: '确认提交',
        cancelText: '再检查一下',
        success: (res) => {
          resolve(res.confirm);
        }
      });
    });
  },


  // 返回按钮处理
  onBack() {
    if (this.hasFormData()) {
      wx.showModal({
        title: '确认离开',
        content: '您填写的信息尚未提交，确认离开吗？',
        confirmText: '确认离开',
        cancelText: '继续填写',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  // 检查是否有表单数据
  hasFormData() {
    const { formData } = this.data;
    return formData.realName || formData.phone || 
           formData.companyName || formData.licenseNo;
  }
});
