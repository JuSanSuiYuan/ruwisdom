// election-detail.js
Page({
  data: {
    electionId: '',
    electionDetail: {},
    candidates: [],
    isVoted: false,
    loading: true,
    selectedCandidateId: null
  },

  onLoad: function(options) {
    if (options && options.id) {
      this.setData({ electionId: options.id });
      this.fetchElectionDetail();
    } else {
      wx.showToast({ title: '参数错误', icon: 'none' });
      wx.navigateBack();
    }
  },

  // 获取竞选详情
  fetchElectionDetail: function() {
    const that = this;
    this.setData({ loading: true });

    // 模拟请求数据
    setTimeout(() => {
      // 模拟数据
      const mockDetail = {
        id: 1,
        title: "第12周班长竞选",
        position: "班长",
        status: "ongoing",
        startTime: "2024-10-15 08:00",
        endTime: "2024-10-15 18:00",
        description: "每周一次的班长竞选，班长将拥有组织班级活动、协助老师管理班级、代表班级发言等重要权限。请同学们认真投票，选出你们信任的班长。",
        rules: "1. 每位同学只能投一票\n2. 投票后不能修改\n3. 得票最多者当选\n4. 班长任期为一周",
        currentVotes: 28,
        totalStudents: 45,
        // 班长特殊权限
        positionPermissions: [
          "组织班级日常活动",
          "协助老师管理班级纪律",
          "收集和反馈同学意见",
          "代表班级参加学校活动",
          "在课程表系统中查看班级所有同学的出勤情况",
          "在通知系统中发布班级内部通知",
          "获得优先使用班级公共资源的权利"
        ]
      };

      const mockCandidates = [
        {
          id: 101,
          name: "张三",
          avatar: "/resources/avatars/student1.png",
          votes: 15,
          slogan: "我会用心为班级服务，组织更多有趣的活动！",
          description: "学习成绩优秀，积极参加班级活动，有较强的组织能力。"
        },
        {
          id: 102,
          name: "李四",
          avatar: "/resources/avatars/student2.png",
          votes: 8,
          slogan: "让我们一起创建更美好的班级环境！",
          description: "性格开朗，善于沟通，乐于助人，受到同学们的喜爱。"
        },
        {
          id: 103,
          name: "王五",
          avatar: "/resources/avatars/student3.png",
          votes: 5,
          slogan: "公平公正，为大家服务！",
          description: "做事认真负责，有较强的责任心和团队合作精神。"
        }
      ];

      // 模拟是否已投票
      const isVoted = false; // 这里可以根据实际情况判断

      that.setData({
        electionDetail: mockDetail,
        candidates: mockCandidates,
        isVoted: isVoted,
        loading: false
      });
    }, 1000);
  },

  // 选择候选人
  selectCandidate: function(e) {
    if (this.data.isVoted || this.data.electionDetail.status !== 'ongoing') {
      return;
    }
    const candidateId = e.currentTarget.dataset.id;
    this.setData({ selectedCandidateId: candidateId });
  },

  // 提交投票
  submitVote: function() {
    if (!this.data.selectedCandidateId) {
      wx.showToast({ title: '请选择候选人', icon: 'none' });
      return;
    }

    if (this.data.isVoted) {
      wx.showToast({ title: '您已投票', icon: 'none' });
      return;
    }

    if (this.data.electionDetail.status !== 'ongoing') {
      wx.showToast({ title: '投票已结束', icon: 'none' });
      return;
    }

    const that = this;
    wx.showLoading({ title: '投票中...' });

    // 模拟投票请求
    setTimeout(() => {
      // 更新投票数据
      const updatedCandidates = that.data.candidates.map(candidate => {
        if (candidate.id === that.data.selectedCandidateId) {
          return {
            ...candidate,
            votes: candidate.votes + 1
          };
        }
        return candidate;
      });

      that.setData({
        candidates: updatedCandidates,
        isVoted: true,
        'electionDetail.currentVotes': that.data.electionDetail.currentVotes + 1
      });

      wx.hideLoading();
      wx.showToast({ title: '投票成功', icon: 'success' });
    }, 1000);
  },

  // 返回上一页
  onBackTap: function() {
    wx.navigateBack();
  },

  // 获取状态文本
  getStatusText: function(status) {
    switch(status) {
      case 'ongoing':
        return '进行中';
      case 'ended':
        return '已结束';
      case 'upcoming':
        return '即将开始';
      default:
        return '未知状态';
    }
  }
});