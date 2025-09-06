// 班干部竞选创建/编辑页面逻辑

Page({
  data: {
    electionId: null,
    title: '',
    position: '班长',
    className: '三年级二班',
    startTime: '',
    endTime: '',
    candidates: [],
    newCandidate: {
      name: '',
      slogan: '',
      description: ''
    },
    isSubmitting: false,
    positionOptions: ['班长', '学习委员', '纪律委员', '体育委员', '文艺委员', '劳动委员']
  },

  onLoad: function(options) {
    // 检查是否是编辑模式
    if (options.id) {
      this.setData({ electionId: parseInt(options.id) });
      this.loadElectionData();
    } else {
      // 设置默认时间
      const today = new Date();
      const formattedDate = this.formatDate(today);
      this.setData({
        startTime: formattedDate + ' 08:00',
        endTime: formattedDate + ' 17:00'
      });
    }
  },

  // 加载竞选数据（编辑模式）
  loadElectionData: function() {
    wx.showLoading({ title: '加载中...' });
    
    // 模拟异步请求
    setTimeout(() => {
      // 模拟数据
      const electionData = {
        title: '三年级二班班长竞选',
        position: '班长',
        className: '三年级二班',
        startTime: '2023-09-15 08:00',
        endTime: '2023-09-15 17:00',
        candidates: [
          {
            id: 1,
            name: '小明',
            slogan: '为班级服务，让我们共同进步！',
            description: '我是小明，我会努力为班级做出贡献。'
          },
          {
            id: 2,
            name: '小红',
            slogan: '用心做好每一件事！',
            description: '我有信心做好班长的工作。'
          }
        ]
      };
      
      this.setData(electionData);
      wx.hideLoading();
    }, 1000);
  },

  // 格式化日期
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 输入标题
  onTitleInput: function(e) {
    this.setData({ title: e.detail.value });
  },

  // 选择职位
  onPositionChange: function(e) {
    const positionIndex = e.detail.value;
    this.setData({ position: this.data.positionOptions[positionIndex] });
  },

  // 输入班级名称
  onClassInput: function(e) {
    this.setData({ className: e.detail.value });
  },

  // 选择开始时间
  onStartTimeChange: function(e) {
    this.setData({ startTime: e.detail.value });
  },

  // 选择结束时间
  onEndTimeChange: function(e) {
    this.setData({ endTime: e.detail.value });
  },

  // 输入候选人姓名
  onCandidateNameInput: function(e) {
    this.setData({ 'newCandidate.name': e.detail.value });
  },

  // 输入候选人口号
  onCandidateSloganInput: function(e) {
    this.setData({ 'newCandidate.slogan': e.detail.value });
  },

  // 输入候选人描述
  onCandidateDescriptionInput: function(e) {
    this.setData({ 'newCandidate.description': e.detail.value });
  },

  // 添加候选人
  onAddCandidate: function() {
    const { newCandidate, candidates } = this.data;
    
    // 验证候选人信息
    if (!newCandidate.name.trim()) {
      wx.showToast({
        title: '请输入候选人姓名',
        icon: 'none'
      });
      return;
    }
    
    if (!newCandidate.slogan.trim()) {
      wx.showToast({
        title: '请输入候选人口号',
        icon: 'none'
      });
      return;
    }
    
    // 添加候选人
    const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
    const candidateToAdd = {
      id: newId,
      name: newCandidate.name.trim(),
      slogan: newCandidate.slogan.trim(),
      description: newCandidate.description.trim()
    };
    
    this.setData({
      candidates: [...candidates, candidateToAdd],
      newCandidate: { name: '', slogan: '', description: '' }
    });
  },

  // 删除候选人
  onDeleteCandidate: function(e) {
    const candidateId = e.currentTarget.dataset.id;
    const updatedCandidates = this.data.candidates.filter(c => c.id !== candidateId);
    this.setData({ candidates: updatedCandidates });
  },

  // 提交表单
  onSubmit: function() {
    const { title, position, className, startTime, endTime, candidates } = this.data;
    
    // 验证表单
    if (!title.trim()) {
      wx.showToast({
        title: '请输入竞选标题',
        icon: 'none'
      });
      return;
    }
    
    if (!className.trim()) {
      wx.showToast({
        title: '请输入班级名称',
        icon: 'none'
      });
      return;
    }
    
    if (!startTime || !endTime) {
      wx.showToast({
        title: '请选择开始和结束时间',
        icon: 'none'
      });
      return;
    }
    
    if (candidates.length === 0) {
      wx.showToast({
        title: '请至少添加一名候选人',
        icon: 'none'
      });
      return;
    }
    
    // 提交数据
    this.setData({ isSubmitting: true });
    
    // 模拟提交请求
    setTimeout(() => {
      wx.showToast({
        title: this.data.electionId ? '编辑成功' : '创建成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    }, 1000);
  },

  // 取消
  onCancel: function() {
    wx.navigateBack();
  }
});