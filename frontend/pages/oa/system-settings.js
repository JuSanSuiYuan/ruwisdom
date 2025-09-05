// 系统设置页面逻辑
Page({
  data: {
    activeTab: 'system', // 当前激活的选项卡
    systemConfig: {
      systemName: '',
      schoolName: '',
      currentTerm: '',
      startDate: '',
      endDate: '',
      workDaysIndex: 0 // 默认5天工作制
    },
    calendarEvents: [],
    holidays: [],
    showCalendarDialog: false,
    showHolidayDialog: false,
    editingCalendarEvent: false,
    editingHoliday: false,
    currentCalendarEvent: {
      id: '',
      title: '',
      date: '',
      typeIndex: 0,
      description: ''
    },
    currentHoliday: {
      id: '',
      name: '',
      startDate: '',
      endDate: '',
      description: ''
    }
  },

  onLoad: function() {
    // 加载系统配置
    this.loadSystemConfig();
    // 加载校历事件
    this.loadCalendarEvents();
    // 加载假期安排
    this.loadHolidays();
  },

  // 切换选项卡
  setActiveTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
  },

  // 加载系统配置
  loadSystemConfig: function() {
    wx.request({
      url: 'http://localhost:5000/api/oa/system-config',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            systemConfig: res.data.data || this.data.systemConfig
          });
        } else {
          // 如果没有配置，使用默认配置
          console.log('使用默认系统配置');
        }
      },
      fail: (err) => {
        console.error('加载系统配置失败:', err);
        // 提供模拟数据
        this.setData({
          systemConfig: {
            systemName: '儒智慧教育平台',
            schoolName: '示例中学',
            currentTerm: '2023-2024学年第二学期',
            startDate: '2024-02-20',
            endDate: '2024-06-30',
            workDaysIndex: 0
          }
        });
      }
    });
  },

  // 加载校历事件
  loadCalendarEvents: function() {
    wx.request({
      url: 'http://localhost:5000/api/oa/calendar-events',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            calendarEvents: res.data.data || []
          });
        }
      },
      fail: (err) => {
        console.error('加载校历事件失败:', err);
        // 提供模拟数据
        this.setData({
          calendarEvents: [
            { id: '1', title: '开学典礼', date: '2024-02-20', type: '重要日期', description: '新学期开学典礼' },
            { id: '2', title: '期中考试', date: '2024-04-22', type: '考试', description: '高一年级期中考试' },
            { id: '3', title: '运动会', date: '2024-05-10', type: '活动', description: '春季运动会' }
          ]
        });
      }
    });
  },

  // 加载假期安排
  loadHolidays: function() {
    wx.request({
      url: 'http://localhost:5000/api/oa/holidays',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            holidays: res.data.data || []
          });
        }
      },
      fail: (err) => {
        console.error('加载假期安排失败:', err);
        // 提供模拟数据
        this.setData({
          holidays: [
            { id: '1', name: '清明节', startDate: '2024-04-04', endDate: '2024-04-06', description: '法定节假日' },
            { id: '2', name: '劳动节', startDate: '2024-05-01', endDate: '2024-05-05', description: '法定节假日' },
            { id: '3', name: '端午节', startDate: '2024-06-08', endDate: '2024-06-10', description: '法定节假日' }
          ]
        });
      }
    });
  },

  // 系统名称输入
  onSystemNameInput: function(e) {
    this.setData({
      'systemConfig.systemName': e.detail.value
    });
  },

  // 学校名称输入
  onSchoolNameInput: function(e) {
    this.setData({
      'systemConfig.schoolName': e.detail.value
    });
  },

  // 当前学期输入
  onCurrentTermInput: function(e) {
    this.setData({
      'systemConfig.currentTerm': e.detail.value
    });
  },

  // 开学日期选择
  onStartDateChange: function(e) {
    this.setData({
      'systemConfig.startDate': e.detail.value
    });
  },

  // 学期结束日期选择
  onEndDateChange: function(e) {
    this.setData({
      'systemConfig.endDate': e.detail.value
    });
  },

  // 每周上课天数选择
  onWorkDaysChange: function(e) {
    this.setData({
      'systemConfig.workDaysIndex': e.detail.value
    });
  },

  // 保存系统配置
  saveSystemConfig: function() {
    const { systemConfig } = this.data;
    
    // 表单验证
    if (!systemConfig.systemName || !systemConfig.schoolName || !systemConfig.currentTerm) {
      wx.showToast({
        title: '请填写必填信息',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: 'http://localhost:5000/api/oa/system-config',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      data: systemConfig,
      success: (res) => {
        if (res.data.success) {
          wx.showToast({
            title: '保存成功'
          });
        } else {
          wx.showToast({
            title: res.data.message || '保存失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('保存系统配置失败:', err);
        wx.showToast({
          title: '网络错误，保存失败',
          icon: 'none'
        });
        // 模拟保存成功
        setTimeout(() => {
          wx.showToast({
            title: '保存成功（模拟）'
          });
        }, 1000);
      }
    });
  },

  // 显示添加校历事件弹窗
  showAddCalendarDialog: function() {
    this.setData({
      showCalendarDialog: true,
      editingCalendarEvent: false,
      currentCalendarEvent: {
        id: '',
        title: '',
        date: '',
        typeIndex: 0,
        description: ''
      }
    });
  },

  // 隐藏校历事件弹窗
  hideCalendarDialog: function() {
    this.setData({
      showCalendarDialog: false
    });
  },

  // 编辑校历事件
  editCalendarEvent: function(e) {
    const id = e.currentTarget.dataset.id;
    const event = this.data.calendarEvents.find(item => item.id === id);
    if (event) {
      const typeIndex = ['重要日期', '考试', '假期', '活动', '其他'].indexOf(event.type);
      this.setData({
        showCalendarDialog: true,
        editingCalendarEvent: true,
        currentCalendarEvent: {
          ...event,
          typeIndex: typeIndex >= 0 ? typeIndex : 0
        }
      });
    }
  },

  // 校历事件标题输入
  onCalendarTitleInput: function(e) {
    this.setData({
      'currentCalendarEvent.title': e.detail.value
    });
  },

  // 校历事件日期选择
  onCalendarDateChange: function(e) {
    this.setData({
      'currentCalendarEvent.date': e.detail.value
    });
  },

  // 校历事件类型选择
  onCalendarTypeChange: function(e) {
    this.setData({
      'currentCalendarEvent.typeIndex': e.detail.value
    });
  },

  // 校历事件描述输入
  onCalendarDescInput: function(e) {
    this.setData({
      'currentCalendarEvent.description': e.detail.value
    });
  },

  // 保存校历事件
  saveCalendarEvent: function() {
    const { currentCalendarEvent, editingCalendarEvent } = this.data;
    
    // 表单验证
    if (!currentCalendarEvent.title || !currentCalendarEvent.date) {
      wx.showToast({
        title: '请填写必填信息',
        icon: 'none'
      });
      return;
    }

    const eventData = {
      ...currentCalendarEvent,
      type: ['重要日期', '考试', '假期', '活动', '其他'][currentCalendarEvent.typeIndex]
    };

    const method = editingCalendarEvent ? 'PUT' : 'POST';
    const url = editingCalendarEvent 
      ? `http://localhost:5000/api/oa/calendar-events/${currentCalendarEvent.id}` 
      : 'http://localhost:5000/api/oa/calendar-events';

    wx.request({
      url: url,
      method: method,
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      data: eventData,
      success: (res) => {
        if (res.data.success) {
          this.hideCalendarDialog();
          this.loadCalendarEvents();
          wx.showToast({
            title: editingCalendarEvent ? '修改成功' : '添加成功'
          });
        } else {
          wx.showToast({
            title: res.data.message || '操作失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('保存校历事件失败:', err);
        wx.showToast({
          title: '网络错误，操作失败',
          icon: 'none'
        });
        // 模拟操作成功
        setTimeout(() => {
          this.hideCalendarDialog();
          this.loadCalendarEvents();
          wx.showToast({
            title: editingCalendarEvent ? '修改成功（模拟）' : '添加成功（模拟）'
          });
        }, 1000);
      }
    });
  },

  // 删除校历事件
  deleteCalendarEvent: function(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.request({
      url: `http://localhost:5000/api/oa/calendar-events/${id}`,
      method: 'DELETE',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success) {
          this.loadCalendarEvents();
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
        console.error('删除校历事件失败:', err);
        wx.showToast({
          title: '网络错误，删除失败',
          icon: 'none'
        });
        // 模拟删除成功
        setTimeout(() => {
          this.loadCalendarEvents();
          wx.showToast({
            title: '删除成功（模拟）'
          });
        }, 1000);
      }
    });
  },

  // 显示添加假期弹窗
  showAddHolidayDialog: function() {
    this.setData({
      showHolidayDialog: true,
      editingHoliday: false,
      currentHoliday: {
        id: '',
        name: '',
        startDate: '',
        endDate: '',
        description: ''
      }
    });
  },

  // 隐藏假期弹窗
  hideHolidayDialog: function() {
    this.setData({
      showHolidayDialog: false
    });
  },

  // 编辑假期
  editHoliday: function(e) {
    const id = e.currentTarget.dataset.id;
    const holiday = this.data.holidays.find(item => item.id === id);
    if (holiday) {
      this.setData({
        showHolidayDialog: true,
        editingHoliday: true,
        currentHoliday: { ...holiday }
      });
    }
  },

  // 假期名称输入
  onHolidayNameInput: function(e) {
    this.setData({
      'currentHoliday.name': e.detail.value
    });
  },

  // 假期开始日期选择
  onHolidayStartDateChange: function(e) {
    this.setData({
      'currentHoliday.startDate': e.detail.value
    });
  },

  // 假期结束日期选择
  onHolidayEndDateChange: function(e) {
    this.setData({
      'currentHoliday.endDate': e.detail.value
    });
  },

  // 假期描述输入
  onHolidayDescInput: function(e) {
    this.setData({
      'currentHoliday.description': e.detail.value
    });
  },

  // 保存假期
  saveHoliday: function() {
    const { currentHoliday, editingHoliday } = this.data;
    
    // 表单验证
    if (!currentHoliday.name || !currentHoliday.startDate || !currentHoliday.endDate) {
      wx.showToast({
        title: '请填写必填信息',
        icon: 'none'
      });
      return;
    }

    // 验证日期顺序
    if (new Date(currentHoliday.startDate) > new Date(currentHoliday.endDate)) {
      wx.showToast({
        title: '开始日期不能晚于结束日期',
        icon: 'none'
      });
      return;
    }

    const method = editingHoliday ? 'PUT' : 'POST';
    const url = editingHoliday 
      ? `http://localhost:5000/api/oa/holidays/${currentHoliday.id}` 
      : 'http://localhost:5000/api/oa/holidays';

    wx.request({
      url: url,
      method: method,
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      data: currentHoliday,
      success: (res) => {
        if (res.data.success) {
          this.hideHolidayDialog();
          this.loadHolidays();
          wx.showToast({
            title: editingHoliday ? '修改成功' : '添加成功'
          });
        } else {
          wx.showToast({
            title: res.data.message || '操作失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('保存假期失败:', err);
        wx.showToast({
          title: '网络错误，操作失败',
          icon: 'none'
        });
        // 模拟操作成功
        setTimeout(() => {
          this.hideHolidayDialog();
          this.loadHolidays();
          wx.showToast({
            title: editingHoliday ? '修改成功（模拟）' : '添加成功（模拟）'
          });
        }, 1000);
      }
    });
  },

  // 删除假期
  deleteHoliday: function(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.request({
      url: `http://localhost:5000/api/oa/holidays/${id}`,
      method: 'DELETE',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success) {
          this.loadHolidays();
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
        console.error('删除假期失败:', err);
        wx.showToast({
          title: '网络错误，删除失败',
          icon: 'none'
        });
        // 模拟删除成功
        setTimeout(() => {
          this.loadHolidays();
          wx.showToast({
            title: '删除成功（模拟）'
          });
        }, 1000);
      }
    });
  }
});