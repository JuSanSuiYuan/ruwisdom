// 机器人路由 - 定义与机器人和摄像头相关的API端点

const express = require('express');
const router = express.Router();
const robotController = require('../controllers/robotController');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// 基础路由 - 需要用户登录
router.use(auth);

// 获取机器人列表
router.get('/robots', robotController.getRobots);

// 获取摄像头列表
router.get('/cameras', robotController.getCameras);

// 获取用户可访问的摄像头
router.get('/user/cameras', robotController.getUserAccessibleCameras);

// 获取摄像头视频流
router.get('/cameras/:cameraId/stream', robotController.getCameraStream);

// 控制摄像头云台
router.post('/cameras/:cameraId/ptz', robotController.controlCameraPTZ);

// 开始录制视频
router.post('/cameras/:cameraId/recording/start', robotController.startRecording);

// 停止录制视频
router.post('/cameras/:cameraId/recording/stop', robotController.stopRecording);

// 机器人设备状态更新（公开API，供机器人设备调用）
router.post('/device/robot/status', robotController.updateRobotStatus);

// 摄像头设备状态更新（公开API，供机器人设备调用）
router.post('/device/camera/status', robotController.updateCameraStatus);

// 管理员功能路由组
const adminRoutes = express.Router();
adminRoutes.use(auth.isAdmin);

// 机器人设备注册
adminRoutes.post('/robots/register', robotController.registerRobot);

// 摄像头设备注册
adminRoutes.post('/cameras/register', robotController.registerCamera);

// 挂载管理员路由
router.use('/admin', adminRoutes);

// 视频流静态文件服务
router.use('/streams', express.static(path.join(__dirname, '../../resources/streams')));

// 录制文件静态文件服务
router.use('/recordings', express.static(path.join(__dirname, '../../resources/recordings')));

// API文档路由
router.get('/docs', (req, res) => {
  res.json({
    "endpoints": [
      {
        "path": "/api/robot/robots",
        "method": "GET",
        "description": "获取机器人列表",
        "requiresAuth": true,
        "requiresAdmin": false
      },
      {
        "path": "/api/robot/cameras",
        "method": "GET",
        "description": "获取摄像头列表",
        "requiresAuth": true,
        "requiresAdmin": false
      },
      {
        "path": "/api/robot/user/cameras",
        "method": "GET",
        "description": "获取用户可访问的摄像头",
        "requiresAuth": true,
        "requiresAdmin": false
      },
      {
        "path": "/api/robot/cameras/:cameraId/stream",
        "method": "GET",
        "description": "获取摄像头视频流",
        "requiresAuth": true,
        "requiresAdmin": false
      },
      {
        "path": "/api/robot/cameras/:cameraId/ptz",
        "method": "POST",
        "description": "控制摄像头云台",
        "requiresAuth": true,
        "requiresAdmin": false,
        "permissions": "control 或 admin"
      },
      {
        "path": "/api/robot/cameras/:cameraId/recording/start",
        "method": "POST",
        "description": "开始录制视频",
        "requiresAuth": true,
        "requiresAdmin": false,
        "permissions": "control 或 admin"
      },
      {
        "path": "/api/robot/cameras/:cameraId/recording/stop",
        "method": "POST",
        "description": "停止录制视频",
        "requiresAuth": true,
        "requiresAdmin": false,
        "permissions": "control 或 admin"
      },
      {
        "path": "/api/robot/admin/robots/register",
        "method": "POST",
        "description": "机器人设备注册",
        "requiresAuth": true,
        "requiresAdmin": true
      },
      {
        "path": "/api/robot/admin/cameras/register",
        "method": "POST",
        "description": "摄像头设备注册",
        "requiresAuth": true,
        "requiresAdmin": true
      }
    ]
  });
});

module.exports = router;