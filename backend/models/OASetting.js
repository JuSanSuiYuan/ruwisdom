// OA管理系统设置模型

const mongoose = require('mongoose');

// OA设置架构
const OASettingSchema = new mongoose.Schema({
  // 设置类型
  settingType: {
    type: String,
    required: [true, '设置类型不能为空'],
    enum: ['announcement', 'systemConfig', 'academicCalendar', 'holidaySchedule']
  },
  // 设置名称
  name: {
    type: String,
    required: [true, '设置名称不能为空'],
    trim: true
  },
  // 设置内容
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, '设置内容不能为空']
  },
  // 是否启用
  isActive: {
    type: Boolean,
    default: true
  },
  // 生效日期
  effectiveDate: {
    type: Date
  },
  // 过期日期
  expiryDate: {
    type: Date
  },
  // 关联部门/年级/班级
  relatedEntities: [{
    type: String,
    trim: true
  }],
  // 创建人
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // 更新人
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
OASettingSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// 静态方法：获取所有启用的设置
OASettingSchema.statics.getActiveSettings = async function(settingType = null) {
  const query = { isActive: true };
  
  if (settingType) {
    query.settingType = settingType;
  }
  
  return await this.find(query).sort({ createdAt: -1 });
};

// 静态方法：根据ID获取设置
OASettingSchema.statics.getSettingById = async function(id) {
  return await this.findById(id);
};

// 虚拟属性：获取设置类型中文名称
OASettingSchema.virtual('settingTypeName').get(function() {
  const typeMap = {
    'announcement': '公告',
    'systemConfig': '系统配置',
    'academicCalendar': '校历',
    'holidaySchedule': '假期安排'
  };
  return typeMap[this.settingType] || this.settingType;
});

// 配置虚拟属性可序列化
OASettingSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

OASettingSchema.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// 创建OA设置模型
const OASetting = mongoose.model('OASetting', OASettingSchema);

module.exports = OASetting;