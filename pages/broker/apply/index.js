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
    
    // 二级选择器相关
    allBuildingList: [], // 所有楼盘数据
    districtList: [], // 区域列表
    currentBuildingList: [], // 当前区域的楼盘列表
    selectedDistrict: '', // 选中的区域
    selectedBuildingId: null, // 选中的楼盘ID
    selectedBuildingData: null, // 选中的楼盘数据
    
    // 提交状态
    submitting: false,
    canSubmit: false
  },

  onLoad() {
    console.log('经纪人申请页面 - onLoad');
    // 延迟执行，避免生命周期冲突
    setTimeout(() => {
      this.loadBuildingList();
    }, 100);
  },

  onShow() {
    console.log('经纪人申请页面 - onShow');
    console.log('当前页面数据状态:', {
      formData: this.data.formData,
      canSubmit: this.data.canSubmit,
      submitting: this.data.submitting,
      districtList: this.data.districtList?.length || 0,
      allBuildingList: this.data.allBuildingList?.length || 0
    });
  },


  // 加载楼盘列表
  async loadBuildingList() {
    try {
      console.log('开始加载楼盘列表...');
      wx.showLoading({ title: '加载楼盘...' });
      
      // 调用后端API获取楼盘列表
      console.log('调用API: /buildings-for-application');
      const response = await request('/buildings-for-application', 'GET');
      console.log('API响应:', response);
      const result = response.data; // 获取实际的响应数据
      console.log('解析结果:', result);
      
      if (result.code === 200) {
        // 保存所有楼盘数据
        const allBuildingList = result.data;
        
        // 按区域分组楼盘数据
        const districtMap = {};
        allBuildingList.forEach(building => {
          if (!districtMap[building.district]) {
            districtMap[building.district] = [];
          }
          districtMap[building.district].push(building);
        });
        
        // 生成区域列表
        const districtList = Object.keys(districtMap).map(district => ({
          district,
          count: districtMap[district].length
        }));
        
        // 默认选择第一个区域
        const firstDistrict = districtList.length > 0 ? districtList[0].district : '';
        const currentBuildingList = firstDistrict ? districtMap[firstDistrict] : [];
        
        this.setData({
          allBuildingList,
          districtList,
          currentBuildingList,
          selectedDistrict: firstDistrict,
          districtMap // 保存区域映射，方便切换时使用
        });
      } else {
        throw new Error(result.message || '获取楼盘列表失败');
      }
      
      wx.hideLoading();
    } catch (error) {
      console.error('加载楼盘列表失败:', error);
      wx.hideLoading();
      
      let errorMessage = '加载楼盘列表失败';
      if (error && error.data && error.data.message) {
        errorMessage = error.data.message;
      } else if (error && error.message) {
        errorMessage = error.message;
      } else if (error && error.errMsg) {
        errorMessage = error.errMsg;
      }
      
      this.onShowToast('#t-toast', errorMessage);
    }
  },

  // 输入框变化处理
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    console.log('输入变化:', {
      field: field,
      value: value,
      event: e.type
    });
    
    this.setData({
      [`formData.${field}`]: value
    }, () => {
      console.log('输入更新后的formData:', this.data.formData);
      this.validateForm();
    });
  },


  // 显示楼盘选择器
  showBuildingPicker() {
    // 重置选择状态
    this.setData({
      showBuilding: true,
      selectedBuildingId: null,
      selectedBuildingData: null
    });
  },

  // 区域选择
  selectDistrict(e) {
    const { district } = e.currentTarget.dataset;
    const currentBuildingList = this.data.districtMap[district] || [];
    
    this.setData({
      selectedDistrict: district,
      currentBuildingList,
      selectedBuildingId: null, // 切换区域时重置楼盘选择
      selectedBuildingData: null
    });
  },

  // 楼盘选择
  selectBuilding(e) {
    const buildingData = e.currentTarget.dataset.building;
    
    this.setData({
      selectedBuildingId: buildingData.id,
      selectedBuildingData: buildingData
    });
  },

  // 确认楼盘选择
  confirmBuildingSelection() {
    if (!this.data.selectedBuildingData) {
      this.onShowToast('#t-toast', '请选择楼盘');
      return;
    }

    const building = this.data.selectedBuildingData;
    this.setData({
      showBuilding: false,
      'formData.buildingId': building.id,
      'formData.buildingName': `${building.name} (${building.address})`
    }, () => {
      this.validateForm();
    });
  },

  // 关闭楼盘选择器
  closeBuildingSelector() {
    this.setData({
      showBuilding: false
    });
  },

  // Popup显示状态变化
  onBuildingPopupChange(e) {
    if (!e.detail.visible) {
      this.setData({
        showBuilding: false
      });
    }
  },

  // 表单验证
  validateForm() {
    const { formData } = this.data;
    const canSubmit = formData.realName.trim() && 
                     formData.phone.trim() && 
                     formData.buildingId;
    
    console.log('表单验证结果:', {
      realName: formData.realName.trim(),
      phone: formData.phone.trim(),
      buildingId: formData.buildingId,
      canSubmit: canSubmit
    });
    
    this.setData({
      canSubmit
    });
  },

  // 提交申请
  async onSubmit() {
    console.log('=== 提交经纪人申请 ===');
    
    if (!this.data.canSubmit || this.data.submitting) {
      console.log('提交条件不满足，退出');
      return;
    }

    // 表单验证
    const { formData } = this.data;
    console.log('开始表单验证，formData:', formData);
    
    if (!formData.realName.trim()) {
      console.log('验证失败：真实姓名为空');
      this.onShowToast('#t-toast', '请输入真实姓名');
      return;
    }
    
    if (!formData.phone.trim()) {
      console.log('验证失败：手机号为空');
      this.onShowToast('#t-toast', '请输入手机号码');
      return;
    }
    
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      console.log('验证失败：手机号格式错误, phone:', formData.phone);
      this.onShowToast('#t-toast', '请输入正确的手机号码');
      return;
    }
    
    if (!formData.buildingId) {
      console.log('验证失败：楼盘ID为空');
      this.onShowToast('#t-toast', '请选择申请楼盘');
      return;
    }
    
    console.log('表单验证通过！');

    // 确认提交
    const confirmResult = await this.showConfirmDialog();
    if (!confirmResult) {
      console.log('用户取消了提交');
      return;
    }

    this.setData({ submitting: true });

    try {
      // 获取用户信息
      const loginStatus = AuthUtil.getLoginStatus();
      console.log('登录状态检查:', JSON.stringify(loginStatus, null, 2));
      
      if (!loginStatus.isLoggedIn) {
        console.error('用户未登录');
        throw new Error('用户未登录');
      }
      
      if (!loginStatus.userInfo) {
        console.error('用户信息缺失');
        throw new Error('用户信息缺失');
      }
      
      const userInfo = loginStatus.userInfo;
      console.log('用户信息:', JSON.stringify(userInfo, null, 2));
      
      // 尝试多种方式获取用户ID
      let userId = null;
      if (userInfo.userId) {
        userId = parseInt(userInfo.userId);
      } else if (userInfo.registeredUserId) {
        userId = parseInt(userInfo.registeredUserId);
      } else if (userInfo.id) {
        userId = parseInt(userInfo.id);
      }
      
      console.log('解析用户ID:', {
        userId字段: userInfo.userId,
        registeredUserId字段: userInfo.registeredUserId,
        id字段: userInfo.id,
        最终userId: userId,
        是否为数字: !isNaN(userId),
        是否大于0: userId > 0
      });
      
      if (!userId || userId === 0 || isNaN(userId)) {
        console.error('用户ID无效，可能需要重新登录');
        throw new Error(`用户ID无效，请重新登录。可用字段：${JSON.stringify({
          userId: userInfo.userId,
          registeredUserId: userInfo.registeredUserId,
          id: userInfo.id
        })}`);
      }

      // 准备提交数据
      const submitData = {
        userId: userId, // 确保是有效的数字类型
        realName: formData.realName.trim(),
        phone: formData.phone.trim(),
        buildingId: parseInt(formData.buildingId), // 确保是数字类型
        companyName: formData.companyName.trim(),
        licenseNo: formData.licenseNo.trim()
      };

      console.log('准备提交经纪人申请:', submitData);

      // 调用后端API提交申请
      console.log('发送POST请求到 /broker-applications');
      const response = await request('/broker-applications', 'POST', submitData);
      console.log('收到API响应:', response);
      const result = response.data; // 获取实际的响应数据
      console.log('解析后的结果:', result);

      if (result.code !== 200) {
        console.error('API返回错误:', result);
        throw new Error(result.message || '提交申请失败');
      }
      
      console.log('API调用成功，准备显示成功提示...');

      // 提交成功 - 先显示成功提示
      this.onShowToast('#t-toast', '申请提交成功！', 'success');
      
      // 清空表单
      this.setData({
        formData: {
          realName: '',
          phone: '',
          buildingId: '',
          buildingName: '',
          companyName: '',
          licenseNo: ''
        },
        canSubmit: false
      });
      
      // 延迟显示详细信息弹窗
      setTimeout(() => {
        wx.showModal({
          title: '🎉 申请提交成功',
          content: '您的经纪人申请已成功提交！\n\n我们将在1-3个工作日内完成审核，审核结果将通过系统通知您，请耐心等待。',
          showCancel: false,
          confirmText: '返回我的',
          success: (res) => {
            if (res.confirm) {
              // 返回到我的页面（使用switchTab因为我的页面在tabBar中）
              wx.switchTab({
                url: '/pages/my/index',
                success: () => {
                  console.log('成功返回我的页面');
                },
                fail: (err) => {
                  console.error('switchTab失败:', err);
                  // 如果switchTab失败，使用navigateBack
                  wx.navigateBack({
                    delta: 1,
                    success: () => {
                      console.log('navigateBack成功');
                    },
                    fail: (navErr) => {
                      console.error('navigateBack也失败:', navErr);
                    }
                  });
                }
              });
            }
          }
        });
      }, 1500); // 1.5秒后显示详细弹窗

    } catch (error) {
      console.error('提交申请失败:', error);
      
      // 处理不同类型的错误
      let errorMessage = '提交失败，请重试';
      let errorTitle = '提交失败';
      let shouldReturnToMyPage = false;
      
      if (error && error.data) {
        const errorData = error.data;
        console.log('错误详情:', errorData);
        
        if (errorData.code === 409) {
          errorTitle = '已有申请';
          errorMessage = '您已提交过申请，请等待审核结果。我们将在1-3个工作日内完成审核。';
          shouldReturnToMyPage = true; // 409错误时也要返回我的页面
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // 首先显示toast提示
      this.onShowToast('#t-toast', errorMessage);
      
      // 然后显示详细错误弹窗
      setTimeout(() => {
        wx.showModal({
          title: errorTitle,
          content: errorMessage,
          showCancel: false,
          confirmText: shouldReturnToMyPage ? '返回我的页面' : '知道了',
          success: () => {
            if (shouldReturnToMyPage) {
              // 409错误时返回我的页面
              wx.switchTab({
                url: '/pages/my/index',
                success: () => {
                  console.log('409错误-返回我的页面成功');
                },
                fail: (err) => {
                  console.error('409错误-返回我的页面失败:', err);
                  wx.navigateBack();
                }
              });
            }
          }
        });
      }, 1000);
      
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
        confirmText: '提交',
        cancelText: '再检查',
        success: (res) => {
          resolve(res.confirm);
        },
        fail: (err) => {
          console.error('确认对话框失败:', err);
          resolve(false);
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
