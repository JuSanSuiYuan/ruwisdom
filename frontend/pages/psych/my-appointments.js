// 我的预约页面逻辑

Page({
  data: {
    appointments: [], // 预约列表
    filteredAppointments: [], // 筛选后的预约列表
    activeTab: 'all', // 当前选中的标签
    loading: false // 加载状态
  },

  onLoad: function() {
    this.loadAppointments();
  },

  onShow: function() {
    // 每次显示页面时重新加载数据，确保数据最新
    this.loadAppointments();
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 切换标签页
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
    this.filterAppointments();
  },

  // 加载预约列表
  loadAppointments: function() {
    this.setData({
      loading: true
    });

    // 在实际环境中，应该调用后端API获取数据
    // 这里使用模拟数据来展示功能
    setTimeout(() => {
      // 模拟的预约数据
      const mockAppointments = [
        {
          _id: '1',
          psychologistId: '1',
          psychologistName: '张医生',
          hospital: '北京协和医院',
          department: '心理科',
          date: '2023-06-15',
          time: '10:00',
          status: 'pending', // pending: 待就诊, completed: 已完成, canceled: 已取消
          symptoms: '最近感到学习压力很大，难以集中注意力。',
          consultMethod: 'offline',
          price: 500,
          createdAt: new Date('2023-06-10'),
          updatedAt: new Date('2023-06-10')
        },
        {
          _id: '2',
          psychologistId: '2',
          psychologistName: '李医生',
          hospital: '上海交通大学医学院附属瑞金医院',
          department: '心理科',
          date: '2023-06-10',
          time: '14:30',
          status: 'completed',
          symptoms: '孩子最近情绪低落，不愿意与人交流。',
          consultMethod: 'offline',
          price: 450,
          createdAt: new Date('2023-06-05'),
          updatedAt: new Date('2023-06-10')
        },
        {
          _id: '3',
          psychologistId: '3',
          psychologistName: '王医生',
          hospital: '广州市第三医院',
          department: '心理科',
          date: '2023-06-08',
          time: '16:00',
          status: 'canceled',
          symptoms: '工作压力大，经常失眠。',
          consultMethod: 'online',
          price: 400,
          createdAt: new Date('2023-06-01'),
          updatedAt: new Date('2023-06-07')
        }
      ];

      this.setData({
        appointments: mockAppointments,
        loading: false
      });

      // 筛选预约列表
      this.filterAppointments();
    }, 1000);
  },

  // 筛选预约列表
  filterAppointments: function() {
    const { appointments, activeTab } = this.data;
    let filteredAppointments = appointments;

    if (activeTab !== 'all') {
      filteredAppointments = appointments.filter(appointment => appointment.status === activeTab);
    }

    // 按日期倒序排列
    filteredAppointments.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    this.setData({
      filteredAppointments: filteredAppointments
    });
  },

  // 获取预约状态文本
  getStatusText: function(status) {
    const statusMap = {
      'pending': '待就诊',
      'completed': '已完成',
      'canceled': '已取消'
    };
    return statusMap[status] || '';
  },

  // 获取预约状态样式类名
  getStatusClass: function(status) {
    const statusMap = {
      'pending': 'pending',
      'completed': 'completed',
      'canceled': 'canceled'
    };
    return statusMap[status] || '';
  },

  // 取消预约
  cancelAppointment: function(e) {
    const appointmentId = e.currentTarget.dataset.id;
    const that = this;

    wx.showModal({
      title: '取消预约',
      content: '确定要取消该预约吗？',
      success(res) {
        if (res.confirm) {
          that.setData({
            loading: true
          });

          // 在实际环境中，应该调用后端API取消预约
          setTimeout(() => {
            const updatedAppointments = that.data.appointments.map(appointment => {
              if (appointment._id === appointmentId) {
                return { ...appointment, status: 'canceled' };
              }
              return appointment;
            });

            that.setData({
              appointments: updatedAppointments,
              loading: false
            });

            that.filterAppointments();

            wx.showToast({
              title: '取消成功',
              icon: 'success',
              duration: 2000
            });
          }, 1000);
        }
      }
    });
  },

  // 前往就诊
  goToConsultation: function(e) {
    const appointmentId = e.currentTarget.dataset.id;
    // 这里可以跳转到就诊详情页面或地图导航页面
    wx.showToast({
      title: '即将前往就诊',
      icon: 'success',
      duration: 2000
    });
  },

  // 查看咨询记录
  viewConsultationRecord: function(e) {
    const appointmentId = e.currentTarget.dataset.id;
    // 这里可以跳转到咨询记录详情页面
    wx.showToast({
      title: '查看咨询记录',
      icon: 'success',
      duration: 2000
    });
  },

  // 重新预约
  rescheduleAppointment: function(e) {
    const appointmentId = e.currentTarget.dataset.id;
    // 找到对应的预约记录
    const appointment = this.data.appointments.find(item => item._id === appointmentId);
    if (appointment) {
      // 跳转到心理咨询师详情页面
      wx.navigateTo({
        url: `/pages/psych/psych-detail?id=${appointment.psychologistId}`
      });
    }
  }
});