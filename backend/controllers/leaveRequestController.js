// 请假申请控制器

const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { validationResult } = require('express-validator');

// 创建请假申请
exports.createLeaveRequest = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { leaveType, startDate, endDate, reason } = req.body;
    const requesterId = req.user._id;
    const requesterType = req.user.role;

    // 检查日期格式
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: '日期格式不正确'
      });
    }

    // 检查开始日期是否小于结束日期
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: '开始日期不能晚于结束日期'
      });
    }

    // 创建请假申请
    const leaveRequest = new LeaveRequest({
      requesterId,
      requesterType,
      leaveType,
      startDate: start,
      endDate: end,
      reason
    });

    await leaveRequest.save();

    res.status(201).json({
      success: true,
      data: leaveRequest,
      message: '请假申请提交成功'
    });

  } catch (error) {
    console.error('创建请假申请失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取当前用户的请假申请列表
exports.getMyLeaveRequests = async (req, res) => {
  try {
    const requesterId = req.user._id;
    const requesterType = req.user.role;
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const query = { requesterId, requesterType };
    if (status) query.status = status;

    // 执行查询
    const leaveRequests = await LeaveRequest.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate('approvedBy', 'name');

    // 获取总数
    const total = await LeaveRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: leaveRequests,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      message: '获取请假申请列表成功'
    });

  } catch (error) {
    console.error('获取请假申请列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取单个请假申请详情
exports.getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找请假申请
    const leaveRequest = await LeaveRequest.findById(id)
      .populate('requester', 'name role')
      .populate('approvedBy', 'name');

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: '请假申请不存在'
      });
    }

    // 检查权限：申请人自己、管理员或审批人可以查看
    if (leaveRequest.requesterId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        (leaveRequest.approvedBy && leaveRequest.approvedBy.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: '您没有权限查看此请假申请'
      });
    }

    res.status(200).json({
      success: true,
      data: leaveRequest,
      message: '获取请假申请详情成功'
    });

  } catch (error) {
    console.error('获取请假申请详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 更新请假申请（仅限申请人自己更新未审批的申请）
exports.updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 查找请假申请
    const leaveRequest = await LeaveRequest.findById(id);

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: '请假申请不存在'
      });
    }

    // 检查权限：只能更新自己的未审批申请
    if (leaveRequest.requesterId.toString() !== req.user._id.toString() || leaveRequest.status !== 'pending') {
      return res.status(403).json({
        success: false,
        message: '您没有权限更新此请假申请'
      });
    }

    // 更新请假申请
    const updatedLeaveRequest = await LeaveRequest.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('requester', 'name role').populate('approvedBy', 'name');

    res.status(200).json({
      success: true,
      data: updatedLeaveRequest,
      message: '请假申请更新成功'
    });

  } catch (error) {
    console.error('更新请假申请失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 删除请假申请（仅限申请人自己删除未审批的申请）
exports.deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找请假申请
    const leaveRequest = await LeaveRequest.findById(id);

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: '请假申请不存在'
      });
    }

    // 检查权限：只能删除自己的未审批申请
    if (leaveRequest.requesterId.toString() !== req.user._id.toString() || leaveRequest.status !== 'pending') {
      return res.status(403).json({
        success: false,
        message: '您没有权限删除此请假申请'
      });
    }

    // 删除请假申请
    await LeaveRequest.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: '请假申请删除成功'
    });

  } catch (error) {
    console.error('删除请假申请失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取待审批的请假申请列表（仅限管理员和教师）
exports.getPendingLeaveRequests = async (req, res) => {
  try {
    const { requesterType, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const query = { status: 'pending' };
    if (requesterType) query.requesterType = requesterType;

    // 执行查询
    const leaveRequests = await LeaveRequest.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate('requester', 'name role');

    // 获取总数
    const total = await LeaveRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: leaveRequests,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      message: '获取待审批请假申请列表成功'
    });

  } catch (error) {
    console.error('获取待审批请假申请列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 审批请假申请（仅限管理员和教师）
exports.approveLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    // 验证状态
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '审批状态无效'
      });
    }

    // 查找请假申请
    const leaveRequest = await LeaveRequest.findById(id);

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: '请假申请不存在'
      });
    }

    // 检查是否已经审批
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '此请假申请已经被审批'
      });
    }

    // 更新请假申请状态
    leaveRequest.status = status;
    leaveRequest.approvedBy = req.user._id;
    leaveRequest.comments = comments || '';
    leaveRequest.updatedAt = Date.now();

    await leaveRequest.save();

    const updatedLeaveRequest = await LeaveRequest.findById(id)
      .populate('requester', 'name role')
      .populate('approvedBy', 'name');

    res.status(200).json({
      success: true,
      data: updatedLeaveRequest,
      message: `请假申请${status === 'approved' ? '已批准' : '已拒绝'}`
    });

  } catch (error) {
    console.error('审批请假申请失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取请假申请统计数据
exports.getLeaveRequestStatistics = async (req, res) => {
  try {
    const { requesterType, dateRange } = req.query;

    // 构建查询条件
    const query = {};
    if (requesterType) query.requesterType = requesterType;
    if (dateRange === 'week') {
      // 最近一周
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      query.createdAt = { $gte: oneWeekAgo };
    } else if (dateRange === 'month') {
      // 最近一个月
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      query.createdAt = { $gte: oneMonthAgo };
    } else if (dateRange === 'year') {
      // 最近一年
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      query.createdAt = { $gte: oneYearAgo };
    }

    // 获取统计数据
    const total = await LeaveRequest.countDocuments(query);
    const pending = await LeaveRequest.countDocuments({ ...query, status: 'pending' });
    const approved = await LeaveRequest.countDocuments({ ...query, status: 'approved' });
    const rejected = await LeaveRequest.countDocuments({ ...query, status: 'rejected' });

    // 获取请假类型统计
    const typeStats = await LeaveRequest.aggregate([
      { $match: query },
      { $group: { _id: '$leaveType', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        typeStats
      },
      message: '获取请假申请统计数据成功'
    });

  } catch (error) {
    console.error('获取请假申请统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};