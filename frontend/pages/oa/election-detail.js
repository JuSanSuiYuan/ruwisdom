// 班干部竞选详情页面逻辑

Page({
  data: {
    electionId: null,
    electionDetail: null,
    candidates: [],
    isLoading: true
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ electionId: parseInt(options.id) });
      this.loadElectionDetail();
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none',
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    }
  },

  // 加载竞选详情
  loadElectionDetail: function() {
    this.setData({ isLoading: true });
    
    // 模拟异步请求
    setTimeout(() => {
      // 模拟数据
      const electionDetail = {
        id: this.data.electionId,
        title: '三年级二班班长竞选',
        position: '班长',
        className: '三年级二班',
        status: 'ongoing', // ongoing, ended, upcoming
        startTime: '2023-09-15 08:00',
        endTime: '2023-09-15 17:00',
        totalStudents: 45,
        totalVotes: 38,
        voterTurnout: '84.4%',
        // 班长的特殊权限
        positionPermissions: [
          '协助老师管理班级日常事务',
          '组织班级活动和班会',
          '代表班级与学校沟通',
          '监督班级纪律和卫生',
          '协助老师收发作业',
          '其他班级管理职责'
        ]
      };
      
      const candidates = [
        {
          id: 1,
          name: '小明',
          avatar: '/images/avatar-default.png',
          votes: 20,
          percentage: '52.6%',
          slogan: '为班级服务，让我们共同进步！',
          description: '我是小明，我会努力为班级做出贡献。我有良好的组织能力和责任心，能够协助老师管理好班级事务。'
        },
        {
          id: 2,
          name: '小红',
          avatar: '/images/avatar-default.png',
          votes: 12,
          percentage: '31.6%',
          slogan: '用心做好每一件事！',
          description: '我有信心做好班长的工作。我会公平公正地处理班级事务，热心帮助同学解决问题。'
        },
        {
          id: 3,
          name: '小刚',
          avatar: '/images/avatar-default.png',
          votes: 6,
          percentage: '15.8%',
          slogan: '团结友爱，共同成长！',
          description: '我希望通过担任班长，促进班级同学之间的团结和友谊，营造良好的学习氛围。'
        }
      ];
      
      this.setData({
        electionDetail: electionDetail,
        candidates: candidates,
        isLoading: false
      });
    }, 1000);
  },

  // 导出结果
  onExportResults: function() {
    wx.showLoading({ title: '导出中...' });
    
    // 模拟导出操作
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '导出成功',
        icon: 'success'
      });
    }, 1000);
  },

  // 返回
  onBack: function() {
    wx.navigateBack();
  }
});