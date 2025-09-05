// 通知中心页面逻辑

Page({
  data: {
    // 通知列表数据
    notifications: [],
    // 当前选中的标签页 (0: 全部, 1: 系统通知, 2: 课程通知, 3: 作业通知)
    activeTab: 0,
    // 加载状态
    isLoading: true,
    // 是否有更多数据
    hasMore: true,
    // 当前页码
    pageNum: 1,
    // 每页数量
    pageSize: 10
  },

  onLoad: function() {
    // 加载通知列表
    this.loadNotifications();
  },

  onShow: function() {
    // 页面显示时检查是否有新通知
    if (!this.data.isLoading) {
      this.refreshNotifications();
    }
  },

  // 加载通知列表
  loadNotifications: function() {
    wx.showLoading({ title: '加载中...' });
    this.setData({ isLoading: true });

    // 模拟异步请求获取通知数据
    setTimeout(() => {
      const mockNotifications = this.generateMockNotifications();
      
      this.setData({
        notifications: mockNotifications,
        isLoading: false,
        hasMore: false // 模拟数据，实际项目中根据后端返回判断
      });

      wx.hideLoading();
    }, 1000);
  },

  // 刷新通知列表
  refreshNotifications: function() {
    this.setData({
      pageNum: 1,
      hasMore: true
    });
    this.loadNotifications();
  },

  // 加载更多通知
  loadMoreNotifications: function() {
    if (!this.data.hasMore || this.data.isLoading) {
      return;
    }

    this.setData({ isLoading: true });

    // 模拟加载更多数据
    setTimeout(() => {
      // 实际项目中这里应该请求下一页数据
      this.setData({
        hasMore: false,
        isLoading: false
      });
    }, 1000);
  },

  // 切换标签页
  onTabChange: function(e) {
    const tabIndex = e.currentTarget.dataset.index;
    this.setData({
      activeTab: tabIndex,
      pageNum: 1
    });
    this.loadNotifications();
  },

  // 点击通知项
  onNotificationClick: function(e) {
    const notificationId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/notification/notification-detail?id=${notificationId}`
    });
  },

  // 生成模拟通知数据
  generateMockNotifications: function() {
    // 模拟系统通知
    const systemNotifications = [
      {
        id: 'sys1',
        title: '新学期开学典礼通知',
        content: '新学期开学典礼将于9月1日上午8:30在学校操场举行，请全体师生准时参加。',
        time: '2023-08-28 09:30',
        type: 1,
        isRead: false
      },
      {
        id: 'sys2',
        title: '国庆节放假通知',
        content: '国庆节放假时间为10月1日至10月7日，10月8日正常上课。',
        time: '2023-08-25 14:10',
        type: 1,
        isRead: true
      }
    ];

    // 模拟课程通知
    const courseNotifications = [
      {
        id: 'course1',
        title: '课程调整通知',
        content: '由于张老师临时有事，原定于9月1日上午第二节的数学课调整为下午第三节，请注意查看新的课程表。',
        time: '2023-08-31 16:45',
        type: 2,
        isRead: false,
        courseInfo: {
          originalCourse: '数学',
          originalTime: '9月1日 10:00-10:45',
          newCourse: '数学',
          newTime: '9月1日 15:30-16:15',
          teacher: '张老师'
        }
      },
      {
        id: 'course2',
        title: '新教师代课通知',
        content: '李老师因病请假一周，9月5日至9月9日的英语课将由王老师代课。',
        time: '2023-09-04 10:30',
        type: 2,
        isRead: true,
        courseInfo: {
          affectedDays: '9月5日至9月9日',
          originalTeacher: '李老师',
          substituteTeacher: '王老师',
          courseName: '英语'
        }
      }
    ];

    // 模拟作业通知
    const homeworkNotifications = [
      {
        id: 'hw1',
        title: '数学作业已发布',
        content: '今天的数学作业已发布，请同学们按时完成并提交。',
        time: '2023-08-31 15:20',
        type: 3,
        isRead: true
      },
      {
        id: 'hw2',
        title: '英语作业批改完成',
        content: '您的英语作业已批改，请查看详情。',
        time: '2023-08-30 18:40',
        type: 3,
        isRead: true
      }
    ];

    // 根据当前选中的标签返回相应的通知
    const allNotifications = [...systemNotifications, ...courseNotifications, ...homeworkNotifications];
    
    // 按时间倒序排序
    allNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // 根据当前选中的标签过滤通知
    if (this.data.activeTab === 1) {
      return systemNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
    } else if (this.data.activeTab === 2) {
      return courseNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
    } else if (this.data.activeTab === 3) {
      return homeworkNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
    } else {
      return allNotifications;
    }
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.refreshNotifications();
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom: function() {
    this.loadMoreNotifications();
  }
});