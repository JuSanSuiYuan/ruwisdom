// 心理咨询师模型

const mongoose = require('mongoose');

// 心理咨询师架构
const PsychologistSchema = new mongoose.Schema({
  // 姓名
  name: {
    type: String,
    required: [true, '心理咨询师姓名不能为空'],
    trim: true
  },
  // 性别
  gender: {
    type: String,
    enum: ['男', '女'],
    required: [true, '性别不能为空']
  },
  // 头像URL
  avatar: {
    type: String,
    default: ''
  },
  // 所属医院
  hospital: {
    type: String,
    required: [true, '所属医院不能为空'],
    trim: true
  },
  // 科室
  department: {
    type: String,
    required: [true, '科室不能为空'],
    trim: true
  },
  // 职称
  title: {
    type: String,
    required: [true, '职称为空'],
    trim: true
  },
  // 简介
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  // 擅长领域
  specialties: [
    {
      type: String,
      trim: true
    }
  ],
  // 执业证书编号
  licenseNumber: {
    type: String,
    required: [true, '执业证书编号不能为空'],
    unique: true,
    trim: true
  },
  // 联系电话
  phone: {
    type: String,
    trim: true
  },
  // 可用时间段
  availableTimeSlots: [
    {
      day: {
        type: String,
        enum: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        required: true
      },
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      }
    }
  ],
  // 状态
  status: {
    type: String,
    enum: ['available', 'unavailable', 'busy'],
    default: 'available'
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

// 预存钩子，更新时间
PsychologistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 导出模型
module.exports = mongoose.model('Psychologist', PsychologistSchema);