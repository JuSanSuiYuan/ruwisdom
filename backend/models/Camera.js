// 摄像头模型 - 定义摄像头设备的基本信息和功能特性

const mongoose = require('mongoose');

const CameraSchema = new mongoose.Schema({
  // 摄像头唯一标识
  cameraId: {
    type: String,
    required: true,
    unique: true
  },
  
  // 摄像头名称
  name: {
    type: String,
    required: true
  },
  
  // 所属机器人ID
  robotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Robot',
    required: true
  },
  
  // 摄像头类型
  type: {
    type: String,
    enum: ['front', 'rear', 'panoramic', 'fixed', 'PTZ'],
    default: 'front'
  },
  
  // 摄像头位置描述
  location: {
    type: String,
    required: true
  },
  
  // 摄像头状态
  status: {
    type: String,
    enum: ['online', 'offline', 'maintenance'],
    default: 'offline'
  },
  
  // 视频流地址
  streamUrl: {
    type: String,
    required: true
  },
  
  // RTSP流地址（用于更高级的视频处理）
  rtspUrl: {
    type: String
  },
  
  // 视频分辨率
  resolution: {
    width: {
      type: Number,
      default: 1280
    },
    height: {
      type: Number,
      default: 720
    }
  },
  
  // 帧率
  frameRate: {
    type: Number,
    default: 25
  },
  
  // 是否支持音频
  audioEnabled: {
    type: Boolean,
    default: true
  },
  
  // 云台控制支持
  ptzEnabled: {
    type: Boolean,
    default: false
  },
  
  // 云台当前位置
  ptzPosition: {
    pan: {
      type: Number,
      default: 0
    },
    tilt: {
      type: Number,
      default: 0
    },
    zoom: {
      type: Number,
      default: 1
    }
  },
  
  // 录制功能
  recordingEnabled: {
    type: Boolean,
    default: false
  },
  
  // 存储路径
  storagePath: {
    type: String
  },
  
  // 上次在线时间
  lastOnlineTime: {
    type: Date
  },
  
  // 设备信息
  deviceInfo: {
    model: String,
    manufacturer: String,
    firmwareVersion: String,
    lensType: String,
    fieldOfView: Number // 视场角
  },
  
  // 访问权限
  accessPermissions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'userType'
    },
    userType: {
      type: String,
      enum: ['Student', 'Teacher', 'Parent', 'Admin']
    },
    permissionLevel: {
      type: String,
      enum: ['view', 'control', 'admin'],
      default: 'view'
    },
    expireAt: {
      type: Date
    }
  }],
  
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // 更新时间
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 保存前更新时间
CameraSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Camera', CameraSchema);