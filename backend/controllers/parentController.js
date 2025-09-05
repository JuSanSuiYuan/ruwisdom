// 家长控制器

const Parent = require('../models/Parent');
const User = require('../models/User');
const Student = require('../models/Student');
const { validationResult } = require('express-validator');

// 获取家长列表
exports.getParents = async (req, res) => {
  try {
    // 获取查询参数
    const { keyword, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const query = {};
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { company: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 执行查询
    const parents = await Parent.find(query)
      .populate('user', 'username name phone email avatar')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // 获取总数
    const total = await Parent.countDocuments(query);

    res.status(200).json({
      success: true,
      data: parents,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      message: '获取家长列表成功'
    });

  } catch (error) {
    console.error('获取家长列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取单个家长详情
exports.getParentById = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找家长
    const parent = await Parent.findById(id)
      .populate('user', 'username name phone email avatar')
      .populate('childStudents.studentId', 'name studentId grade className');

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: '家长不存在'
      });
    }

    res.status(200).json({
      success: true,
      data: parent,
      message: '获取家长详情成功'
    });

  } catch (error) {
    console.error('获取家长详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 创建家长
exports.createParent = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, phone, email, childStudents } = req.body;

    // 创建用户账号
    const defaultPassword = '123456'; // 默认密码，首次登录需修改
    const username = phone || 'parent_' + Date.now();
    const user = new User({
      username,
      password: defaultPassword,
      name: name,
      phone: phone,
      email: email,
      role: 'parent',
      status: 'active',
      createdBy: req.user.id
    });
    await user.save();

    // 创建家长信息
    const parent = new Parent({
      userId: user._id,
      isPrimaryContact: true,
      childStudents: childStudents || []
    });
    await parent.save();

    // 更新关联学生的家长信息
    if (childStudents && childStudents.length > 0) {
      for (const child of childStudents) {
        await Student.findByIdAndUpdate(child.studentId, {
          $addToSet: { parentIds: parent._id }
        });
      }
    }

    res.status(201).json({
      success: true,
      data: parent,
      message: '创建家长成功'
    });

  } catch (error) {
    console.error('创建家长失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 更新家长信息
exports.updateParent = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // 查找并更新家长
    const parent = await Parent.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('user', 'username name phone email avatar');

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: '家长不存在'
      });
    }

    // 如果更新了用户相关信息，同时更新用户表
    if (updateData.name || updateData.phone || updateData.email) {
      await User.findByIdAndUpdate(parent.userId, {
        name: updateData.name || parent.name,
        phone: updateData.phone || undefined,
        email: updateData.email || undefined
      });
    }

    // 处理子学生信息更新
    if (updateData.childStudents) {
      // 先获取当前家长关联的学生ID
      const currentStudentIds = parent.childStudents.map(child => child.studentId.toString());
      // 获取新的学生ID列表
      const newStudentIds = updateData.childStudents.map(child => child.studentId.toString());
      
      // 添加新关联的学生
      const addedStudentIds = newStudentIds.filter(id => !currentStudentIds.includes(id));
      for (const studentId of addedStudentIds) {
        await Student.findByIdAndUpdate(studentId, {
          $addToSet: { parentIds: parent._id }
        });
      }
      
      // 移除不再关联的学生
      const removedStudentIds = currentStudentIds.filter(id => !newStudentIds.includes(id));
      for (const studentId of removedStudentIds) {
        await Student.findByIdAndUpdate(studentId, {
          $pull: { parentIds: parent._id }
        });
      }
    }

    res.status(200).json({
      success: true,
      data: parent,
      message: '更新家长信息成功'
    });

  } catch (error) {
    console.error('更新家长信息失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 删除家长
exports.deleteParent = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找家长
    const parent = await Parent.findById(id);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: '家长不存在'
      });
    }

    // 移除与学生的关联
    if (parent.childStudents && parent.childStudents.length > 0) {
      for (const child of parent.childStudents) {
        await Student.findByIdAndUpdate(child.studentId, {
          $pull: { parentIds: parent._id }
        });
      }
    }

    // 删除关联的用户
    await User.findByIdAndDelete(parent.userId);
    
    // 删除家长信息
    await parent.remove();

    res.status(200).json({
      success: true,
      message: '删除家长成功'
    });

  } catch (error) {
    console.error('删除家长失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 添加家长反馈
exports.addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, content } = req.body;

    // 查找家长
    const parent = await Parent.findById(id);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: '家长不存在'
      });
    }

    // 添加反馈记录
    parent.feedbackRecords.push({
      type,
      content,
      date: new Date(),
      replied: false
    });

    await parent.save();

    res.status(200).json({
      success: true,
      data: parent,
      message: '添加反馈成功'
    });

  } catch (error) {
    console.error('添加反馈失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 回复家长反馈
exports.replyFeedback = async (req, res) => {
  try {
    const { id, feedbackId } = req.params;
    const { replyContent } = req.body;

    // 查找家长
    const parent = await Parent.findById(id);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: '家长不存在'
      });
    }

    // 查找并回复反馈
    const feedbackIndex = parent.feedbackRecords.findIndex(record => record._id.toString() === feedbackId);
    if (feedbackIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '反馈记录不存在'
      });
    }

    parent.feedbackRecords[feedbackIndex].replied = true;
    parent.feedbackRecords[feedbackIndex].replyContent = replyContent;
    parent.feedbackRecords[feedbackIndex].replyDate = new Date();

    await parent.save();

    res.status(200).json({
      success: true,
      data: parent,
      message: '回复反馈成功'
    });

  } catch (error) {
    console.error('回复反馈失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取家长参与度分析
exports.getParentParticipationAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找家长
    const parent = await Parent.findById(id)
      .populate('user', 'name')
      .populate('childStudents.studentId', 'name studentId grade className');
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: '家长不存在'
      });
    }

    // 计算参与度相关指标
    const totalFeedbacks = parent.feedbackRecords.length;
    const repliedFeedbacks = parent.feedbackRecords.filter(record => record.replied).length;
    const meetingCount = parent.meetingRecords.length;
    const attendedMeetings = parent.meetingRecords.filter(record => record.attended).length;
    
    // 计算参与度评分（示例算法）
    let participationScore = parent.participationScore || 50;
    
    // 计算反馈回复率
    const feedbackReplyRate = totalFeedbacks > 0 ? (repliedFeedbacks / totalFeedbacks) * 100 : 0;
    
    // 计算会议出勤率
    const meetingAttendanceRate = meetingCount > 0 ? (attendedMeetings / meetingCount) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        parent: {
          id: parent._id,
          name: parent.user?.name,
          participationScore
        },
        children: parent.childStudents.map(child => ({
          id: child.studentId?._id,
          name: child.studentId?.name,
          studentId: child.studentId?.studentId,
          relation: child.relation
        })),
        statistics: {
          totalFeedbacks,
          repliedFeedbacks,
          feedbackReplyRate: parseFloat(feedbackReplyRate.toFixed(2)),
          meetingCount,
          attendedMeetings,
          meetingAttendanceRate: parseFloat(meetingAttendanceRate.toFixed(2))
        }
      },
      message: '获取家长参与度分析成功'
    });

  } catch (error) {
    console.error('获取家长参与度分析失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取家长关联的学生
exports.getParentChildren = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找家长
    const parent = await Parent.findById(id).populate('childStudents.studentId', 'name studentId grade className headTeacherId');
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: '家长不存在'
      });
    }

    // 获取关联的学生信息
    const children = parent.childStudents.map(child => ({
      studentId: child.studentId._id,
      name: child.studentId.name,
      studentNumber: child.studentId.studentId,
      grade: child.studentId.grade,
      className: child.studentId.className,
      headTeacherId: child.studentId.headTeacherId,
      relation: child.relation
    }));

    res.status(200).json({
      success: true,
      data: children,
      message: '获取家长关联学生成功'
    });

  } catch (error) {
    console.error('获取家长关联学生失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};