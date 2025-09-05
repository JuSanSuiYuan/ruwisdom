// OA管理仪表盘页面逻辑

Page({
  data: {
    // 用户信息
    userInfo: {
      name: '',
      role: '',
      avatar: ''
    },
    // 角色类型文本
    userRoleText: '管理员',
    // 统计数据
    statsData: {
      studentsCount: 0,
      teachersCount: 0,
      parentsCount: 0,
      adminCount: 0,
      pendingLeaveRequests: 0
    },
    // 最近活动列表
    recentActivities: [],
    // 加载状态
    isLoading: true
  },

  onLoad: function() {
    // 加载仪表盘数据
    this.loadDashboardData();
  },

  onShow: function() {
    // 页面显示时刷新数据
    if (!this.data.isLoading) {
      this.refreshDashboardData();
    }
  },

  // 加载仪表盘数据
  loadDashboardData: function() {
    wx.showLoading({ title: '加载中...' });
    
    // 获取用户信息
    const userInfo = this.getUserInfo();
    this.setData({ userInfo });
    
    // 模拟加载统计数据
    this.loadStatsData();
    
    // 模拟加载最近活动
    this.loadRecentActivities();
    
    this.setData({ isLoading: false });
    wx.hideLoading();
  },

  // 刷新仪表盘数据
  refreshDashboardData: function() {
    this.setData({ isLoading: true });
    this.loadDashboardData();
  },

  // 获取用户信息
  getUserInfo: function() {
    // 实际项目中应从全局状态或本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo') || {
      name: '管理员',
      role: 'admin',
      avatar: '/images/admin-avatar.png'
    };
    
    return userInfo;
  },

  // 加载统计数据
  loadStatsData: function() {
    // 模拟API请求获取统计数据
    wx.request({
      url: 'http://localhost:5000/api/oa/stats',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          this.setData({
            statsData: res.data.data
          });
        }
      },
      fail: (err) => {
        console.error('获取统计数据失败:', err);
        // 使用模拟数据
        this.setData({
          statsData: {
            studentsCount: 45,
            teachersCount: 12,
            parentsCount: 38,
            adminCount: 2,
            pendingLeaveRequests: 7
          }
        });
      }
    });
  },

  // 加载最近活动
  loadRecentActivities: function() {
    // 模拟最近操作记录数据
    const recentActivities = [
      {
        id: 1,
        title: '创建了新学期校历',
        time: '2023-08-30 14:30',
        type: 'calendar'
      },
      {
        id: 2,
        title: '更新了系统配置',
        time: '2023-08-29 16:45',
        type: 'system'
      },
      {
        id: 3,
        title: '发布了国庆节放假通知',
        time: '2023-08-28 11:20',
        type: 'announcement'
      },
      {
        id: 4,
        title: '审批了5条请假申请',
        time: '2023-08-27 14:10',
        type: 'leave'
      }
    ];
    
    this.setData({ recentActivities });
  },

  // 跳转到用户管理页面
  navigateToUserManagement: function() {
    wx.navigateTo({
      url: '/pages/oa/user-management'
    });
  },

  // 跳转到系统设置页面
  navigateToSystemSettings: function() {
    wx.navigateTo({
      url: '/pages/oa/system-settings'
    });
  },

  // 跳转到公告管理页面
  navigateToAnnouncementManagement: function() {
    wx.navigateTo({
      url: '/pages/oa/announcement-management'
    });
  },

  // 跳转到请假管理页面
  navigateToLeaveManagement: function() {
    wx.navigateTo({
      url: '/pages/oa/leave-management'
    });
  },

  // 跳转到设置页面
  navigateToSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  // 退出登录
  onLogout: function() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          // 跳转到登录页
          wx.redirectTo({
            url: '/pages/login/login'
          });
        }
      }
    });
  },

  // 活动项点击事件
  onActivityClick: function(e) {
    const activityId = e.currentTarget.dataset.id;
    console.log('点击活动项:', activityId);
    // 根据活动类型跳转到相应页面
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.refreshDashboardData();
    wx.stopPullDownRefresh();
  }
});