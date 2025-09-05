// 通知详情页面逻辑

Page({
  data: {
    // 通知ID
    notificationId: '',
    // 通知详情数据
    notificationDetail: null,
    // 加载状态
    isLoading: true
  },

  onLoad: function(options) {
    // 获取通知ID
    if (options && options.id) {
      this.setData({
        notificationId: options.id
      });
      // 加载通知详情
      this.loadNotificationDetail();
    }
  },

  // 加载通知详情
  loadNotificationDetail: function() {
    wx.showLoading({ title: '加载中...' });
    this.setData({ isLoading: true });

    // 模拟异步请求获取通知详情
    setTimeout(() => {
      const notificationDetail = this.generateMockNotificationDetail();
      
      this.setData({
        notificationDetail: notificationDetail,
        isLoading: false
      });

      wx.hideLoading();
      
      // 标记为已读
      this.markAsRead();
    }, 800);
  },

  // 生成模拟通知详情
  generateMockNotificationDetail: function() {
    const mockDetails = {
      'sys1': {
        id: 'sys1',
        title: '新学期开学典礼通知',
        content: '尊敬的家长和学生们：\n\n新学期开学典礼将于9月1日上午8:30在学校操场举行，请全体师生准时参加。开学典礼将包括校长致辞、教师代表发言、学生代表发言等环节，同时将颁发上学期的优秀学生奖学金。\n\n请家长朋友们提醒学生穿着整洁的校服，佩戴红领巾，提前15分钟到达操场集合。\n\n如有特殊情况无法参加，请提前向班主任请假。\n\n祝同学们新学期学业进步！\n\n学校办公室\n2023年8月28日',
        time: '2023-08-28 09:30',
        type: 1,
        typeName: '系统通知',
        attachments: [
          { name: '开学典礼流程安排.pdf', url: '/attachments/campus_meeting.pdf' }
        ]
      },
      'sys2': {
        id: 'sys2',
        title: '国庆节放假通知',
        content: '根据国家法定节假日安排，结合学校实际情况，现将2023年国庆节放假安排通知如下：\n\n放假时间：10月1日（周日）至10月7日（周六），共7天。\n\n上课时间：10月8日（周日）正常上课，按周一课表执行。\n\n注意事项：\n1. 请家长督促学生合理安排假期时间，完成假期作业。\n2. 外出游玩时请注意安全，做好疫情防护措施。\n3. 假期结束后，请按时返校上课。\n\n祝大家假期愉快！\n\n学校办公室\n2023年8月25日',
        time: '2023-08-25 14:10',
        type: 1,
        typeName: '系统通知'
      },
      'course1': {
        id: 'course1',
        title: '课程调整通知',
        content: '尊敬的家长和同学们：\n\n由于张老师临时有事，原定于9月1日上午第二节的数学课调整为下午第三节，请注意查看新的课程表。\n\n具体调整如下：\n原课程：数学，时间：9月1日 10:00-10:45，教师：张老师\n新课程：数学，时间：9月1日 15:30-16:15，教师：张老师\n\n请同学们相互转告，按时参加课程。如有疑问，请联系班主任。\n\n教务处\n2023年8月31日',
        time: '2023-08-31 16:45',
        type: 2,
        typeName: '课程通知',
        courseInfo: {
          originalCourse: '数学',
          originalTime: '9月1日 10:00-10:45',
          newCourse: '数学',
          newTime: '9月1日 15:30-16:15',
          teacher: '张老师',
          reason: '张老师临时有事'
        },
        relatedCourseUrl: '/pages/schedule/courseSchedule?date=2023-09-01'
      },
      'course2': {
        id: 'course2',
        title: '新教师代课通知',
        content: '尊敬的家长和同学们：\n\n李老师因病请假一周，9月5日至9月9日的英语课将由王老师代课。王老师是我校资深英语教师，教学经验丰富，请同学们积极配合王老师的教学工作。\n\n具体安排如下：\n影响日期：9月5日至9月9日\n原教师：李老师\n代课教师：王老师\n课程名称：英语\n\n如有疑问，请联系班主任。\n\n教务处\n2023年9月4日',
        time: '2023-09-04 10:30',
        type: 2,
        typeName: '课程通知',
        courseInfo: {
          affectedDays: '9月5日至9月9日',
          originalTeacher: '李老师',
          substituteTeacher: '王老师',
          courseName: '英语',
          reason: '李老师因病请假'
        },
        relatedCourseUrl: '/pages/schedule/courseSchedule?date=2023-09-05'
      },
      'hw1': {
        id: 'hw1',
        title: '数学作业已发布',
        content: '亲爱的同学们：\n\n今天的数学作业已发布，请同学们按时完成并提交。\n\n作业内容：\n1. 课本第56-57页，习题3.1的1-8题\n2. 练习册第32-33页，全部题目\n\n提交方式：\n请于明天上课前将作业本交给课代表。\n\n如有疑问，可在作业答疑区提问或直接向老师请教。\n\n张老师\n2023年8月31日',
        time: '2023-08-31 15:20',
        type: 3,
        typeName: '作业通知',
        homeworkInfo: {
          subject: '数学',
          deadline: '2023-09-01 08:00',
          submitMethod: '纸质提交',
          teacherName: '张老师'
        }
      },
      'hw2': {
        id: 'hw2',
        title: '英语作业批改完成',
        content: '亲爱的同学们：\n\n您的英语作业已批改完成，请查看详情。\n\n作业得分：95分\n\n批改评语：作业完成得很好，单词拼写准确，语法运用正确，继续保持！\n\n如有疑问，可在作业答疑区提问或直接向老师请教。\n\n李老师\n2023年8月30日',
        time: '2023-08-30 18:40',
        type: 3,
        typeName: '作业通知',
        homeworkInfo: {
          subject: '英语',
          score: '95分',
          comment: '作业完成得很好，单词拼写准确，语法运用正确，继续保持！',
          teacherName: '李老师'
        }
      }
    };
    
    // 返回对应ID的通知详情，如果不存在则返回默认通知
    return mockDetails[this.data.notificationId] || mockDetails['sys1'];
  },

  // 标记为已读
  markAsRead: function() {
    // 实际项目中这里应该调用接口将通知标记为已读
    console.log('通知已标记为已读:', this.data.notificationId);
    
    // 更新上一个页面的通知状态
    const pages = getCurrentPages();
    if (pages.length > 1) {
      const prevPage = pages[pages.length - 2];
      if (prevPage.route === 'pages/notification/notification') {
        // 通知列表页面，刷新数据
        prevPage.refreshNotifications();
      }
    }
  },

  // 查看相关课程表
  viewRelatedCourse: function() {
    if (this.data.notificationDetail && this.data.notificationDetail.relatedCourseUrl) {
      wx.navigateTo({
        url: this.data.notificationDetail.relatedCourseUrl
      });
    }
  },

  // 打开附件
  openAttachment: function(e) {
    const { url } = e.currentTarget.dataset;
    wx.showToast({
      title: '打开附件: ' + url,
      icon: 'none'
    });
    // 实际项目中这里应该调用接口打开附件
  },

  // 返回上一页
  onBackPress: function() {
    wx.navigateBack();
  }
});