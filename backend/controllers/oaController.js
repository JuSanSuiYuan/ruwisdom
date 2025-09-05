// OA管理控制器

const OASetting = require('../models/OASetting');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const LeaveRequest = require('../models/LeaveRequest');

// @desc 获取所有OA设置
// @route GET /api/oa/settings
// @access Private/Admin
exports.getOASettings = async (req, res, next) => {
  try {
    const { settingType } = req.query;
    const settings = await OASetting.getActiveSettings(settingType);
    
    res.status(200).json({
      success: true,
      count: settings.length,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc 获取单个OA设置
// @route GET /api/oa/settings/:id
// @access Private/Admin
exports.getOASettingById = async (req, res, next) => {
  try {
    const setting = await OASetting.getSettingById(req.params.id);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: '未找到该设置'
      });
    }
    
    res.status(200).json({
      success: true,
      data: setting
    });
  } catch (error) {
    next(error);
  }
};

// @desc 创建OA设置
// @route POST /api/oa/settings
// @access Private/Admin
exports.createOASetting = async (req, res, next) => {
  try {
    const { settingType, name, content, isActive, effectiveDate, expiryDate, relatedEntities } = req.body;
    
    const setting = await OASetting.create({
      settingType,
      name,
      content,
      isActive,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      relatedEntities,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: setting
    });
  } catch (error) {
    next(error);
  }
};

// @desc 更新OA设置
// @route PUT /api/oa/settings/:id
// @access Private/Admin
exports.updateOASetting = async (req, res, next) => {
  try {
    let setting = await OASetting.findById(req.params.id);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: '未找到该设置'
      });
    }
    
    const { settingType, name, content, isActive, effectiveDate, expiryDate, relatedEntities } = req.body;
    
    setting.set({
      settingType,
      name,
      content,
      isActive,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      relatedEntities,
      updatedBy: req.user.id
    });
    
    await setting.save();
    
    res.status(200).json({
      success: true,
      data: setting
    });
  } catch (error) {
    next(error);
  }
};

// @desc 删除OA设置
// @route DELETE /api/oa/settings/:id
// @access Private/Admin
exports.deleteOASetting = async (req, res, next) => {
  try {
    const setting = await OASetting.findById(req.params.id);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: '未找到该设置'
      });
    }
    
    await setting.remove();
    
    res.status(200).json({
      success: true,
      message: '设置已删除'
    });
  } catch (error) {
    next(error);
  }
};

// @desc 获取系统统计数据
// @route GET /api/oa/stats
// @access Private/Admin
exports.getSystemStats = async (req, res, next) => {
  try {
    // 获取各类用户统计
    const [
      studentsCount,
      teachersCount,
      parentsCount,
      adminCount,
      pendingLeaveRequests
    ] = await Promise.all([
      User.countDocuments({ role: 'student', status: 'active' }),
      User.countDocuments({ role: 'teacher', status: 'active' }),
      User.countDocuments({ role: 'parent', status: 'active' }),
      User.countDocuments({ role: 'admin', status: 'active' }),
      LeaveRequest.countDocuments({ status: 'pending' })
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        studentsCount,
        teachersCount,
        parentsCount,
        adminCount,
        pendingLeaveRequests
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc 获取所有用户列表
// @route GET /api/oa/users
// @access Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (role) query.role = role;
    if (status) query.status = status;
    
    const users = await User
      .find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc 更新用户状态
// @route PUT /api/oa/users/:id/status
// @access Private/Admin
exports.updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    const { status } = req.body;
    user.status = status;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc 管理请假申请
// @route GET /api/oa/leave-requests
// @access Private/Admin
exports.getLeaveRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (status) query.status = status;
    
    const leaveRequests = await LeaveRequest
      .find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .populate('requester')
      .populate('approver');
    
    const total = await LeaveRequest.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: leaveRequests.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: leaveRequests
    });
  } catch (error) {
    next(error);
  }
};