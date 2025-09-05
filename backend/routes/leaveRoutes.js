// 请假申请路由

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// 控制器
const leaveRequestController = require('../controllers/leaveRequestController');

// 中间件
const { auth, authorize } = require('../middleware/auth');

// 验证规则
const leaveRequestValidationRules = [
  body('leaveType').notEmpty().withMessage('请假类型不能为空')
    .isIn(['病假', '事假', '公假', '其他']).withMessage('请假类型无效'),
  body('startDate').notEmpty().withMessage('请假开始日期不能为空')
    .isISO8601().withMessage('请假开始日期格式不正确'),
  body('endDate').notEmpty().withMessage('请假结束日期不能为空')
    .isISO8601().withMessage('请假结束日期格式不正确'),
  body('reason').notEmpty().withMessage('请假原因不能为空')
    .isLength({ max: 500 }).withMessage('请假原因不能超过500个字符')
];

const approveValidationRules = [
  body('status').notEmpty().withMessage('审批状态不能为空')
    .isIn(['approved', 'rejected']).withMessage('审批状态无效'),
  body('comments').optional().isLength({ max: 500 }).withMessage('审批意见不能超过500个字符')
];

// 路由定义

// 创建请假申请 - 学生、教师
router.post('/', 
  auth, 
  authorize('student', 'teacher'), 
  leaveRequestValidationRules, 
  leaveRequestController.createLeaveRequest
);

// 获取当前用户的请假申请列表 - 学生、教师
router.get('/my-requests', 
  auth, 
  authorize('student', 'teacher'), 
  leaveRequestController.getMyLeaveRequests
);

// 获取单个请假申请详情 - 学生、教师、管理员
router.get('/:id', 
  auth, 
  authorize('student', 'teacher', 'admin'), 
  leaveRequestController.getLeaveRequestById
);

// 更新请假申请 - 学生、教师（仅限自己的申请）
router.put('/:id', 
  auth, 
  authorize('student', 'teacher'), 
  leaveRequestValidationRules, 
  leaveRequestController.updateLeaveRequest
);

// 删除请假申请 - 学生、教师（仅限自己的申请）
router.delete('/:id', 
  auth, 
  authorize('student', 'teacher'), 
  leaveRequestController.deleteLeaveRequest
);

// 获取待审批的请假申请列表 - 教师、管理员
router.get('/pending', 
  auth, 
  authorize('teacher', 'admin'), 
  leaveRequestController.getPendingLeaveRequests
);

// 审批请假申请 - 教师、管理员
router.put('/:id/approve', 
  auth, 
  authorize('teacher', 'admin'), 
  approveValidationRules, 
  leaveRequestController.approveLeaveRequest
);

// 获取请假申请统计数据 - 教师、管理员
router.get('/statistics', 
  auth, 
  authorize('teacher', 'admin'), 
  leaveRequestController.getLeaveRequestStatistics
);

// 导出路由
module.exports = router;