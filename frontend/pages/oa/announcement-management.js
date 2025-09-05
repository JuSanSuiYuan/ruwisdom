// 公告管理页面逻辑
Page({
  data: {
    announcements: [],
    searchKeyword: '',
    typeIndex: 0, // 0: 全部, 1: 系统公告, 2: 学校通知, 3: 活动通知, 4: 其他
    statusIndex: 0, // 0: 全部, 1: 已发布, 2: 草稿
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
    showDialog: false,
    editingAnnouncement: false,
    currentAnnouncement: {
      id: '',
      title: '',
      type: '',
      typeIndex: 0,
      content: '',
      scope: ['student', 'teacher', 'parent'], // 默认全选
      status: 'draft', // draft: 草稿, published: 已发布
      publishDate: '',
      author: ''
    },
    currentAction: 'publish' // publish: 立即发布, save: 保存为草稿
  },

  onLoad: function() {
    // 获取用户信息作为发布人
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      'currentAnnouncement.author': userInfo.name || '管理员'
    });
    // 加载公告列表
    this.loadAnnouncements();
  },

  // 加载公告列表
  loadAnnouncements: function() {
    const { searchKeyword, typeIndex, statusIndex, currentPage, pageSize } = this.data;
    
    // 构建查询参数
    const queryParams = {
      page: currentPage,
      pageSize: pageSize,
      keyword: searchKeyword
    };
    
    // 添加类型筛选（不为0时）
    if (typeIndex !== 0) {
      queryParams.type = ['全部', '系统公告', '学校通知', '活动通知', '其他'][typeIndex];
    }
    
    // 添加状态筛选（不为0时）
    if (statusIndex !== 0) {
      queryParams.status = statusIndex === 1 ? 'published' : 'draft';
    }

    wx.request({
      url: 'http://localhost:5000/api/oa/announcements',
      method: 'GET',
      data: queryParams,
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            announcements: res.data.data.announcements || [],
            totalCount: res.data.data.totalCount || 0,
            totalPages: Math.ceil((res.data.data.totalCount || 0) / pageSize)
          });
        } else {
          wx.showToast({
            title: res.data.message || '加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('加载公告列表失败:', err);
        wx.showToast({
          title: '网络错误，加载失败',
          icon: 'none'
        });
        // 提供模拟数据
        this.setData({
          announcements: [
            {
              id: '1',
              title: '新学期开学通知',
              type: '学校通知',
              content: '尊敬的各位师生，新学期将于9月1日正式开学，请大家提前做好准备。',
              scope: ['student', 'teacher', 'parent'],
              status: 'published',
              publishDate: '2023-08-15',
              author: '张三'
            },
            {
              id: '2',
              title: '校园安全讲座通知',
              type: '活动通知',
              content: '为增强师生安全意识，学校将于9月10日举办校园安全讲座，请全体师生参加。',
              scope: ['student', 'teacher'],
              status: 'published',
              publishDate: '2023-09-05',
              author: '李四'
            },
            {
              id: '3',
              title: '系统升级公告',
              type: '系统公告',
              content: '学校系统将于9月15日凌晨2点-4点进行升级维护，期间系统可能暂时无法访问。',
              scope: ['student', 'teacher', 'parent'],
              status: 'draft',
              publishDate: '',
              author: '王五'
            }
          ],
          totalCount: 3,
          totalPages: 1
        });
      }
    });
  },

  // 搜索输入
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    // 重置到第一页
    this.setData({
      currentPage: 1
    });
    // 重新加载
    this.loadAnnouncements();
  },

  // 类型筛选
  onTypeChange: function(e) {
    this.setData({
      typeIndex: e.detail.value,
      currentPage: 1
    });
    this.loadAnnouncements();
  },

  // 状态筛选
  onStatusChange: function(e) {
    this.setData({
      statusIndex: e.detail.value,
      currentPage: 1
    });
    this.loadAnnouncements();
  },

  // 上一页
  prevPage: function() {
    if (this.data.currentPage > 1) {
      this.setData({
        currentPage: this.data.currentPage - 1
      });
      this.loadAnnouncements();
    }
  },

  // 下一页
  nextPage: function() {
    if (this.data.currentPage < this.data.totalPages) {
      this.setData({
        currentPage: this.data.currentPage + 1
      });
      this.loadAnnouncements();
    }
  },

  // 显示添加公告弹窗
  showAddAnnouncementDialog: function() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      showDialog: true,
      editingAnnouncement: false,
      currentAction: 'publish',
      currentAnnouncement: {
        id: '',
        title: '',
        type: '',
        typeIndex: 0,
        content: '',
        scope: ['student', 'teacher', 'parent'],
        status: 'draft',
        publishDate: '',
        author: userInfo.name || '管理员'
      }
    });
  },

  // 隐藏弹窗
  hideDialog: function() {
    this.setData({
      showDialog: false
    });
  },

  // 编辑公告
  editAnnouncement: function(e) {
    const id = e.currentTarget.dataset.id;
    const announcement = this.data.announcements.find(item => item.id === id);
    if (announcement) {
      const typeIndex = ['系统公告', '学校通知', '活动通知', '其他'].indexOf(announcement.type);
      this.setData({
        showDialog: true,
        editingAnnouncement: true,
        currentAction: 'publish',
        currentAnnouncement: {
          ...announcement,
          typeIndex: typeIndex >= 0 ? typeIndex : 0
        }
      });
    }
  },

  // 标题输入
  onTitleInput: function(e) {
    this.setData({
      'currentAnnouncement.title': e.detail.value
    });
  },

  // 类型选择
  onAnnouncementTypeChange: function(e) {
    const typeIndex = e.detail.value;
    const type = ['系统公告', '学校通知', '活动通知', '其他'][typeIndex];
    this.setData({
      'currentAnnouncement.typeIndex': typeIndex,
      'currentAnnouncement.type': type
    });
  },

  // 内容输入
  onContentInput: function(e) {
    this.setData({
      'currentAnnouncement.content': e.detail.value
    });
  },

  // 发布范围选择
  onScopeChange: function(e) {
    this.setData({
      'currentAnnouncement.scope': e.detail.value
    });
  },

  // 操作选择（发布或保存草稿）
  onActionChange: function(e) {
    this.setData({
      currentAction: e.detail.value
    });
  },

  // 保存公告
  saveAnnouncement: function() {
    const { currentAnnouncement, editingAnnouncement, currentAction } = this.data;
    
    // 表单验证
    if (!currentAnnouncement.title || !currentAnnouncement.type || !currentAnnouncement.content) {
      wx.showToast({
        title: '请填写必填信息',
        icon: 'none'
      });
      return;
    }

    // 设置状态
    const data = {
      ...currentAnnouncement,
      status: currentAction === 'publish' ? 'published' : 'draft',
      publishDate: currentAction === 'publish' ? this.formatDate(new Date()) : ''
    };

    const method = editingAnnouncement ? 'PUT' : 'POST';
    const url = editingAnnouncement 
      ? `http://localhost:5000/api/oa/announcements/${currentAnnouncement.id}` 
      : 'http://localhost:5000/api/oa/announcements';

    wx.request({
      url: url,
      method: method,
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      data: data,
      success: (res) => {
        if (res.data.success) {
          this.hideDialog();
          this.loadAnnouncements();
          wx.showToast({
            title: editingAnnouncement ? '修改成功' : (currentAction === 'publish' ? '发布成功' : '保存成功')
          });
        } else {
          wx.showToast({
            title: res.data.message || '操作失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('保存公告失败:', err);
        wx.showToast({
          title: '网络错误，操作失败',
          icon: 'none'
        });
        // 模拟操作成功
        setTimeout(() => {
          this.hideDialog();
          this.loadAnnouncements();
          wx.showToast({
            title: editingAnnouncement ? '修改成功（模拟）' : (currentAction === 'publish' ? '发布成功（模拟）' : '保存成功（模拟）')
          });
        }, 1000);
      }
    });
  },

  // 发布公告（从草稿状态）
  publishAnnouncement: function(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.request({
      url: `http://localhost:5000/api/oa/announcements/${id}/publish`,
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success) {
          this.loadAnnouncements();
          wx.showToast({
            title: '发布成功'
          });
        } else {
          wx.showToast({
            title: res.data.message || '发布失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('发布公告失败:', err);
        wx.showToast({
          title: '网络错误，发布失败',
          icon: 'none'
        });
        // 模拟发布成功
        setTimeout(() => {
          this.loadAnnouncements();
          wx.showToast({
            title: '发布成功（模拟）'
          });
        }, 1000);
      }
    });
  },

  // 删除公告
  deleteAnnouncement: function(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.request({
      url: `http://localhost:5000/api/oa/announcements/${id}`,
      method: 'DELETE',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success) {
          this.loadAnnouncements();
          wx.showToast({
            title: '删除成功'
          });
        } else {
          wx.showToast({
            title: res.data.message || '删除失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('删除公告失败:', err);
        wx.showToast({
          title: '网络错误，删除失败',
          icon: 'none'
        });
        // 模拟删除成功
        setTimeout(() => {
          this.loadAnnouncements();
          wx.showToast({
            title: '删除成功（模拟）'
          });
        }, 1000);
      }
    });
  },

  // 格式化日期
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});