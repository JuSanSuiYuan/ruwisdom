// 心理咨询首页逻辑

Page({
  // 页面数据
  data: {
    userInfo: null
  },

  onLoad: function() {
    // 加载用户信息
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: JSON.parse(userInfo)
      });
    }
  },

  // 跳转到心理安慰页面
  goToPsychComfort: function() {
    wx.navigateTo({
      url: '/pages/psych/psych-comfort'
    });
  },

  // 跳转到心理咨询师列表页面
  goToPsychList: function() {
    wx.navigateTo({
      url: '/pages/psych/psych-list'
    });
  },

  // 跳转到我的预约页面
  goToMyAppointments: function() {
    wx.navigateTo({
      url: '/pages/psych/my-appointments'
    });
  },

  // 跳转到请假辅助页面
  goToLeaveAssist: function() {
    wx.navigateTo({
      url: '/pages/psych/leave-assist'
    });
  }
});