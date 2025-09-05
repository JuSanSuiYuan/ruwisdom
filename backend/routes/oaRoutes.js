// OA管理路由

const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  getOASettings,
  getOASettingById,
  createOASetting,
  updateOASetting,
  deleteOASetting,
  getSystemStats,
  getAllUsers,
  updateUserStatus,
  getLeaveRequests
} = require('../controllers/oaController');

// 应用认证中间件
router.use(auth);
// 应用管理员权限验证中间件
router.use(authorize('admin'));

// OA设置相关路由
router
  .route('/settings')
  .get(getOASettings)
  .post(createOASetting);

router
  .route('/settings/:id')
  .get(getOASettingById)
  .put(updateOASetting)
  .delete(deleteOASetting);

// 系统统计相关路由
router
  .route('/stats')
  .get(getSystemStats);

// 用户管理相关路由
router
  .route('/users')
  .get(getAllUsers);

router
  .route('/users/:id/status')
  .put(updateUserStatus);

// 请假管理相关路由
router
  .route('/leave-requests')
  .get(getLeaveRequests);

module.exports = router;