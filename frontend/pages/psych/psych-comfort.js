// 心理安慰页面逻辑

Page({
  data: {
    messages: [], // 聊天记录
    inputValue: '', // 输入框内容
    loading: false, // 加载状态
    currentTime: '', // 当前时间
    userAvatar: '', // 用户头像
    showQuickQuestions: true // 是否显示快捷问题
  },

  onLoad: function() {
    // 设置当前时间
    this.setCurrentTime();
    // 加载用户信息
    this.loadUserInfo();
  },

  // 设置当前时间
  setCurrentTime: function() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.setData({
      currentTime: `${hours}:${minutes}`
    });
  },

  // 加载用户信息
  loadUserInfo: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      const parsedUserInfo = JSON.parse(userInfo);
      this.setData({
        userAvatar: parsedUserInfo.avatar
      });
    }
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 输入内容变化
  onInputChange: function(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  // 发送消息
  sendMessage: function() {
    const content = this.data.inputValue.trim();
    if (!content || this.data.loading) {
      return;
    }

    // 添加用户消息到聊天记录
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const newMessages = this.data.messages.concat([{
      type: 'user',
      content: content,
      time: `${hours}:${minutes}`
    }]);

    this.setData({
      messages: newMessages,
      inputValue: '',
      loading: true,
      showQuickQuestions: false
    });

    // 模拟AI回复（实际环境中应该调用后端API）
    setTimeout(() => {
      this.getAIResponse(content);
    }, 1000);
  },

  // 发送快捷消息
  sendQuickMessage: function(e) {
    const content = e.currentTarget.dataset.content;
    this.setData({
      inputValue: content
    });
    this.sendMessage();
  },

  // 获取AI回复
  getAIResponse: function(userMessage) {
    const that = this;
    
    // 在实际环境中，应该调用后端API获取AI回复
    // 这里使用模拟数据来展示功能
    const mockResponses = {
      '焦虑': '我理解你现在感到焦虑。焦虑是一种常见的情绪反应，试着深呼吸几次，慢慢吸气，然后缓缓呼出。你可以告诉我是什么让你感到焦虑吗？',
      '压力大': '压力大的时候，记得要给自己一些休息的时间。试着把任务分解成小步骤，逐一完成。你可以和我分享一下最近让你感到压力大的事情吗？',
      '沮丧': '感到沮丧是很正常的，每个人都会有这样的时刻。试着做一些让自己感到开心的事情，比如听音乐、散步或者和朋友聊天。你愿意和我多聊聊吗？',
      '孤独': '孤独感确实很难熬。记得你并不孤单，有很多人关心你。试着和家人或朋友联系，分享你的感受。你想和我说说你的感受吗？'
    };

    // 默认回复
    let aiResponse = '感谢你的分享。我能感受到你的感受，这是很正常的。你愿意多和我聊聊吗？我会在这里陪伴你。';
    
    // 检查是否有匹配的预设回复
    for (const key in mockResponses) {
      if (userMessage.includes(key)) {
        aiResponse = mockResponses[key];
        break;
      }
    }

    // 添加AI回复到聊天记录
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const newMessages = that.data.messages.concat([{
      type: 'ai',
      content: aiResponse,
      time: `${hours}:${minutes}`
    }]);

    that.setData({
      messages: newMessages,
      loading: false
    });

    // 滚动到底部
    setTimeout(() => {
      wx.pageScrollTo({
        scrollTop: 9999
      });
    }, 100);
  }
});