// 登录页面逻辑
Page({
  data: {
    // 用户账号
    account: '',
    // 用户密码
    password: '',
    // 记住密码状态
    rememberPassword: false,
    // 显示/隐藏密码
    showPassword: false,
    // 加载状态
    isLoading: false,
    // 选择的角色
    selectedRole: 'teacher' // teacher, parent, student
  },

  onLoad: function() {
    // 页面加载时检查是否有记住的密码
    this.checkRememberedPassword();
  },

  // 检查是否有记住的密码
  checkRememberedPassword: function() {
    const savedAccount = wx.getStorageSync('rememberedAccount');
    const savedPassword = wx.getStorageSync('rememberedPassword');
    const savedRole = wx.getStorageSync('rememberedRole');
    
    if (savedAccount && savedPassword) {
      this.setData({
        account: savedAccount,
        password: savedPassword,
        rememberPassword: true,
        selectedRole: savedRole || 'teacher'
      });
    }
  },

  // 选择角色
  selectRole: function(e) {
    const role = e.currentTarget.dataset.role;
    this.setData({
      selectedRole: role
    });
  },

  // 账号输入事件
  onAccountInput: function(e) {
    this.setData({
      account: e.detail.value
    });
  },

  // 密码输入事件
  onPasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 切换密码可见性
  togglePasswordVisibility: function() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  // 切换记住密码状态
  toggleRememberPassword: function() {
    this.setData({
      rememberPassword: !this.data.rememberPassword
    });
  },

  // 登录方法
  login: function() {
    const { account, password, rememberPassword, selectedRole } = this.data;
    
    // 表单验证
    if (!account.trim()) {
      wx.showToast({
        title: '请输入账号',
        icon: 'none'
      });
      return;
    }
    
    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }
    
    // 设置加载状态
    this.setData({
      isLoading: true
    });
    
    // 调用登录API
    wx.request({
      url: getApp().globalData.baseUrl + '/api/auth/login',
      method: 'POST',
      data: {
        account: account,
        password: password,
        role: selectedRole
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          // 登录成功，保存用户信息和token
          const { userInfo, token } = res.data.data;
          
          // 调用全局登录方法
          getApp().login(userInfo, token);
          
          // 记住密码（如果开启）
          if (rememberPassword) {
            wx.setStorageSync('rememberedAccount', account);
            wx.setStorageSync('rememberedPassword', password);
            wx.setStorageSync('rememberedRole', selectedRole);
          } else {
            wx.removeStorageSync('rememberedAccount');
            wx.removeStorageSync('rememberedPassword');
            wx.removeStorageSync('rememberedRole');
          }
          
          // 显示登录成功提示
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500,
            success: () => {
              // 跳转到首页
              setTimeout(() => {
                wx.switchTab({
                  url: '/pages/dashboard/dashboard'
                });
              }, 1500);
            }
          });
        } else {
          // 登录失败，显示错误信息
          wx.showToast({
            title: res.data.message || '登录失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('登录请求失败:', err);
        wx.showToast({
          title: '网络异常，请检查网络设置',
          icon: 'none'
        });
      },
      complete: () => {
        // 关闭加载状态
        this.setData({
          isLoading: false
        });
      }
    });
  },

  // 微信登录
  loginWithWechat: function() {
    wx.showLoading({
      title: '正在登录...',
    });
    
    // 调用微信登录接口
    wx.login({
      success: (res) => {
        if (res.code) {
          // 发送code到后端换取openid和session_key
          wx.request({
            url: getApp().globalData.baseUrl + '/api/auth/wechat-login',
            method: 'POST',
            data: {
              code: res.code,
              role: this.data.selectedRole
            },
            success: (result) => {
              if (result.statusCode === 200 && result.data.success) {
                // 登录成功，保存用户信息和token
                const { userInfo, token } = result.data.data;
                getApp().login(userInfo, token);
                
                wx.hideLoading();
                wx.showToast({
                  title: '登录成功',
                  icon: 'success',
                  duration: 1500,
                  success: () => {
                    setTimeout(() => {
                      wx.switchTab({
                        url: '/pages/dashboard/dashboard'
                      });
                    }, 1500);
                  }
                });
              } else {
                wx.hideLoading();
                wx.showToast({
                  title: result.data.message || '微信登录失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('微信登录请求失败:', err);
              wx.hideLoading();
              wx.showToast({
                title: '网络异常，请检查网络设置',
                icon: 'none'
              });
            }
          });
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '获取微信code失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('微信登录接口调用失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '微信登录失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 手机号登录
  loginWithPhone: function() {
    wx.navigateTo({
      url: '/pages/login/phone-login'
    });
  },

  // 忘记密码
  goToForgotPassword: function() {
    wx.navigateTo({
      url: '/pages/login/forgot-password'
    });
  },

  // 查看用户协议
  goToUserAgreement: function() {
    wx.navigateTo({
      url: '/pages/agreement/user-agreement'
    });
  },

  // 查看隐私政策
  goToPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/agreement/privacy-policy'
    });
  }
});