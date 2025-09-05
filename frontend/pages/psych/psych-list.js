// 心理咨询师列表页面逻辑

Page({
  data: {
    psychologists: [], // 心理咨询师列表
    hospitals: ['北京协和医院', '上海交通大学医学院附属瑞金医院', '广州市第三医院', '深圳市精神卫生中心'], // 医院列表
    selectedHospital: 'all', // 选中的医院筛选条件
    searchKeyword: '', // 搜索关键词
    loading: false, // 加载状态
    hasMore: true, // 是否有更多数据
    page: 1, // 当前页码
    pageSize: 10 // 每页数据量
  },

  onLoad: function() {
    // 加载心理咨询师列表
    this.loadPsychologists();
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 搜索输入变化
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 按医院筛选
  filterByHospital: function(e) {
    const hospital = e.currentTarget.dataset.hospital;
    this.setData({
      selectedHospital: hospital,
      page: 1,
      psychologists: []
    });
    this.loadPsychologists();
  },

  // 加载心理咨询师列表
  loadPsychologists: function() {
    if (this.data.loading || !this.data.hasMore) {
      return;
    }

    this.setData({
      loading: true
    });

    // 在实际环境中，应该调用后端API获取数据
    // 这里使用模拟数据来展示功能
    setTimeout(() => {
      const mockPsychologists = [
        {
          _id: '1',
          name: '张医生',
          gender: '男',
          avatar: '',
          hospital: '北京协和医院',
          department: '心理科',
          title: '主任医师',
          bio: '从事心理咨询工作20年，擅长青少年心理健康问题。',
          specialty: '青少年心理问题、抑郁症、焦虑症',
          certificateNumber: '12345678',
          phone: '13800138001',
          availableTimeSlots: ['周一上午', '周三下午', '周五全天'],
          available: true,
          price: 500,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '2',
          name: '李医生',
          gender: '女',
          avatar: '',
          hospital: '上海交通大学医学院附属瑞金医院',
          department: '心理科',
          title: '副主任医师',
          bio: '专注于儿童心理发展和家庭关系咨询。',
          specialty: '儿童心理、家庭关系、亲子沟通',
          certificateNumber: '87654321',
          phone: '13900139001',
          availableTimeSlots: ['周二下午', '周四上午', '周六全天'],
          available: true,
          price: 450,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '3',
          name: '王医生',
          gender: '男',
          avatar: '',
          hospital: '广州市第三医院',
          department: '心理科',
          title: '主治医师',
          bio: '擅长压力管理和职业心理辅导。',
          specialty: '压力管理、职业心理、人际关系',
          certificateNumber: '23456789',
          phone: '13700137001',
          availableTimeSlots: ['周一下午', '周三上午', '周日全天'],
          available: false,
          price: 400,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '4',
          name: '赵医生',
          gender: '女',
          avatar: '',
          hospital: '深圳市精神卫生中心',
          department: '心理科',
          title: '主任医师',
          bio: '专注于抑郁症和焦虑症的诊断与治疗。',
          specialty: '抑郁症、焦虑症、心理创伤',
          certificateNumber: '98765432',
          phone: '13600136001',
          availableTimeSlots: ['周二上午', '周四下午', '周六半天'],
          available: true,
          price: 550,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // 应用筛选条件
      let filteredPsychologists = mockPsychologists;
      
      // 按医院筛选
      if (this.data.selectedHospital !== 'all') {
        filteredPsychologists = filteredPsychologists.filter(psych => psych.hospital === this.data.selectedHospital);
      }

      // 按关键词搜索
      if (this.data.searchKeyword) {
        const keyword = this.data.searchKeyword.toLowerCase();
        filteredPsychologists = filteredPsychologists.filter(psych => 
          psych.name.toLowerCase().includes(keyword) ||
          psych.hospital.toLowerCase().includes(keyword) ||
          psych.department.toLowerCase().includes(keyword) ||
          psych.specialty.toLowerCase().includes(keyword)
        );
      }

      // 模拟分页
      const startIndex = (this.data.page - 1) * this.data.pageSize;
      const endIndex = startIndex + this.data.pageSize;
      const pageData = filteredPsychologists.slice(startIndex, endIndex);

      this.setData({
        psychologists: this.data.page === 1 ? pageData : this.data.psychologists.concat(pageData),
        hasMore: endIndex < filteredPsychologists.length,
        loading: false
      });

    }, 1500);
  },

  // 加载更多
  loadMore: function() {
    this.setData({
      page: this.data.page + 1
    });
    this.loadPsychologists();
  },

  // 查看心理咨询师详情
  viewPsychologistDetail: function(e) {
    const psychologistId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/psych/psych-detail?id=${psychologistId}`
    });
  }
});