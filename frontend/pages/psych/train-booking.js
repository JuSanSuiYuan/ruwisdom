// 高铁预约页面逻辑

Page({
  data: {
    studentName: '', // 学生姓名
    leaveTime: '', // 请假时间
    cities: ['北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都', '西安', '重庆'], // 城市列表
    departureCityIndex: null, // 出发城市索引
    arrivalCityIndex: null, // 到达城市索引
    departureDate: '', // 出发日期
    passengerName: '', // 乘车人姓名
    idCard: '', // 身份证号
    phone: '', // 联系电话
    loading: false, // 加载状态
    minDate: '', // 最小可选日期
    maxDate: '', // 最大可选日期
    canSubmit: false // 是否可以提交
  },

  onLoad: function() {
    this.loadStudentInfo();
    this.initDateRange();
  },

  // 加载学生信息
  loadStudentInfo: function() {
    const leaveAssistInfo = wx.getStorageSync('leaveAssistInfo');
    if (leaveAssistInfo) {
      try {
        const parsedInfo = JSON.parse(leaveAssistInfo);
        this.setData({
          studentName: parsedInfo.studentName || '',
          leaveTime: parsedInfo.leaveTime || ''
        });
      } catch (e) {
        console.error('解析学生信息失败:', e);
      }
    }
  },

  // 初始化日期范围
  initDateRange: function() {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    this.setData({
      minDate: formatDate(today),
      maxDate: formatDate(maxDate)
    });
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 出发城市选择变化
  onDepartureCityChange: function(e) {
    this.setData({
      departureCityIndex: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 到达城市选择变化
  onArrivalCityChange: function(e) {
    this.setData({
      arrivalCityIndex: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 出发日期选择变化
  onDepartureDateChange: function(e) {
    this.setData({
      departureDate: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 乘车人姓名输入变化
  onPassengerNameInput: function(e) {
    this.setData({
      passengerName: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 身份证号输入变化
  onIdCardInput: function(e) {
    this.setData({
      idCard: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 联系电话输入变化
  onPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 检查是否可以提交
  checkCanSubmit: function() {
    const { 
      departureCityIndex, 
      arrivalCityIndex, 
      departureDate, 
      passengerName, 
      idCard, 
      phone 
    } = this.data;

    const canSubmit = 
      departureCityIndex !== null && 
      arrivalCityIndex !== null && 
      departureCityIndex !== arrivalCityIndex && 
      departureDate && 
      passengerName.trim() && 
      idCard.trim() && 
      phone.trim();

    this.setData({
      canSubmit: canSubmit
    });
  },

  // 提交预订
  submitBooking: function() {
    if (!this.data.canSubmit || this.data.loading) {
      return;
    }

    // 验证身份证号和手机号格式
    if (!this.validateIdCard(this.data.idCard)) {
      wx.showToast({
        title: '请输入正确的身份证号',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (!this.validatePhone(this.data.phone)) {
      wx.showToast({
        title: '请输入正确的联系电话',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.setData({
      loading: true
    });

    // 收集预订信息
    const bookingInfo = {
      studentName: this.data.studentName,
      leaveTime: this.data.leaveTime,
      departureCity: this.data.cities[this.data.departureCityIndex],
      arrivalCity: this.data.cities[this.data.arrivalCityIndex],
      departureDate: this.data.departureDate,
      passengerName: this.data.passengerName,
      idCard: this.data.idCard,
      phone: this.data.phone,
      bookingTime: new Date().toISOString()
    };

    // 在实际环境中，应该调用后端API提交预订
    setTimeout(() => {
      // 模拟预订成功
      wx.showToast({
        title: '高铁票预订成功',
        icon: 'success',
        duration: 2000
      });

      // 保存预订信息
      const bookingRecords = wx.getStorageSync('bookingRecords') || [];
      const parsedBookingRecords = Array.isArray(bookingRecords) ? bookingRecords : [];
      parsedBookingRecords.push(bookingInfo);
      wx.setStorageSync('bookingRecords', parsedBookingRecords);

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }, 2000);
  },

  // 验证身份证号
  validateIdCard: function(idCard) {
    // 简单的身份证号验证规则
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return reg.test(idCard);
  },

  // 验证手机号
  validatePhone: function(phone) {
    // 简单的手机号验证规则
    const reg = /^1[3-9]\d{9}$/;
    return reg.test(phone);
  }
});