// 仪表盘页面逻辑

Page({
  data: {
    // 用户信息
    userInfo: {
      name: '',
      role: '',
      avatar: ''
    },
    // 角色类型 (0: 学生, 1: 教师, 2: 家长)
    roleType: 0,
    // 通知数量
    notificationCount: 3,
    // 快捷功能项
    quickFunctions: [
      { id: 'student', name: '学生信息', icon: 'student-icon', iconName: 'student' },
      { id: 'homework', name: '作业管理', icon: 'homework-icon', iconName: 'homework' },
      { id: 'notification', name: '通知中心', icon: 'notification-icon', iconName: 'notification' },
      { id: 'analysis', name: '数据分析', icon: 'analysis-icon', iconName: 'analysis' },
      { id: 'schedule', name: '课程表', icon: 'schedule-icon', iconName: 'schedule' },
      { id: 'election', name: '班干部竞选', icon: 'election-icon', iconName: 'election' },
      { id: 'communication', name: '家校沟通', icon: 'communication-icon', iconName: 'communication' },
      { id: 'leaveRequest', name: '请假申请', icon: 'leave-icon', iconName: 'leave' },
      { id: 'leaveList', name: '我的请假', icon: 'leave-list-icon', iconName: 'leave-list' }
    ],
    // 统计数据
    statsData: {
      studentsCount: 45,
      teachersCount: 12,
      parentsCount: 38,
      pendingTasks: 7
    },
    // 最近活动列表
    recentActivities: [],
    // 待办事项 (教师专属)
    todoList: [],
    // 子女动态 (家长专属)
    childrenActivities: [],
    // 加载状态
    isLoading: true
  },

  onLoad: function() {
    // 模拟加载数据
    this.loadDashboardData();
  },

  onShow: function() {
    // 页面显示时检查是否有更新
    if (!this.data.isLoading) {
      this.refreshDashboardData();
    }
  },

  // 加载仪表盘数据
  loadDashboardData: function() {
    wx.showLoading({ title: '加载中...' });
    
    // 模拟异步请求
    setTimeout(() => {
      // 获取用户信息 (实际项目中应从全局状态或本地存储获取)
      const userInfo = this.getUserInfo();
      this.setData({ userInfo });
      
      // 根据角色加载不同的数据
      this.loadRoleSpecificData();
      
      // 加载公共数据
      this.loadCommonData();
      
      this.setData({ isLoading: false });
      wx.hideLoading();
    }, 1000);
  },

  // 刷新仪表盘数据
  refreshDashboardData: function() {
    this.setData({ isLoading: true });
    this.loadDashboardData();
  },

  // 获取用户信息
  getUserInfo: function() {
    // 实际项目中应从全局状态或本地存储获取用户信息
    // 这里仅作示例
    const userInfo = wx.getStorageSync('userInfo') || {
      name: '张老师',
      role: '教师',
      roleType: 1,
      avatar: '/images/avatar-default.png'
    };
    
    this.setData({ roleType: userInfo.roleType });
    return userInfo;
  },

  // 加载角色专属数据
  loadRoleSpecificData: function() {
    const roleType = this.data.roleType;
    
    switch (roleType) {
      case 1: // 教师
        this.loadTeacherData();
        break;
      case 2: // 家长
        this.loadParentData();
        break;
      default: // 学生
        this.loadStudentData();
    }
  },

  // 加载教师专属数据
  loadTeacherData: function() {
    // 模拟教师待办事项数据
    const todoList = [
      { id: 1, content: '批改三年级二班数学作业', time: '今天 14:30' },
      { id: 2, content: '准备下周家长会材料', time: '今天 16:00' },
      { id: 3, content: '参加教研会议', time: '明天 10:00' },
      { id: 4, content: '填写学生成长记录', time: '明天 14:00' }
    ];
    
    this.setData({ todoList });
  },

  // 加载家长专属数据
  loadParentData: function() {
    // 模拟子女动态数据
    const childrenActivities = [
      {
        childName: '李明',
        activity: '数学考试成绩已发布，点击查看详情',
        time: '2小时前',
        type: 'score'
      },
      {
        childName: '李明',
        activity: '完成了英语作业《阅读理解》',
        time: '昨天',
        type: 'homework'
      },
      {
        childName: '李明',
        activity: '获得本周"优秀学生"称号',
        time: '3天前',
        type: 'achievement'
      }
    ];
    
    this.setData({ childrenActivities });
  },

  // 加载学生专属数据
  loadStudentData: function() {
    // 学生专属数据加载逻辑
  },

  // 加载公共数据
  loadCommonData: function() {
    // 模拟最近活动数据
    const recentActivities = [
      {
        id: 1,
        title: '新学期开学典礼将于9月1日举行',
        time: '2023-08-28 09:30',
        type: 'notification'
      },
      {
        id: 2,
        title: '9月第一周课程表已更新',
        time: '2023-08-27 16:45',
        type: 'schedule'
      },
      {
        id: 3,
        title: '学校图书馆新增一批课外读物',
        time: '2023-08-26 11:20',
        type: 'info'
      },
      {
        id: 4,
        title: '国庆节放假通知已发布',
        time: '2023-08-25 14:10',
        type: 'holiday'
      }
    ];
    
    this.setData({ recentActivities });
  },

  // 快捷功能点击事件
  onFunctionClick: function(e) {
    const functionId = e.currentTarget.dataset.id;
    console.log('点击快捷功能:', functionId);
    
    // 根据功能ID跳转到对应页面
    switch (functionId) {
      case 'student':
        wx.navigateTo({ url: '/pages/student/studentList' });
        break;
      case 'homework':
        wx.navigateTo({ url: '/pages/homework/homeworkList' });
        break;
      case 'notification':
        wx.navigateTo({ url: '/pages/notification/notification' });
        break;
      case 'analysis':
        wx.navigateTo({ url: '/pages/analysis/dataAnalysis' });
        break;
      case 'schedule':
        wx.navigateTo({ url: '/pages/schedule/courseSchedule' });
        break;
      case 'election':
        wx.navigateTo({ url: '/pages/election/election-list' });
        break;
      case 'communication':
        wx.navigateTo({ url: '/pages/communication/messageList' });
        break;
      case 'leaveRequest':
        wx.navigateTo({ url: '/pages/leave-request/leave-request' });
        break;
      case 'leaveList':
        wx.navigateTo({ url: '/pages/leave-list/leave-list' });
        break;
    }
  },

  // 通知图标点击事件
  onNotificationClick: function() {
    wx.navigateTo({ url: '/pages/notification/notification' });
  },

  // 设置图标点击事件
  onSettingsClick: function() {
    wx.navigateTo({ url: '/pages/settings/settings' });
  },

  // 活动项点击事件
  onActivityClick: function(e) {
    const activityId = e.currentTarget.dataset.id;
    console.log('点击活动项:', activityId);
    
    // 根据活动类型跳转到详情页
    wx.navigateTo({ url: `/pages/notification/notification-detail?id=${activityId}` });
  },

  // 待办事项点击事件
  onTodoClick: function(e) {
    const todoId = e.currentTarget.dataset.id;
    console.log('点击待办事项:', todoId);
    
    // 跳转到待办详情页或相关操作页面
  },

  // 子女动态点击事件
  onChildActivityClick: function(e) {
    const activityId = e.currentTarget.dataset.id;
    console.log('点击子女动态:', activityId);
    
    // 根据动态类型跳转到对应详情页
  },

  // 查看更多统计数据
  onViewMoreStats: function() {
    wx.navigateTo({ url: '/pages/analysis/dataAnalysis' });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.refreshDashboardData();
    wx.stopPullDownRefresh();
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '儒智慧 - 智能校园管理平台',
      path: '/pages/dashboard/dashboard',
      imageUrl: '/images/share-banner.png'
    };
  }
});