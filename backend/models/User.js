// 用户模型

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// 用户架构
const UserSchema = new mongoose.Schema({
  // 账号
  account: {
    type: String,
    required: [true, '账号不能为空'],
    unique: true,
    trim: true
  },
  // 密码
  password: {
    type: String,
    required: [true, '密码不能为空'],
    minlength: [6, '密码长度不能少于6位'],
    select: false // 查询时默认不返回密码
  },
  // 用户名
  name: {
    type: String,
    required: [true, '用户名不能为空'],
    trim: true
  },
  // 用户角色
  role: {
    type: String,
    required: [true, '角色不能为空'],
    enum: ['teacher', 'parent', 'student', 'admin'],
    default: 'student'
  },
  // 头像URL
  avatar: {
    type: String,
    default: ''
  },
  // 手机号码
  phone: {
    type: String,
    trim: true
  },
  // 电子邮箱
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // 简单的邮箱格式验证
        return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
      },
      message: props => `${props.value} 不是有效的电子邮箱地址！`
    }
  },
  // 微信OpenID
  wechatOpenId: {
    type: String,
    unique: true,
    sparse: true // 允许为空，但不为空时必须唯一
  },
  // 状态
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  // 最后登录时间
  lastLoginAt: {
    type: Date
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

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  // 只有当密码被修改或新创建时才加密
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // 生成盐值
    const salt = await bcrypt.genSalt(10);
    // 加密密码
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 更新时间中间件
UserSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// 实例方法：验证密码
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 静态方法：根据角色获取用户数量
UserSchema.statics.countByRole = async function(role) {
  return await this.countDocuments({ role: role });
};

// 虚拟属性：获取用户角色中文名称
UserSchema.virtual('roleName').get(function() {
  const roleMap = {
    'teacher': '教师',
    'parent': '家长',
    'student': '学生',
    'admin': '管理员'
  };
  return roleMap[this.role] || this.role;
});

// 虚拟属性：获取用户状态中文名称
UserSchema.virtual('statusName').get(function() {
  const statusMap = {
    'active': '正常',
    'inactive': '未激活',
    'suspended': '已暂停'
  };
  return statusMap[this.status] || this.status;
});

// 配置虚拟属性可序列化
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // 删除不需要的属性
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

UserSchema.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// 创建用户模型
const User = mongoose.model('User', UserSchema);

module.exports = User;