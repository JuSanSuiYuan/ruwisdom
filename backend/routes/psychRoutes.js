// 心理咨询路由

const express = require('express');
const router = express.Router();
const psychController = require('../controllers/psychController');
const { auth } = require('../middleware/auth');

// 基础路由 - 需要用户登录
router.use(auth);

// 获取心理咨询师列表
router.get('/psychologists', psychController.getPsychologists);

// 获取心理咨询师详情
router.get('/psychologists/:id', psychController.getPsychologistById);

// 预约心理咨询
router.post('/appointments', psychController.bookPsychologist);

// 获取用户的心理咨询预约列表
router.get('/appointments', psychController.getUserPsychAppointments);

// 取消心理咨询预约
router.put('/appointments/:id/cancel', psychController.cancelPsychAppointment);

// API文档路由
router.get('/docs', (req, res) => {
  res.json({
    "endpoints": [
      {
        "path": "/api/psych/psychologists",
        "method": "GET",
        "description": "获取心理咨询师列表",
        "requiresAuth": true
      },
      {
        "path": "/api/psych/psychologists/:id",
        "method": "GET",
        "description": "获取心理咨询师详情",
        "requiresAuth": true
      },
      {
        "path": "/api/psych/appointments",
        "method": "POST",
        "description": "预约心理咨询",
        "requiresAuth": true
      },
      {
        "path": "/api/psych/appointments",
        "method": "GET",
        "description": "获取用户的心理咨询预约列表",
        "requiresAuth": true
      },
      {
        "path": "/api/psych/appointments/:id/cancel",
        "method": "PUT",
        "description": "取消心理咨询预约",
        "requiresAuth": true
      }
    ]
  });
});

module.exports = router;