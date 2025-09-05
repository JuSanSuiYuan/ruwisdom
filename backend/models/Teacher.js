// 教师模型

const mongoose = require('mongoose');

// 教师架构
const TeacherSchema = new mongoose.Schema({
  // 关联的用户ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '教师必须关联用户账号'],
    unique: true
  },
  // 所授科目
  subject: {
    type: String,
    required: [true, '请填写所授科目'],
    trim: true
  },
  // 所教年级
  grade: {
    type: String,
    required: [true, '请填写所教年级'],
    trim: true
  },
  // 所教班级
  className: {
    type: String,
    required: [true, '请填写所教班级'],
    trim: true
  },
  // 教师工号
  employeeId: {
    type: String,
    required: [true, '教师工号不能为空'],
    unique: true,
    trim: true
  },
  // 教师职称
  title: {
    type: String,
    trim: true,
    default: ''
  },
  // 入职日期
  hireDate: {
    type: Date
  },
  // 教育背景
  education: [
    {
      degree: String,
      major: String,
      school: String,
      graduationYear: Number
    }
  ],
  // 教学经历
  teachingExperience: [
    {
      subject: String,
      grade: String,
      className: String,
      startDate: Date,
      endDate: Date,
      school: String
    }
  ],
  // 教学特点
  teachingFeatures: [
    {
      feature: String
    }
  ],
  // 获得奖项
  awards: [
    {
      name: String,
      level: String,
      date: Date,
      description: String
    }
  ],
  // 教学评价
  evaluations: [
    {
      evaluatorType: String,
      evaluatorId: mongoose.Schema.Types.ObjectId,
      score: Number,
      comment: String,
      date: { type: Date, default: Date.now }
    }
  ],
  // 教师简介
  introduction: {
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

// 更新时间中间件
TeacherSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// 静态方法：根据科目统计教师数量
TeacherSchema.statics.countBySubject = async function(subject) {
  return await this.countDocuments({ subject: subject });
};

// 静态方法：根据年级统计教师数量
TeacherSchema.statics.countByGrade = async function(grade) {
  return await this.countDocuments({ grade: grade });
};

// 虚拟属性：获取关联的用户信息
TeacherSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// 配置虚拟属性可序列化
TeacherSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // 删除不需要的属性
    delete ret._id;
    delete ret.__v;
    // 格式化日期
    if (ret.hireDate) {
      ret.hireDate = ret.hireDate.toISOString().split('T')[0];
    }
    return ret;
  }
});

TeacherSchema.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    if (ret.hireDate) {
      ret.hireDate = ret.hireDate.toISOString().split('T')[0];
    }
    return ret;
  }
});

// 创建教师模型
const Teacher = mongoose.model('Teacher', TeacherSchema);

module.exports = Teacher;