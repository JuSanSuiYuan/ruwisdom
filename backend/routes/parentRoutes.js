// 家长路由

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// 控制器
const parentController = require('../controllers/parentController');

// 中间件
const { auth, authorize } = require('../middleware/auth');

// 验证规则
const parentValidationRules = [
  body('name').notEmpty().withMessage('家长姓名不能为空'),
  body('phone').isMobilePhone('zh-CN').withMessage('请输入有效的手机号码')
];

const feedbackValidationRules = [
  body('type').notEmpty().withMessage('反馈类型不能为空'),
  body('content').notEmpty().withMessage('反馈内容不能为空')
];

const replyValidationRules = [
  body('replyContent').notEmpty().withMessage('回复内容不能为空')
];

// 路由定义

// 获取家长列表 - 教师、管理员
router.get('/', auth, authorize('teacher', 'admin'), parentController.getParents);

// 获取单个家长详情 - 家长、教师、管理员
router.get('/:id', auth, authorize('parent', 'teacher', 'admin'), parentController.getParentById);

// 创建家长 - 教师、管理员
router.post('/', auth, authorize('teacher', 'admin'), parentValidationRules, parentController.createParent);

// 更新家长信息 - 家长、教师、管理员
router.put('/:id', auth, authorize('parent', 'teacher', 'admin'), parentController.updateParent);

// 删除家长 - 管理员
router.delete('/:id', auth, authorize('admin'), parentController.deleteParent);

// 添加家长反馈 - 家长
router.post('/:id/feedback', auth, authorize('parent'), feedbackValidationRules, parentController.addFeedback);

// 回复家长反馈 - 教师、管理员
router.post('/:id/feedback/:feedbackId/reply', auth, authorize('teacher', 'admin'), replyValidationRules, parentController.replyFeedback);

// 获取家长参与度分析 - 教师、管理员、家长
router.get('/:id/participation', auth, authorize('parent', 'teacher', 'admin'), parentController.getParentParticipationAnalysis);

// 获取家长关联的学生 - 家长、教师、管理员
router.get('/:id/children', auth, authorize('parent', 'teacher', 'admin'), parentController.getParentChildren);

// 获取家长反馈列表 - 家长、教师、管理员
router.get('/:id/feedbacks', auth, authorize('parent', 'teacher', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { replied, page = 1, limit = 10 } = req.query;
    
    // 这里应该从数据库获取家长的反馈列表
    // 实际项目中需要实现具体的数据库查询逻辑
    // 以下是示例实现
    
    // 先获取家长信息
    const parentResponse = await new Promise((resolve, reject) => {
      const mockReq = { ...req, params: { id } };
      const mockRes = {
        status: (code) => ({
          json: (data) => resolve({ code, data })
        })
      };
      parentController.getParentById(mockReq, mockRes);
    });
    
    if (parentResponse.code !== 200 || !parentResponse.data) {
      return res.status(parentResponse.code || 404).json({
        success: false,
        message: parentResponse.data?.message || '家长不存在'
      });
    }
    
    const parent = parentResponse.data;
    let feedbacks = parent.feedbackRecords || [];
    
    // 过滤已回复/未回复的反馈
    if (replied !== undefined) {
      const repliedBool = replied === 'true' || replied === true;
      feedbacks = feedbacks.filter(feedback => feedback.replied === repliedBool);
    }
    
    // 分页处理
    const skip = (page - 1) * limit;
    const paginatedFeedbacks = feedbacks.slice(skip, skip + parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: paginatedFeedbacks,
      total: feedbacks.length,
      page: parseInt(page),
      pages: Math.ceil(feedbacks.length / limit),
      message: '获取反馈列表成功'
    });
  } catch (error) {
    console.error('获取反馈列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
});

// 获取家长会议记录 - 家长、教师、管理员
router.get('/:id/meetings', auth, authorize('parent', 'teacher', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // 先获取家长信息
    const parentResponse = await new Promise((resolve, reject) => {
      const mockReq = { ...req, params: { id } };
      const mockRes = {
        status: (code) => ({
          json: (data) => resolve({ code, data })
        })
      };
      parentController.getParentById(mockReq, mockRes);
    });
    
    if (parentResponse.code !== 200 || !parentResponse.data) {
      return res.status(parentResponse.code || 404).json({
        success: false,
        message: parentResponse.data?.message || '家长不存在'
      });
    }
    
    const parent = parentResponse.data;
    const meetings = parent.meetingRecords || [];
    
    res.status(200).json({
      success: true,
      data: meetings,
      message: '获取会议记录成功'
    });
  } catch (error) {
    console.error('获取会议记录失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
});

// 导出路由
module.exports = router;