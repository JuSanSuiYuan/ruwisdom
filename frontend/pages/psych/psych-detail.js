// 心理咨询师详情页面逻辑

Page({
  data: {
    psychologist: {}, // 心理咨询师详情
    appointmentDate: '', // 预约日期
    timeOptions: [], // 时间段选项
    selectedTimeIndex: null, // 选中的时间段索引
    consultMethod: 'offline', // 咨询方式：offline(线下)/online(线上)
    symptoms: '', // 症状描述
    loading: false, // 加载状态
    minDate: '', // 最小可选日期
    maxDate: '' // 最大可选日期
  },

  onLoad: function(options) {
    const psychologistId = options.id;
    this.loadPsychologistDetail(psychologistId);
    this.initDateRange();
  },

  // 初始化日期范围（今天起30天内）
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

  // 加载心理咨询师详情
  loadPsychologistDetail: function(id) {
    this.setData({
      loading: true
    });

    // 在实际环境中，应该调用后端API获取数据
    // 这里使用模拟数据来展示功能
    setTimeout(() => {
      // 模拟的心理咨询师详情数据
      const mockPsychologists = {
        '1': {
          _id: '1',
          name: '张医生',
          gender: '男',
          avatar: '',
          hospital: '北京协和医院',
          department: '心理科',
          title: '主任医师',
          bio: '从事心理咨询工作20年，擅长青少年心理健康问题。曾在国内外多家知名医院进修学习，发表学术论文多篇。',
          specialty: '青少年心理问题、抑郁症、焦虑症、压力管理、家庭关系',
          certificateNumber: '12345678',
          phone: '13800138001',
          availableTimeSlots: ['周一上午', '周三下午', '周五全天'],
          available: true,
          price: 500,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        '2': {
          _id: '2',
          name: '李医生',
          gender: '女',
          avatar: '',
          hospital: '上海交通大学医学院附属瑞金医院',
          department: '心理科',
          title: '副主任医师',
          bio: '专注于儿童心理发展和家庭关系咨询。拥有丰富的临床经验，善于与儿童建立信任关系。',
          specialty: '儿童心理、家庭关系、亲子沟通、学习障碍',
          certificateNumber: '87654321',
          phone: '13900139001',
          availableTimeSlots: ['周二下午', '周四上午', '周六全天'],
          available: true,
          price: 450,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        '3': {
          _id: '3',
          name: '王医生',
          gender: '男',
          avatar: '',
          hospital: '广州市第三医院',
          department: '心理科',
          title: '主治医师',
          bio: '擅长压力管理和职业心理辅导。曾为多家企业提供员工心理辅导服务。',
          specialty: '压力管理、职业心理、人际关系、情绪管理',
          certificateNumber: '23456789',
          phone: '13700137001',
          availableTimeSlots: ['周一下午', '周三上午', '周日全天'],
          available: false,
          price: 400,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        '4': {
          _id: '4',
          name: '赵医生',
          gender: '女',
          avatar: '',
          hospital: '深圳市精神卫生中心',
          department: '心理科',
          title: '主任医师',
          bio: '专注于抑郁症和焦虑症的诊断与治疗。在国内外核心期刊发表论文数十篇，出版专著多部。',
          specialty: '抑郁症、焦虑症、心理创伤、睡眠障碍',
          certificateNumber: '98765432',
          phone: '13600136001',
          availableTimeSlots: ['周二上午', '周四下午', '周六半天'],
          available: true,
          price: 550,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      // 获取当前选中的心理咨询师
      const psychologist = mockPsychologists[id] || {};

      // 生成时间段选项
      const timeOptions = [];
      for (let hour = 9; hour <= 17; hour++) {
        timeOptions.push(`${hour}:00`);
        if (hour < 17) {
          timeOptions.push(`${hour}:30`);
        }
      }

      this.setData({
        psychologist: psychologist,
        timeOptions: timeOptions,
        loading: false
      });
    }, 1000);
  },

  // 日期选择变化
  onDateChange: function(e) {
    this.setData({
      appointmentDate: e.detail.value,
      selectedTimeIndex: null
    });
  },

  // 时间段选择变化
  onTimeChange: function(e) {
    this.setData({
      selectedTimeIndex: e.detail.value
    });
  },

  // 咨询方式选择变化
  onConsultMethodChange: function(e) {
    this.setData({
      consultMethod: e.detail.value
    });
  },

  // 症状描述输入变化
  onSymptomsChange: function(e) {
    this.setData({
      symptoms: e.detail.value
    });
  },

  // 提交预约
  submitAppointment: function() {
    if (!this.data.appointmentDate || this.data.selectedTimeIndex === null || this.data.loading) {
      return;
    }

    // 获取预约信息
    const appointmentInfo = {
      psychologistId: this.data.psychologist._id,
      psychologistName: this.data.psychologist.name,
      date: this.data.appointmentDate,
      time: this.data.timeOptions[this.data.selectedTimeIndex],
      consultMethod: this.data.consultMethod,
      symptoms: this.data.symptoms,
      price: this.data.psychologist.price
    };

    this.setData({
      loading: true
    });

    // 在实际环境中，应该调用后端API提交预约
    setTimeout(() => {
      // 模拟预约成功
      wx.showToast({
        title: '预约成功',
        icon: 'success',
        duration: 2000
      });

      // 预约成功后跳转到我的预约页面
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/psych/my-appointments'
        });
      }, 2000);
    }, 1500);
  }
});