// 机器人控制器 - 处理与机器人和摄像头相关的API请求

const videoStreamService = require('../services/videoStreamService');
const Robot = require('../models/Robot');
const Camera = require('../models/Camera');

// 获取机器人列表
exports.getRobots = async (req, res) => {
  try {
    const filters = {};
    
    // 如果是普通用户，只返回其可访问的机器人
    if (!req.user.isAdmin && !req.user.isTeacher) {
      filters.associatedUsers = req.user._id;
    }
    
    // 可以添加其他过滤条件
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    if (req.query.type) {
      filters.type = req.query.type;
    }
    
    if (req.query.location) {
      filters.location = { $regex: req.query.location, $options: 'i' };
    }
    
    const robots = await videoStreamService.getRobots(filters);
    
    res.status(200).json({
      success: true,
      data: robots,
      count: robots.length
    });
  } catch (error) {
    console.error('获取机器人列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取机器人列表失败',
      error: error.message
    });
  }
};

// 获取摄像头列表
exports.getCameras = async (req, res) => {
  try {
    const filters = {};
    
    // 如果是普通用户，只返回其可访问的摄像头
    if (!req.user.isAdmin && !req.user.isTeacher) {
      filters['accessPermissions.userId'] = req.user._id;
    }
    
    // 可以添加其他过滤条件
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    if (req.query.type) {
      filters.type = req.query.type;
    }
    
    if (req.query.robotId) {
      filters.robotId = req.query.robotId;
    }
    
    const cameras = await videoStreamService.getCameras(filters);
    
    res.status(200).json({
      success: true,
      data: cameras,
      count: cameras.length
    });
  } catch (error) {
    console.error('获取摄像头列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取摄像头列表失败',
      error: error.message
    });
  }
};

// 获取用户可访问的摄像头
exports.getUserAccessibleCameras = async (req, res) => {
  try {
    const userId = req.user._id;
    const cameras = await videoStreamService.getUserAccessibleCameras(userId);
    
    res.status(200).json({
      success: true,
      data: cameras,
      count: cameras.length
    });
  } catch (error) {
    console.error('获取用户可访问的摄像头失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户可访问的摄像头失败',
      error: error.message
    });
  }
};

// 获取摄像头视频流
exports.getCameraStream = async (req, res) => {
  try {
    const { cameraId } = req.params;
    const userId = req.user._id;
    
    const streamUrl = await videoStreamService.getCameraStream(cameraId, userId);
    
    res.status(200).json({
      success: true,
      data: {
        streamUrl,
        cameraId
      }
    });
  } catch (error) {
    console.error('获取摄像头视频流失败:', error);
    res.status(500).json({
      success: false,
      message: '获取摄像头视频流失败',
      error: error.message
    });
  }
};

// 控制摄像头云台
exports.controlCameraPTZ = async (req, res) => {
  try {
    const { cameraId } = req.params;
    const { pan, tilt, zoom } = req.body;
    const userId = req.user._id;
    
    if (pan === undefined || tilt === undefined || zoom === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: pan, tilt 或 zoom'
      });
    }
    
    const updatedCamera = await videoStreamService.controlCameraPTZ(
      cameraId, pan, tilt, zoom, userId
    );
    
    res.status(200).json({
      success: true,
      data: updatedCamera
    });
  } catch (error) {
    console.error('控制摄像头云台失败:', error);
    res.status(500).json({
      success: false,
      message: '控制摄像头云台失败',
      error: error.message
    });
  }
};

// 开始录制视频
exports.startRecording = async (req, res) => {
  try {
    const { cameraId } = req.params;
    const userId = req.user._id;
    
    const result = await videoStreamService.startRecording(cameraId, userId);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('开始录制视频失败:', error);
    res.status(500).json({
      success: false,
      message: '开始录制视频失败',
      error: error.message
    });
  }
};

