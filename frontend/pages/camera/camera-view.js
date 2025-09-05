// 摄像头监控视图页面逻辑

Page({
  data: {
    cameraId: '', // 摄像头ID
    camera: {}, // 摄像头信息
    loading: true, // 加载状态
    error: '', // 错误信息
    isRecording: false, // 是否正在录制
    recordingTime: 0, // 录制时长（秒）
    recordingTimer: null, // 录制计时器
    recordingLoading: false // 录制操作加载状态
  },

  onLoad: function(options) {
    if (options && options.cameraId) {
      this.setData({
        cameraId: options.cameraId
      });
      this.fetchCameraInfo();
    } else {
      this.handleError('未找到摄像头ID');
    }
  },

  onUnload: function() {
    // 页面卸载时清理资源
    if (this.data.recordingTimer) {
      clearInterval(this.data.recordingTimer);
    }
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 获取摄像头信息
  fetchCameraInfo: function() {
    const that = this;
    
    that.setData({
      loading: true,
      error: ''
    });

    wx.request({
      url: getApp().globalData.baseUrl + '/api/robot/cameras/' + that.data.cameraId,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: function(res) {
        if (res.statusCode === 200) {
          that.setData({
            camera: res.data.data || {},
            loading: false
          });
        } else {
          that.handleError('获取摄像头信息失败：' + (res.data.message || '未知错误'));
        }
      },
      fail: function(err) {
        console.error('获取摄像头信息失败:', err);
        
        // 模拟数据 - 在实际环境中，这部分应该被移除
        const mockCamera = {
          cameraId: that.data.cameraId,
          name: '机器人摄像头',
          location: '教室A',
          status: 'online',
          robotId: 'robot-001',
          type: 'robot',
          streamUrl: getApp().globalData.baseUrl + '/api/robot/streams/' + that.data.cameraId + '.m3u8',
          resolution: '1920x1080',
          frameRate: 30,
          hasAudio: true,
          supportsPTZ: true,
          supportsRecording: true
        };
        
        that.setData({
          camera: mockCamera,
          loading: false
        });
      },
      complete: function() {
        that.setData({
          loading: false
        });
      }
    });
  },

  // 视频加载错误处理
  videoError: function(e) {
    console.error('视频加载错误:', e);
    this.handleError('视频加载失败，请稍后重试');
  },

  // 控制摄像头云台
  controlPTZ: function(e) {
    const action = e.currentTarget.dataset.action;
    const that = this;
    
    wx.request({
      url: getApp().globalData.baseUrl + '/api/robot/cameras/' + that.data.cameraId + '/ptz',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      data: {
        action: action
      },
      success: function(res) {
        if (res.statusCode !== 200) {
          that.handleError('云台控制失败：' + (res.data.message || '未知错误'));
        }
      },
      fail: function(err) {
        console.error('云台控制失败:', err);
        that.handleError('云台控制失败，请稍后重试');
      }
    });
  },

  // 开始录制
  startRecording: function() {
    const that = this;
    
    if (this.data.recordingLoading) {
      return;
    }
    
    this.setData({
      recordingLoading: true
    });

    wx.request({
      url: getApp().globalData.baseUrl + '/api/robot/cameras/' + that.data.cameraId + '/recording/start',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: function(res) {
        if (res.statusCode === 200) {
          that.startRecordingTimer();
          that.setData({
            isRecording: true,
            recordingTime: 0
          });
        } else {
          that.handleError('开始录制失败：' + (res.data.message || '未知错误'));
        }
      },
      fail: function(err) {
        console.error('开始录制失败:', err);
        that.handleError('开始录制失败，请稍后重试');
      },
      complete: function() {
        that.setData({
          recordingLoading: false
        });
      }
    });
  },

  // 停止录制
  stopRecording: function() {
    const that = this;
    
    if (this.data.recordingLoading) {
      return;
    }
    
    this.setData({
      recordingLoading: true
    });

    wx.request({
      url: getApp().globalData.baseUrl + '/api/robot/cameras/' + that.data.cameraId + '/recording/stop',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: function(res) {
        if (res.statusCode === 200) {
          that.stopRecordingTimer();
          that.setData({
            isRecording: false,
            recordingTime: 0
          });
          wx.showToast({
            title: '录制已保存',
            icon: 'success'
          });
        } else {
          that.handleError('停止录制失败：' + (res.data.message || '未知错误'));
        }
      },
      fail: function(err) {
        console.error('停止录制失败:', err);
        that.handleError('停止录制失败，请稍后重试');
      },
      complete: function() {
        that.setData({
          recordingLoading: false
        });
      }
    });
  },

  // 开始录制计时器
  startRecordingTimer: function() {
    const that = this;
    const timer = setInterval(function() {
      that.setData({
        recordingTime: that.data.recordingTime + 1
      });
    }, 1000);
    
    this.setData({
      recordingTimer: timer
    });
  },

  // 停止录制计时器
  stopRecordingTimer: function() {
    if (this.data.recordingTimer) {
      clearInterval(this.data.recordingTimer);
      this.setData({
        recordingTimer: null
      });
    }
  },

  // 处理错误
  handleError: function(message) {
    this.setData({
      error: message,
      loading: false
    });
    
    // 3秒后隐藏错误提示
    setTimeout(() => {
      this.setData({
        error: ''
      });
    }, 3000);
  }
});