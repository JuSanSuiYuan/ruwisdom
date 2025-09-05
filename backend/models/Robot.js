// 机器人模型 - 定义机器人设备的基本信息

const mongoose = require('mongoose');

const RobotSchema = new mongoose.Schema({
  // 机器人唯一标识
  robotId: {
    type: String,
    required: true,
    unique: true
  },
  
  // 机器人名称
  name: {
    type: String,
    required: true
  },
  
  // 机器人类型
  type: {
    type: String,
    enum: ['classroom', 'personal', 'security'],
    default: 'classroom'
  },
  
  // 所属班级或区域
  location: {
    type: String,
    required: true
  },
  
  // 机器人状态
  status: {
    type: String,
    enum: ['online', 'offline', 'maintenance'],
    default: 'offline'
  },
  
  // 摄像头数量
  cameraCount: {
    type: Number,
    default: 1
  },
  
  // 当前正在使用的摄像头ID
  activeCameraId: {
    type: String,
    default: '0'
  },
  
  // 视频流地址
  streamUrl: {
    type: String
  },
  
  // 音频状态
  audioEnabled: {
    type: Boolean,
    default: true
  },
  
  // 最后在线时间
  lastOnlineTime: {
    type: Date
  },
  
  // 最后离线时间
  lastOfflineTime: {
    type: Date
  },
  
  // 关联的学生或班级
  associatedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userType'
  }],
  
  // 用户类型（Student或Teacher等）
  userType: {
    type: String,
    enum: ['Student', 'Teacher', 'Parent']
  },
  
  // 设备信息
  deviceInfo: {
    model: String,
    manufacturer: String,
    firmwareVersion: String,
    hardwareVersion: String
  },
  
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
RobotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Robot', RobotSchema);