// 儒智慧微信小程序入口文件

App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    baseUrl: 'https://api.ruwisdom.com',
    token: ''
  },
  
  onLaunch: function() {
    // 小程序启动时执行的逻辑
    console.log('儒智慧小程序启动');
    
    // 检查用户登录状态
    this.checkLoginStatus();
    
    // 初始化云开发环境（如果使用云开发）
    // wx.cloud.init({
    //   env: 'ruwisdom-xxxx',
    //   traceUser: true
    // });
    
    // 加载系统配置
    this.loadSystemConfig();
  },
  
  checkLoginStatus: function() {
    // 从本地存储获取用户信息和token
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.isLoggedIn = true;
      
      // 验证token有效性
      this.validateToken();
    }
  },
  
  validateToken: function() {
    // 调用后端API验证token有效性
    wx.request({
      url: this.globalData.baseUrl + '/api/auth/validate',
      header: {
        'Authorization': 'Bearer ' + this.globalData.token
      },
      success: (res) => {
        if (res.statusCode !== 200) {
          // token无效，清除用户信息
          this.logout();
        }
      },
      fail: () => {
        console.error('验证token失败');
      }
    });
  },
  
  loadSystemConfig: function() {
    // 加载系统配置信息
    wx.request({
      url: this.globalData.baseUrl + '/api/config',
      success: (res) => {
        if (res.statusCode === 200) {
          wx.setStorageSync('systemConfig', res.data);
        }
      },
      fail: () => {
        console.error('加载系统配置失败');
      }
    });
  },
  
  login: function(userInfo, token) {
    // 登录成功后保存用户信息和token
    this.globalData.userInfo = userInfo;
    this.globalData.token = token;
    this.globalData.isLoggedIn = true;
    
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('token', token);
  },
  
  logout: function() {
    // 退出登录，清除用户信息和token
    this.globalData.userInfo = null;
    this.globalData.token = '';
    this.globalData.isLoggedIn = false;
    
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');
  }
});