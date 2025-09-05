// 请假申请列表页面逻辑

Page({
  data: {
    leaveRequests: [],
    currentStatus: '',
    currentPage: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    hasMore: true
  },

  onLoad() {
    // 加载请假申请列表
    this.loadLeaveRequests();
  },

  onShow() {
    // 当页面显示时，如果是从详情页或创建页返回，刷新列表
    if (this.data.needRefresh) {
      this.setData({
        currentPage: 1,
        leaveRequests: [],
        hasMore: true,
        needRefresh: false
      });
      this.loadLeaveRequests();
    }
  },

  // 加载请假申请列表
  loadLeaveRequests() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({
      loading: true
    });

    // 构建查询参数
    const params = {
      page: this.data.currentPage,
      limit: this.data.pageSize
    };
    if (this.data.currentStatus) {
      params.status = this.data.currentStatus;
    }

    // 调用API获取列表数据
    wx.request({
      url: 'http://localhost:3000/api/leave/my-requests',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      data: params,
      success: (res) => {
        if (res.data && res.data.success) {
          const newRequests = res.data.data || [];
          const totalRequests = [...this.data.leaveRequests, ...newRequests];
          
          this.setData({
            leaveRequests: totalRequests,
            total: res.data.total || 0,
            hasMore: totalRequests.length < res.data.total,
            currentPage: this.data.currentPage + 1
          });
        } else {
          wx.showToast({
            title: res.data?.message || '获取列表失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        console.error('获取请假申请列表失败:', error);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({
          loading: false
        });
      }
    });
  },

  // 状态筛选
  onStatusFilter(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      currentStatus: status,
      currentPage: 1,
      leaveRequests: [],
      hasMore: true
    });
    this.loadLeaveRequests();
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'pending': '待审批',
      'approved': '已批准',
      'rejected': '已拒绝'
    };
    return statusMap[status] || status;
  },

  // 点击列表项
  onItemTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/leave-detail/leave-detail?id=${id}`
    });
  },

  // 跳转到创建页面
  navigateToCreate() {
    wx.navigateTo({
      url: '/pages/leave-request/leave-request'
    });
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadLeaveRequests();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      currentPage: 1,
      leaveRequests: [],
      hasMore: true
    });
    this.loadLeaveRequests().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});