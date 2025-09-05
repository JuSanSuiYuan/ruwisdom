// 请假申请详情页面逻辑

Page({
  data: {
    leaveRequest: null,
    loading: true,
    requestId: ''
  },

  onLoad(options) {
    if (options && options.id) {
      this.setData({
        requestId: options.id
      });
      this.loadLeaveRequestDetail();
    }
  },

  // 加载请假申请详情
  loadLeaveRequestDetail() {
    this.setData({
      loading: true
    });

    wx.request({
      url: `http://localhost:3000/api/leave/${this.data.requestId}`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.data && res.data.success) {
          this.setData({
            leaveRequest: res.data.data
          });
        } else {
          this.setData({
            leaveRequest: null
          });
          wx.showToast({
            title: res.data?.message || '获取详情失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        console.error('获取请假申请详情失败:', error);
        this.setData({
          leaveRequest: null
        });
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

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'pending': '待审批',
      'approved': '已批准',
      'rejected': '已拒绝'
    };
    return statusMap[status] || status;
  },

  // 编辑申请
  onEdit() {
    const { leaveRequest } = this.data;
    if (!leaveRequest) return;

    // 将当前数据传递给编辑页面
    const editData = {
      leaveType: leaveRequest.leaveType,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      reason: leaveRequest.reason,
      id: leaveRequest._id
    };

    // 跳转到编辑页面（使用创建页面但传入编辑参数）
    wx.navigateTo({
      url: `/pages/leave-request/leave-request?edit=true&data=${encodeURIComponent(JSON.stringify(editData))}`
    });
  },

  // 删除申请
  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除此请假申请吗？删除后将无法恢复。',
      success: (res) => {
        if (res.confirm) {
          this.doDeleteRequest();
        }
      }
    });
  },

  // 执行删除操作
  doDeleteRequest() {
    wx.showLoading({
      title: '删除中...',
    });

    wx.request({
      url: `http://localhost:3000/api/leave/${this.data.requestId}`,
      method: 'DELETE',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.data && res.data.success) {
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000,
            success: () => {
              // 延迟返回列表页
              setTimeout(() => {
                wx.navigateBack({
                  delta: 1,
                  success: () => {
                    // 通知上一个页面刷新数据
                    const pages = getCurrentPages();
                    const prevPage = pages[pages.length - 2];
                    if (prevPage) {
                      prevPage.setData({
                        needRefresh: true
                      });
                    }
                  }
                });
              }, 2000);
            }
          });
        } else {
          wx.showToast({
            title: res.data?.message || '删除失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        console.error('删除请假申请失败:', error);
        wx.showToast(
          title: '网络错误，请稍后重试',
          icon: 'none'
        );
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 返回
  navigateBack() {
    wx.navigateBack();
  }
});