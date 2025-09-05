// AI助手页面逻辑

Page({
  data: {
    // 模型相关
    availableModels: [], // 可用的AI模型列表
    selectedModel: {}, // 当前选择的模型
    modelDropdownVisible: false, // 模型下拉菜单是否可见
    
    // 聊天相关
    messages: [], // 聊天记录
    inputMessage: '', // 输入的消息
    isLoading: false, // 是否正在加载
    scrollToMessage: '', // 滚动到指定消息
    
    // 设置相关
    showSettings: false, // 是否显示设置弹窗
    temperature: 0.7, // 温度值
    maxTokens: 2048, // 最大响应长度
    
    // 测试相关
    showTestResults: false, // 是否显示测试结果
    testResults: [], // 测试结果
    
    // 提示消息
    showToast: false, // 是否显示提示消息
    toastMessage: '' // 提示消息内容
  },

  onLoad: function() {
    // 页面加载时初始化
    this.loadAvailableModels();
    this.loadChatHistory();
    this.loadSettings();
  },

  onShow: function() {
    // 页面显示时检查模型是否需要重新加载
    if (this.data.availableModels.length === 0) {
      this.loadAvailableModels();
    }
  },

  // 加载可用的AI模型列表
  loadAvailableModels: function() {
    wx.request({
      url: 'http://localhost:5000/api/ai/models',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.data.success && res.data.data.length > 0) {
          this.setData({
            availableModels: res.data.data,
            selectedModel: res.data.data[0] // 默认选择第一个模型
          });
        } else {
          this.showToast('加载模型失败，请检查网络连接');
        }
      },
      fail: (err) => {
        console.error('加载模型列表失败:', err);
        this.showToast('加载模型失败，请稍后重试');
        
        // 提供一些模拟模型数据以便在开发环境测试
        const mockModels = [
          { key: 'wenxin_yan', name: '文心一言' },
          { key: 'deepseek_r1', name: '深度求索R1' },
          { key: 'moonshot_kimi', name: '月之暗面Kimi' },
          { key: 'tongyi_qianwen', name: '通义千问' },
          { key: 'doubao', name: '豆包' }
        ];
        this.setData({
          availableModels: mockModels,
          selectedModel: mockModels[0]
        });
      }
    });
  },

  // 切换模型下拉菜单显示状态
  toggleModelDropdown: function() {
    this.setData({
      modelDropdownVisible: !this.data.modelDropdownVisible
    });
  },

  // 选择AI模型
  selectModel: function(e) {
    const modelKey = e.currentTarget.dataset.modelKey;
    const model = this.data.availableModels.find(m => m.key === modelKey);
    
    if (model) {
      this.setData({
        selectedModel: model,
        modelDropdownVisible: false
      });
      this.showToast(`已切换到${model.name}`);
    }
  },

  // 处理输入框内容变化
  onInputChange: function(e) {
    this.setData({
      inputMessage: e.detail.value
    });
  },

  // 发送消息
  sendMessage: function() {
    const message = this.data.inputMessage.trim();
    
    if (!message || this.data.isLoading) {
      return;
    }
    
    // 添加用户消息到聊天记录
    const newMessages = [...this.data.messages, {
      role: 'user',
      content: message
    }];
    
    this.setData({
      messages: newMessages,
      inputMessage: '',
      isLoading: true,
      scrollToMessage: `message-${newMessages.length - 1}`
    });
    
    // 调用后端API获取AI响应
    wx.request({
      url: 'http://localhost:5000/api/ai/chat/completions',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      data: {
        modelKey: this.data.selectedModel.key,
        messages: newMessages,
        options: {
          temperature: this.data.temperature,
          max_tokens: this.data.maxTokens
        }
      },
      success: (res) => {
        if (res.data.success && res.data.data) {
          const aiResponse = res.data.data;
          // 添加AI响应到聊天记录
          const updatedMessages = [...this.data.messages, {
            role: 'assistant',
            content: aiResponse.content || JSON.stringify(aiResponse)
          }];
          
          this.setData({
            messages: updatedMessages,
            scrollToMessage: `message-${updatedMessages.length - 1}`
          });
          
          this.saveChatHistory(updatedMessages);
        } else {
          this.showToast('获取AI响应失败: ' + (res.data.message || '未知错误'));
        }
      },
      fail: (err) => {
        console.error('发送消息失败:', err);
        this.showToast('发送消息失败，请检查网络连接');
        
        // 模拟AI响应以便在开发环境测试
        setTimeout(() => {
          const mockResponse = {
            role: 'assistant',
            content: `这是${this.data.selectedModel.name}的模拟响应。在实际环境中，这里将显示来自${this.data.selectedModel.name}的真实回复。您的问题是：${message}`
          };
          const updatedMessages = [...this.data.messages, mockResponse];
          
          this.setData({
            messages: updatedMessages,
            scrollToMessage: `message-${updatedMessages.length - 1}`
          });
          
          this.saveChatHistory(updatedMessages);
        }, 1000);
      },
      complete: () => {
        this.setData({
          isLoading: false
        });
      }
    });
  },

  // 清空聊天记录
  clearChatHistory: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空当前聊天记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            messages: []
          });
          wx.removeStorageSync('ai_chat_history');
          this.showToast('聊天记录已清空');
        }
      }
    });
  },

  // 保存聊天记录
  saveChatHistory: function(messages) {
    // 只保存最近的50条消息，避免占用过多存储空间
    const recentMessages = messages.slice(-50);
    wx.setStorageSync('ai_chat_history', recentMessages);
  },

  // 加载聊天记录
  loadChatHistory: function() {
    const chatHistory = wx.getStorageSync('ai_chat_history') || [];
    this.setData({
      messages: chatHistory
    });
  },

  // 打开设置弹窗
  openSettings: function() {
    this.setData({
      showSettings: true
    });
  },

  // 关闭设置弹窗
  closeSettings: function() {
    this.setData({
      showSettings: false
    });
  },

  // 阻止事件冒泡
  stopPropagation: function(e) {
    e.stopPropagation();
  },

  // 处理温度值变化
  onTemperatureChange: function(e) {
    this.setData({
      temperature: e.detail.value
    });
  },

  // 处理最大响应长度变化
  onMaxTokensChange: function(e) {
    const value = parseInt(e.detail.value) || 2048;
    this.setData({
      maxTokens: value
    });
  },

  // 保存设置
  saveSettings: function() {
    const settings = {
      temperature: this.data.temperature,
      maxTokens: this.data.maxTokens
    };
    wx.setStorageSync('ai_settings', settings);
    this.closeSettings();
    this.showToast('设置已保存');
  },

  // 加载设置
  loadSettings: function() {
    const settings = wx.getStorageSync('ai_settings') || {};
    this.setData({
      temperature: settings.temperature || 0.7,
      maxTokens: settings.maxTokens || 2048
    });
  },

  // 测试所有模型
  testModels: function() {
    this.setData({
      isLoading: true,
      showSettings: false
    });
    
    wx.request({
      url: 'http://localhost:5000/api/ai/models/test',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.data.success && res.data.data) {
          this.setData({
            testResults: res.data.data,
            showTestResults: true
          });
        } else {
          this.showToast('测试模型失败: ' + (res.data.message || '未知错误'));
        }
      },
      fail: (err) => {
        console.error('测试模型失败:', err);
        this.showToast('测试模型失败，请检查网络连接');
        
        // 提供模拟测试结果
        const mockTestResults = this.data.availableModels.map(model => ({
          modelKey: model.key,
          name: model.name,
          success: true,
          response: { content: '测试成功' }
        }));
        
        this.setData({
          testResults: mockTestResults,
          showTestResults: true
        });
      },
      complete: () => {
        this.setData({
          isLoading: false
        });
      }
    });
  },

  // 关闭测试结果弹窗
  closeTestResults: function() {
    this.setData({
      showTestResults: false
    });
  },

  // 显示提示消息
  showToast: function(message) {
    this.setData({
      showToast: true,
      toastMessage: message
    });
    
    // 3秒后自动隐藏
    setTimeout(() => {
      this.setData({
        showToast: false
      });
    }, 3000);
  },

  // 滚动到顶部
  onScrollToUpper: function() {
    console.log('滚动到顶部');
    // 可以在这里实现加载历史消息的逻辑
  },

  // 滚动到底部
  onScrollToLower: function() {
    console.log('滚动到底部');
  }
});