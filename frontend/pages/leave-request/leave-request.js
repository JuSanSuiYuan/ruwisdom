// 请假申请页面逻辑

Page({
  data: {
    leaveTypes: ['病假', '事假', '公假', '其他'],
    leaveTypeIndex: -1,
    startDate: '',
    endDate: '',
    reason: '',
    today: '',
    maxDate: '',
    submitting: false,
    canSubmit: false
  },

  onLoad() {
    // 设置日期范围
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 1); // 最大可选择一年后的日期

    this.setData({
      today: this.formatDate(today),
      maxDate: this.formatDate(maxDate)
    });
  },

  // 格式化日期为YYYY-MM-DD格式
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 请假类型改变
  onLeaveTypeChange(e) {
    const index = e.detail.value;
    this.setData({
      leaveTypeIndex: index
    });
    this.checkCanSubmit();
  },

  // 开始日期改变
  onStartDateChange(e) {
    const date = e.detail.value;
    this.setData({
      startDate: date
    });
    // 如果结束日期早于新的开始日期，清空结束日期
    if (this.data.endDate && this.data.endDate < date) {
      this.setData({
        endDate: ''
      });
    }
    this.checkCanSubmit();
  },

  // 结束日期改变
  onEndDateChange(e) {
    const date = e.detail.value;
    this.setData({
      endDate: date
    });
    this.checkCanSubmit();
  },

  // 请假原因输入
  onReasonInput(e) {
    const reason = e.detail.value;
    this.setData({
      reason: reason
    });
    this.checkCanSubmit();
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { leaveTypeIndex, startDate, endDate, reason } = this.data;
    const canSubmit = leaveTypeIndex !== -1 && startDate && endDate && reason.trim().length > 0;
    this.setData({
      canSubmit: canSubmit
    });
  },

  // 提交请假申请
  submitLeaveRequest() {
    const { leaveTypes, leaveTypeIndex, startDate, endDate, reason } = this.data;
    
    // 日期验证
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      wx.showToast({
        title: '开始日期不能晚于结束日期',
        icon: 'none'
      });
      return;
    }
    
    // 提交中状态
    this.setData({
      submitting: true
    });
    
    // 调用提交API
    wx.request({
      url: 'http://localhost:3000/api/leave',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      data: {
        leaveType: leaveTypes[leaveTypeIndex],
        startDate: startDate,
        endDate: endDate,
        reason: reason.trim()
      },
      success: (res) => {
        if (res.data && res.data.success) {
          wx.showToast({
            title: '请假申请提交成功',
            icon: 'success',
            duration: 2000,
            success: () => {
              // 延迟跳转到申请记录页面
              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/leave-list/leave-list'
                });
              }, 2000);
            }
          });
        } else {
          wx.showToast({
            title: res.data?.message || '提交失败，请稍后重试',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        console.error('提交请假申请失败:', error);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({
          submitting: false
        });
      }
    });
  }
});