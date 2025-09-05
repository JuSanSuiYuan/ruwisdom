// 课程表页面逻辑

Page({
  data: {
    // 当前显示的周次
    currentWeek: 1,
    // 最大周次
    maxWeek: 20,
    // 星期列表
    weekdays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    // 课程数据
    courseData: [],
    // 时间段
    timeSlots: [
      { start: '08:00', end: '08:45' },
      { start: '08:55', end: '09:40' },
      { start: '10:00', end: '10:45' },
      { start: '10:55', end: '11:40' },
      { start: '13:30', end: '14:15' },
      { start: '14:25', end: '15:10' },
      { start: '15:30', end: '16:15' },
      { start: '16:25', end: '17:10' }
    ],
    // 加载状态
    isLoading: true,
    // 学生信息
    studentInfo: {
      name: '',
      grade: '',
      class: ''
    }
  },

  onLoad: function() {
    // 加载学生信息和课程表数据
    this.loadStudentInfo();
    this.loadCourseData();
  },

  onShow: function() {
    // 页面显示时检查是否有课程变动
    if (!this.data.isLoading) {
      this.checkCourseChanges();
    }
  },

  // 加载学生信息
  loadStudentInfo: function() {
    // 模拟获取学生信息
    const mockStudentInfo = {
      name: '张三',
      grade: '高二',
      class: '一班'
    };
    
    this.setData({
      studentInfo: mockStudentInfo
    });
  },

  // 加载课程表数据
  loadCourseData: function() {
    wx.showLoading({ title: '加载中...' });
    this.setData({ isLoading: true });

    // 模拟异步请求获取课程数据
    setTimeout(() => {
      const mockCourseData = this.generateMockCourseData();
      
      this.setData({
        courseData: mockCourseData,
        isLoading: false
      });

      wx.hideLoading();
    }, 1000);
  },

  // 检查课程变动
  checkCourseChanges: function() {
    // 模拟检查课程变动，实际项目中应该从服务器获取最新的课程变更信息
    const hasChanges = Math.random() > 0.7; // 模拟70%概率没有变动，30%概率有变动
    
    if (hasChanges) {
      wx.showModal({
        title: '课程变动提醒',
        content: '发现您的课程表有更新，是否立即刷新查看？',
        success: (res) => {
          if (res.confirm) {
            this.loadCourseData();
          }
        }
      });
    }
  },

  // 生成模拟课程数据
  generateMockCourseData: function() {
    const weekCourseData = [];
    
    // 为每周的每一天生成课程
    for (let day = 0; day < 5; day++) { // 周一到周五
      const dayCourses = [];
      
      // 为每个时间段生成课程
      for (let slot = 0; slot < this.data.timeSlots.length; slot++) {
        // 随机生成课程，模拟不同的课程安排
        const random = Math.random();
        let course = null;
        
        if (random > 0.3) { // 70%概率有课程
          // 课程信息
          const courseNames = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];
          const teachers = ['张老师', '李老师', '王老师', '赵老师', '陈老师'];
          const classrooms = ['101', '102', '201', '202', '301', '302'];
          
          // 模拟课程变动 - 周二的第二节课数学老师请假
          if (day === 1 && slot === 1) {
            course = {
              name: '数学(变动)',
              teacher: '王老师(代)',
              classroom: classrooms[Math.floor(Math.random() * classrooms.length)],
              isChanged: true,
              originalTeacher: '张老师',
              changeReason: '张老师临时有事'
            };
          } else {
            course = {
              name: courseNames[Math.floor(Math.random() * courseNames.length)],
              teacher: teachers[Math.floor(Math.random() * teachers.length)],
              classroom: classrooms[Math.floor(Math.random() * classrooms.length)],
              isChanged: false
            };
          }
        }
        
        dayCourses.push(course);
      }
      
      weekCourseData.push(dayCourses);
    }
    
    // 周六和周日没有课程
    for (let day = 5; day < 7; day++) {
      const dayCourses = [];
      for (let slot = 0; slot < this.data.timeSlots.length; slot++) {
        dayCourses.push(null);
      }
      weekCourseData.push(dayCourses);
    }
    
    return weekCourseData;
  },

  // 上一周
  prevWeek: function() {
    if (this.data.currentWeek > 1) {
      this.setData({
        currentWeek: this.data.currentWeek - 1
      });
      this.loadCourseData();
    }
  },

  // 下一周
  nextWeek: function() {
    if (this.data.currentWeek < this.data.maxWeek) {
      this.setData({
        currentWeek: this.data.currentWeek + 1
      });
      this.loadCourseData();
    }
  },

  // 点击课程查看详情
  onCourseClick: function(e) {
    const { day, slot } = e.currentTarget.dataset;
    const course = this.data.courseData[day][slot];
    
    if (course && course.isChanged) {
      wx.showModal({
        title: '课程变动详情',
        content: `${course.name}\n原教师: ${course.originalTeacher}\n代课教师: ${course.teacher}\n教室: ${course.classroom}\n变动原因: ${course.changeReason}`,
        showCancel: false
      });
    }
  },

  // 分享课程表
  onShareAppMessage: function() {
    return {
      title: `${this.data.studentInfo.name}的课程表 - 第${this.data.currentWeek}周`,
      path: `/pages/schedule/courseSchedule?week=${this.data.currentWeek}`
    };
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadCourseData();
    wx.stopPullDownRefresh();
  }
});