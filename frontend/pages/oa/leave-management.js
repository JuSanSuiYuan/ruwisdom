// 请假管理页面逻辑
Page({
  data: {
    leaveRequests: [],
    searchKeyword: '',
    applicantTypeIndex: 0, // 0: 全部, 1: 教师, 2: 学生
    statusIndex: 0, // 0: 全部, 1: 待审批, 2: 已批准, 3: 已拒绝
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
    startDate: '',
    endDate: '',
    showRejectDialog: false,
    showDetailDialog: false,
    currentLeaveId: '',
    rejectReason: '',
    detailData: {}
  },

  onLoad: function() {
    // 加载请假申请列表
    this.loadLeaveRequests();
  },

  // 加载请假申请列表
  loadLeaveRequests: function() {
    const { searchKeyword, applicantTypeIndex, statusIndex, currentPage, pageSize, startDate, endDate } = this.data;
    
    // 构建查询参数
    const queryParams = {
      page: currentPage,
      pageSize: pageSize,
      keyword: searchKeyword
    };
    
    // 添加申请人类型筛选（不为0时）
    if (applicantTypeIndex !== 0) {
      queryParams.applicantRole = applicantTypeIndex === 1 ? 'teacher' : 'student';
    }
    
    // 添加状态筛选（不为0时）
    if (statusIndex !== 0) {
      const statusMap = ['', 'pending', 'approved', 'rejected'];
      queryParams.status = statusMap[statusIndex];
    }
    
    // 添加时间范围筛选
    if (startDate) {
      queryParams.startDate = startDate;
    }
    if (endDate) {
      queryParams.endDate = endDate;
    }

    wx.request({
      url: 'http://localhost:5000/api/oa/leave-requests',
      method: 'GET',
      data: queryParams,
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            leaveRequests: res.data.data.leaveRequests || [],
            totalCount: res.data.data.totalCount || 0,
            totalPages: Math.ceil((res.data.data.totalCount || 0) / pageSize)
          });
        } else {
          wx.showToast({
            title: res.data.message || '加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('加载请假申请列表失败:', err);
        wx.showToast({
          title: '网络错误，加载失败',
          icon: 'none'
        });
        // 提供模拟数据
        this.setData({
          leaveRequests: [
            {
              id: '1',
              applicantId: 't001',
              applicantName: '张三',
              applicantRole: 'teacher',
              leaveType: '病假',
              startDate: '2023-09-10',
              endDate: '2023-09-12',
              days: 3,
              reason: '身体不适，需要休息',
              status: 'pending',
              submitTime: '2023-09-09 10:30:00',
              approverName: '',
              approvalTime: '',
              approvalComment: ''
            },
            {
              id: '2',
              applicantId: 's001',
              applicantName: '李四',
              applicantRole: 'student',
              leaveType: '事假',
              startDate: '2023-09-15',
              endDate: '2023-09-15',
              days: 1,
              reason: '家中有事，需要请假一天',
              status: 'approved',
              submitTime: '2023-09-14 14:20:00',
              approverName: '王五',
              approvalTime: '2023-09-14 16:45:00',
              approvalComment: '同意请假'
            },
            {
              id: '3',
              applicantId: 's002',
              applicantName: '赵六',
              applicantRole: 'student',
              leaveType: '病假',
              startDate: '2023-09-05',
              endDate: '2023-09-07',
              days: 3,
              reason: '感冒发烧，需要在家休息',
              status: 'rejected',
              submitTime: '2023-09-04 09:15:00',
              approverName: '王五',
              approvalTime: '2023-09-04 11:30:00',
              approvalComment: '请提供医院证明后重新申请'
            }
          ],
          totalCount: 3,
          totalPages: 1
        });
      }
    });
  },

  // 获取状态文本
  getStatusText: function(status) {
    const statusMap = {
      pending: '待审批',
      approved: '已批准',
      rejected: '已拒绝'
    };
    return statusMap[status] || status;
  },

  // 搜索输入
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value,
      currentPage: 1
    });
    this.loadLeaveRequests();
  },

  // 申请人类型筛选
  onApplicantTypeChange: function(e) {
    this.setData({
      applicantTypeIndex: e.detail.value,
      currentPage: 1
    });
    this.loadLeaveRequests();
  },

  // 状态筛选
  onStatusChange: function(e) {
    this.setData({
      statusIndex: e.detail.value,
      currentPage: 1
    });
    this.loadLeaveRequests();
  },

  // 选择开始日期
  onStartDateChange: function(e) {
    this.setData({
      startDate: e.detail.value,
      currentPage: 1
    });
    this.loadLeaveRequests();
  },

  // 选择结束日期
  onEndDateChange: function(e) {
    this.setData({
      endDate: e.detail.value,
      currentPage: 1
    });
    this.loadLeaveRequests();
  },

  // 上一页
  prevPage: function() {
    if (this.data.currentPage > 1) {
      this.setData({
        currentPage: this.data.currentPage - 1
      });
      this.loadLeaveRequests();
    }
  },

  // 下一页
  nextPage: function() {
    if (this.data.currentPage < this.data.totalPages) {
      this.setData({
        currentPage: this.data.currentPage + 1
      });
      this.loadLeaveRequests();
    }
  },

  // 批准请假
  approveLeave: function(e) {
    const id = e.currentTarget.dataset.id;
    const userInfo = wx.getStorageSync('userInfo') || {};
    
    wx.request({
      url: `http://localhost:5000/api/oa/leave-requests/${id}/approve`,
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      data: {
        approverName: userInfo.name || '管理员',
        approvalTime: this.formatDateTime(new Date())
      },
      success: (res) => {
        if (res.data.success) {
          this.loadLeaveRequests();
          wx.showToast({
            title: '批准成功'
          });
        } else {
          wx.showToast({
            title: res.data.message || '批准失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('批准请假失败:', err);
        wx.showToast({
          title: '网络错误，批准失败',
          icon: 'none'
        });
        // 模拟批准成功
        setTimeout(() => {
          this.loadLeaveRequests();
          wx.showToast({
            title: '批准成功（模拟）'
          });
        }, 1000);
      }
    });
  },

  // 显示拒绝弹窗
  showRejectDialog: function(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      showRejectDialog: true,
      currentLeaveId: id,
      rejectReason: ''
    });
  },

  // 隐藏拒绝弹窗
  hideRejectDialog: function() {
    this.setData({
      showRejectDialog: false
    });
  },

  // 拒绝原因输入
  onRejectReasonInput: function(e) {
    this.setData({
      rejectReason: e.detail.value
    });
  },

  // 确认拒绝
  confirmReject: function() {
    const { currentLeaveId, rejectReason } = this.data;
    const userInfo = wx.getStorageSync('userInfo') || {};
    
    // 验证拒绝原因
    if (!rejectReason.trim()) {
      wx.showToast({
        title: '请输入拒绝原因',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: `http://localhost:5000/api/oa/leave-requests/${currentLeaveId}/reject`,
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      data: {
        approverName: userInfo.name || '管理员',
        approvalTime: this.formatDateTime(new Date()),
        approvalComment: rejectReason
      },
      success: (res) => {
        if (res.data.success) {
          this.hideRejectDialog();
          this.loadLeaveRequests();
          wx.showToast({
            title: '拒绝成功'
          });
        } else {
          wx.showToast({
            title: res.data.message || '拒绝失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('拒绝请假失败:', err);
        wx.showToast({
          title: '网络错误，拒绝失败',
          icon: 'none'
        });
        // 模拟拒绝成功
        setTimeout(() => {
          this.hideRejectDialog();
          this.loadLeaveRequests();
          wx.showToast({
            title: '拒绝成功（模拟）'
          });
        }, 1000);
      }
    });
  },

  // 查看详情
  viewLeaveDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    const leaveRequest = this.data.leaveRequests.find(item => item.id === id);
    if (leaveRequest) {
      this.setData({
        showDetailDialog: true,
        detailData: leaveRequest
      });
    }
  },

  // 隐藏详情弹窗
  hideDetailDialog: function() {
    this.setData({
      showDetailDialog: false
    });
  },

  // 格式化日期时间
  formatDateTime: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
});