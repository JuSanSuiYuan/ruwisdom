// 摄像头监控列表页面逻辑

Page({
  data: {
    cameras: [], // 摄像头列表
    loading: true, // 加载状态
    error: '' // 错误信息
  },

  onLoad: function() {
    // 页面加载时获取摄像头列表
    this.fetchCameraList();
  },

  onShow: function() {
    // 页面显示时刷新摄像头列表
    this.fetchCameraList();
  },

  // 获取摄像头列表
  fetchCameraList: function() {
    const that = this;
    
    that.setData({
      loading: true,
      error: ''
    });

    wx.request({
      url: getApp().globalData.baseUrl + '/api/robot/user/cameras',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: function(res) {
        if (res.statusCode === 200) {
          that.setData({
            cameras: res.data.data || [],
            loading: false
          });
        } else {
          that.handleError('获取摄像头列表失败：' + (res.data.message || '未知错误'));
        }
      },
      fail: function(err) {
        console.error('获取摄像头列表失败:', err);
        
        // 模拟数据 - 在实际环境中，这部分应该被移除
        const mockCameras = [
          {
            cameraId: 'robot-cam-001',
            name: '机器人摄像头',
            location: '教室A',
            status: 'online',
            robotId: 'robot-001',
            type: 'robot',
            streamUrl: '/api/robot/streams/robot-cam-001.m3u8',
            resolution: '1920x1080',
            frameRate: 30,
            hasAudio: true
          },
          {
            cameraId: 'classroom-cam-001',
            name: '教室摄像头',
            location: '教室A',
            status: 'online',
            robotId: null,
            type: 'fixed',
            streamUrl: '/api/robot/streams/classroom-cam-001.m3u8',
            resolution: '1280x720',
            frameRate: 25,
            hasAudio: true
          }
        ];
        
        that.setData({
          cameras: mockCameras,
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

  // 查看摄像头
  viewCamera: function(e) {
    const cameraId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/camera/camera-view?cameraId=' + cameraId
    });
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
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.fetchCameraList();
    wx.stopPullDownRefresh();
  }
});