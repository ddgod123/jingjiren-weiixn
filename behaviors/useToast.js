import Toast, { hideToast } from 'tdesign-miniprogram/toast/index';

const useToastBehavior = Behavior({
  methods: {
    onShowToast(selector, message, type = 'error') {
      Toast({
        context: this,
        selector,
        message,
        theme: type === 'success' ? 'success' : 'error',
        duration: type === 'success' ? 2000 : 3000, // 成功提示显示2秒，错误提示显示3秒
      });
    },

    onHideToast(selector) {
      hideToast({
        context: this,
        selector,
      });
    },
  },
});

export default useToastBehavior;
