// election-list.js
Page({
  data: {
    electionList: [], // 竞选活动列表
    loading: true,    // 加载状态
    hasMore: true,    // 是否有更多数据
    currentPage: 1,   // 当前页码
    pageSize: 10      // 每页条数
  },

  onLoad: function() {
    this.fetchElectionList();
  },

  onShow: function() {
    // 每次页面显示时刷新数据
    this.setData({
      currentPage: 1,
      electionList: []
    });
    this.fetchElectionList();
  },

  // 获取竞选活动列表
  fetchElectionList: function() {
    const that = this;
    this.setData({ loading: true });

    // 模拟请求数据
    setTimeout(() => {
      // 模拟数据
      const mockData = [
        {
          id: 1,
          title: "第12周班长竞选",
          position: "班长",
          status: "ongoing", // ongoing: 进行中, ended: 已结束, upcoming: 即将开始
          startTime: "2024-10-15 08:00",
          endTime: "2024-10-15 18:00",
          currentVotes: 28,
          totalStudents: 45
        },
        {
          id: 2,
          title: "第12周学习委员竞选",
          position: "学习委员",
          status: "ongoing",
          startTime: "2024-10-15 08:00",
          endTime: "2024-10-15 18:00",
          currentVotes: 23,
          totalStudents: 45
        },
        {
          id: 3,
          title: "第11周班长竞选",
          position: "班长",
          status: "ended",
          startTime: "2024-10-08 08:00",
          endTime: "2024-10-08 18:00",
          winner: "张三",
          winnerVotes: 32
        },
        {
          id: 4,
          title: "第13周班长竞选",
          position: "班长",
          status: "upcoming",
          startTime: "2024-10-22 08:00",
          endTime: "2024-10-22 18:00"
        }
      ];

      that.setData({
        electionList: mockData,
        loading: false,
        hasMore: false // 模拟没有更多数据了
      });
    }, 1000);
  },

  // 查看竞选详情
  viewElectionDetail: function(e) {
    const electionId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/election/election-detail?id=${electionId}`
    });
  },

  // 刷新页面
  onPullDownRefresh: function() {
    this.setData({
      currentPage: 1,
      electionList: []
    });
    this.fetchElectionList();
    wx.stopPullDownRefresh();
  },

  // 加载更多
  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ currentPage: this.data.currentPage + 1 });
      this.fetchElectionList();
    }
  },

  // 获取状态文本
  getStatusText: function(status) {
    switch(status) {
      case 'ongoing':
        return '进行中';
      case 'ended':
        return '已结束';
      case 'upcoming':
        return '即将开始';
      default:
        return '未知状态';
    }
  }
});