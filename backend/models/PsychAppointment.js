// 心理咨询预约模型

const mongoose = require('mongoose');

// 心理咨询预约架构
const PsychAppointmentSchema = new mongoose.Schema({
  // 预约用户ID（学生或家长）
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '预约用户不能为空']
  },
  // 用户类型
  userType: {
    type: String,
    enum: ['student', 'parent'],
    required: [true, '用户类型不能为空']
  },
  // 关联的学生ID（如果是家长为学生预约）
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  // 心理咨询师ID
  psychologistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Psychologist',
    required: [true, '心理咨询师不能为空']
  },
  // 预约日期
  appointmentDate: {
    type: Date,
    required: [true, '预约日期不能为空']
  },
  // 预约开始时间
  startTime: {
    type: String,
    required: [true, '预约开始时间不能为空']
  },
  // 预约结束时间
  endTime: {
    type: String,
    required: [true, '预约结束时间不能为空']
  },
  // 预约状态
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  // 症状描述
  symptoms: {
    type: String,
    trim: true,
    default: ''
  },
  // 咨询方式
  consultationMethod: {
    type: String,
    enum: ['in_person', 'online'],
    default: 'in_person'
  },
  // 备注
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  // 咨询记录
  consultationRecord: {
    type: String,
    trim: true,
    default: ''
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
PsychAppointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 导出模型
module.exports = mongoose.model('PsychAppointment', PsychAppointmentSchema);