// 停止录制视频
exports.stopRecording = async (req, res) => {
  try {
    const { cameraId } = req.params;
    const userId = req.user._id;
    
    const result = await videoStreamService.stopRecording(cameraId, userId);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('停止录制视频失败:', error);
    res.status(500).json({
      success: false,
      message: '停止录制视频失败',
      error: error.message
    });
  }
};

// 更新机器人状态（供机器人设备调用）
exports.updateRobotStatus = async (req, res) => {
  try {
    const { robotId, status } = req.body;
    
    if (!robotId || !status) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: robotId 或 status'
      });
    }
    
    const updatedRobot = await videoStreamService.updateRobotStatus(robotId, status);
    
    res.status(200).json({
      success: true,
      data: updatedRobot
    });
  } catch (error) {
    console.error('更新机器人状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新机器人状态失败',
      error: error.message
    });
  }
};

// 更新摄像头状态（供机器人设备调用）
exports.updateCameraStatus = async (req, res) => {
  try {
    const { cameraId, status } = req.body;
    
    if (!cameraId || !status) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: cameraId 或 status'
      });
    }
    
    const updatedCamera = await videoStreamService.updateCameraStatus(cameraId, status);
    
    res.status(200).json({
      success: true,
      data: updatedCamera
    });
  } catch (error) {
    console.error('更新摄像头状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新摄像头状态失败',
      error: error.message
    });
  }
};

// 机器人设备注册（管理员功能）
exports.registerRobot = async (req, res) => {
  try {
    // 检查用户权限
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权限执行此操作'
      });
    }
    
    const { robotId, name, type, location, cameraCount, deviceInfo } = req.body;
    
    // 检查必要参数
    if (!robotId || !name || !location) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: robotId, name 或 location'
      });
    }
    
    // 检查机器人是否已存在
    const existingRobot = await Robot.findOne({ robotId });
    if (existingRobot) {
      return res.status(400).json({
        success: false,
        message: '该机器人ID已存在'
      });
    }
    
    // 创建新机器人
    const newRobot = new Robot({
      robotId,
      name,
      type: type || 'classroom',
      location,
      cameraCount: cameraCount || 1,
      deviceInfo
    });
    
    await newRobot.save();
    
    res.status(201).json({
      success: true,
      message: '机器人注册成功',
      data: newRobot
    });
  } catch (error) {
    console.error('机器人注册失败:', error);
    res.status(500).json({
      success: false,
      message: '机器人注册失败',
      error: error.message
    });
  }
};

// 摄像头设备注册（管理员功能）
exports.registerCamera = async (req, res) => {
  try {
    // 检查用户权限
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权限执行此操作'
      });
    }
    
    const { cameraId, name, robotId, type, location, streamUrl, rtspUrl, deviceInfo, accessPermissions } = req.body;
    
    // 检查必要参数
    if (!cameraId || !name || !robotId || !location || !streamUrl) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: cameraId, name, robotId, location 或 streamUrl'
      });
    }
    
    // 检查摄像头是否已存在
    const existingCamera = await Camera.findOne({ cameraId });
    if (existingCamera) {
      return res.status(400).json({
        success: false,
        message: '该摄像头ID已存在'
      });
    }
    
    // 检查机器人是否存在
    const robot = await Robot.findOne({ _id: robotId });
    if (!robot) {
      return res.status(400).json({
        success: false,
        message: '关联的机器人不存在'
      });
    }
    
    // 创建新摄像头
    const newCamera = new Camera({
      cameraId,
      name,
      robotId,
      type: type || 'front',
      location,
      streamUrl,
      rtspUrl,
      deviceInfo,
      accessPermissions
    });
    
    await newCamera.save();
    
    res.status(201).json({
      success: true,
      message: '摄像头注册成功',
      data: newCamera
    });
  } catch (error) {
    console.error('摄像头注册失败:', error);
    res.status(500).json({
      success: false,
      message: '摄像头注册失败',
      error: error.message
    });
  }
};