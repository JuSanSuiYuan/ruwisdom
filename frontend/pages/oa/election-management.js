// 班干部竞选管理页面逻辑

Page({
  data: {
    electionList: [],
    isLoading: true,
    isRefreshing: false
  },

  onLoad: function() {
    this.loadElectionData();
  },

  onShow: function() {
    // 页面显示时刷新数据
    if (!this.data.isLoading) {
      this.loadElectionData();
    }
  },

  // 加载竞选数据
  loadElectionData: function() {
    this.setData({ isLoading: true });
    
    // 模拟异步请求
    setTimeout(() => {
      // 模拟数据
      const electionList = [
        {
          id: 1,
          title: '三年级二班班长竞选',
          position: '班长',
          className: '三年级二班',
          status: 'ongoing', // ongoing, ended, upcoming
          startTime: '2023-09-15 08:00',
          endTime: '2023-09-15 17:00',
          candidatesCount: 5,
          votesCount: 38
        },
        {
          id: 2,
          title: '三年级二班学习委员竞选',
          position: '学习委员',
          className: '三年级二班',
          status: 'upcoming',
          startTime: '2023-09-16 08:00',
          endTime: '2023-09-16 17:00',
          candidatesCount: 3,
          votesCount: 0
        },
        {
          id: 3,
          title: '三年级二班纪律委员竞选',
          position: '纪律委员',
          className: '三年级二班',
          status: 'ended',
          startTime: '2023-09-14 08:00',
          endTime: '2023-09-14 17:00',
          candidatesCount: 4,
          votesCount: 42
        }
      ];
      
      this.setData({
        electionList: electionList,
        isLoading: false,
        isRefreshing: false
      });
    }, 1000);
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({ isRefreshing: true });
    this.loadElectionData();
    wx.stopPullDownRefresh();
  },

  // 创建新竞选
  onCreateElection: function() {
    wx.navigateTo({
      url: '/pages/oa/election-create'
    });
  },

  // 查看竞选详情
  onViewElectionDetail: function(e) {
    const electionId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/oa/election-detail?id=${electionId}`
    });
  },

  // 编辑竞选
  onEditElection: function(e) {
    const electionId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/oa/election-create?id=${electionId}`
    });
  },

  // 删除竞选
  onDeleteElection: function(e) {
    const electionId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除此竞选活动吗？',
      success: (res) => {
        if (res.confirm) {
          // 模拟删除操作
          const updatedList = this.data.electionList.filter(item => item.id !== electionId);
          this.setData({ electionList: updatedList });
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 发布/取消发布竞选
  onTogglePublish: function(e) {
    const electionId = e.currentTarget.dataset.id;
    const currentStatus = e.currentTarget.dataset.status;
    const newStatus = currentStatus === 'ongoing' ? 'upcoming' : 'ongoing';
    
    // 模拟状态切换
    const updatedList = this.data.electionList.map(item => {
      if (item.id === electionId) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    
    this.setData({ electionList: updatedList });
    
    wx.showToast({
      title: newStatus === 'ongoing' ? '发布成功' : '已取消发布',
      icon: 'success'
    });
  }
});