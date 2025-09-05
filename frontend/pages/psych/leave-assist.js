// 请假辅助页面逻辑

Page({
  data: {
    studentName: '', // 请假学生姓名
    studentId: '', // 请假学生ID
    leaveTime: '', // 请假时间
    leaveReason: '', // 请假原因
    leaveInfo: null // 请假信息对象
  },

  onLoad: function() {
    // 尝试从缓存中加载请假信息
    this.loadLeaveInfoFromCache();
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 从缓存加载请假信息
  loadLeaveInfoFromCache: function() {
    const leaveInfo = wx.getStorageSync('currentLeaveInfo');
    if (leaveInfo) {
      try {
        const parsedLeaveInfo = JSON.parse(leaveInfo);
        this.setData({
          studentName: parsedLeaveInfo.studentName || '',
          studentId: parsedLeaveInfo.studentId || '',
          leaveTime: parsedLeaveInfo.startDate + ' 至 ' + parsedLeaveInfo.endDate,
          leaveReason: parsedLeaveInfo.reason || '',
          leaveInfo: parsedLeaveInfo
        });
      } catch (e) {
        console.error('解析请假信息失败:', e);
      }
    }
  },

  // 选择学生
  selectStudent: function() {
    // 在实际环境中，应该调用后端API获取学生列表
    // 这里使用模拟数据来展示功能
    const students = [
      { id: '1', name: '张三' },
      { id: '2', name: '李四' },
      { id: '3', name: '王五' }
    ];

    const studentNames = students.map(student => student.name);
    
    wx.showActionSheet({
      itemList: studentNames,
      success: (res) => {
        if (!res.cancel) {
          const selectedStudent = students[res.tapIndex];
          this.setData({
            studentName: selectedStudent.name,
            studentId: selectedStudent.id
          });
        }
      }
    });
  },

  // 选择请假时间
  selectLeaveTime: function() {
    wx.navigateTo({
      url: '/pages/leave/time-selector'
    });
  },

  // 选择请假原因
  selectLeaveReason: function() {
    const reasons = ['生病就医', '家庭事务', '其他原因'];
    
    wx.showActionSheet({
      itemList: reasons,
      success: (res) => {
        if (!res.cancel) {
          this.setData({
            leaveReason: reasons[res.tapIndex]
          });
        }
      }
    });
  },

  // 跳转到高铁预约页面
  navigateToTrainBooking: function() {
    if (!this.validateLeaveInfo()) {
      return;
    }

    // 保存当前请假信息到缓存，供后续页面使用
    const leaveAssistInfo = {
      studentName: this.data.studentName,
      studentId: this.data.studentId,
      leaveTime: this.data.leaveTime,
      leaveReason: this.data.leaveReason
    };
    wx.setStorageSync('leaveAssistInfo', JSON.stringify(leaveAssistInfo));

    wx.navigateTo({
      url: '/pages/psych/train-booking'
    });
  },

  // 跳转到酒店预订页面
  navigateToHotelBooking: function() {
    if (!this.validateLeaveInfo()) {
      return;
    }

    // 保存当前请假信息到缓存，供后续页面使用
    const leaveAssistInfo = {
      studentName: this.data.studentName,
      studentId: this.data.studentId,
      leaveTime: this.data.leaveTime,
      leaveReason: this.data.leaveReason
    };
    wx.setStorageSync('leaveAssistInfo', JSON.stringify(leaveAssistInfo));

    wx.navigateTo({
      url: '/pages/psych/hotel-booking'
    });
  },

  // 跳转到医生预约页面
  navigateToDoctorBooking: function() {
    if (!this.validateLeaveInfo()) {
      return;
    }

    // 保存当前请假信息到缓存，供后续页面使用
    const leaveAssistInfo = {
      studentName: this.data.studentName,
      studentId: this.data.studentId,
      leaveTime: this.data.leaveTime,
      leaveReason: this.data.leaveReason
    };
    wx.setStorageSync('leaveAssistInfo', JSON.stringify(leaveAssistInfo));

    wx.navigateTo({
      url: '/pages/psych/doctor-booking'
    });
  },

  // 验证请假信息是否完整
  validateLeaveInfo: function() {
    if (!this.data.studentName) {
      wx.showToast({
        title: '请选择请假学生',
        icon: 'none',
        duration: 2000
      });
      return false;
    }

    if (!this.data.leaveTime) {
      wx.showToast({
        title: '请选择请假时间',
        icon: 'none',
        duration: 2000
      });
      return false;
    }

    if (!this.data.leaveReason) {
      wx.showToast({
        title: '请选择请假原因',
        icon: 'none',
        duration: 2000
      });
      return false;
    }

    return true;
  }
});