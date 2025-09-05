// 医生预约页面逻辑

Page({
  data: {
    studentName: '', // 学生姓名
    leaveTime: '', // 请假时间
    appointmentType: 'physical', // 预约类型: physical-体检, medical-看病, specialist-专科咨询
    hospitals: ['北京协和医院', '北京天坛医院', '北京儿童医院', '上海市第一人民医院', '上海交通大学医学院附属瑞金医院', '广州市第一人民医院', '深圳市人民医院'], // 医院列表
    hospitalIndex: null, // 医院索引
    appointmentDate: '', // 预约日期
    patientName: '', // 预约人姓名
    idCard: '', // 身份证号
    phone: '', // 联系电话
    symptoms: '', // 症状描述
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
    maxDate.setDate(today.getDate() + 14);

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

  // 预约类型选择变化
  onAppointmentTypeChange: function(e) {
    this.setData({
      appointmentType: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 医院选择变化
  onHospitalChange: function(e) {
    this.setData({
      hospitalIndex: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 预约日期选择变化
  onAppointmentDateChange: function(e) {
    this.setData({
      appointmentDate: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 预约人姓名输入变化
  onPatientNameInput: function(e) {
    this.setData({
      patientName: e.detail.value
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

  // 症状描述输入变化
  onSymptomsInput: function(e) {
    this.setData({
      symptoms: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 检查是否可以提交
  checkCanSubmit: function() {
    const { 
      appointmentType, 
      hospitalIndex, 
      appointmentDate, 
      patientName, 
      idCard, 
      phone, 
      symptoms 
    } = this.data;

    const canSubmit = 
      appointmentType && 
      hospitalIndex !== null && 
      appointmentDate && 
      patientName.trim() && 
      idCard.trim() && 
      phone.trim() && 
      symptoms.trim().length > 5; // 症状描述至少需要6个字符

    this.setData({
      canSubmit: canSubmit
    });
  },

  // 提交预约
  submitAppointment: function() {
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

    // 收集预约信息
    const appointmentInfo = {
      studentName: this.data.studentName,
      leaveTime: this.data.leaveTime,
      appointmentType: this.data.appointmentType,
      hospital: this.data.hospitals[this.data.hospitalIndex],
      appointmentDate: this.data.appointmentDate,
      patientName: this.data.patientName,
      idCard: this.data.idCard,
      phone: this.data.phone,
      symptoms: this.data.symptoms,
      appointmentTime: new Date().toISOString()
    };

    // 在实际环境中，应该调用后端API提交预约
    setTimeout(() => {
      // 模拟预约成功
      wx.showToast({
        title: '医生预约成功',
        icon: 'success',
        duration: 2000
      });

      // 保存预约信息
      const doctorAppointments = wx.getStorageSync('doctorAppointments') || [];
      const parsedDoctorAppointments = Array.isArray(doctorAppointments) ? doctorAppointments : [];
      parsedDoctorAppointments.push(appointmentInfo);
      wx.setStorageSync('doctorAppointments', parsedDoctorAppointments);

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