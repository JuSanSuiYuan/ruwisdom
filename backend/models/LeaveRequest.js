// 请假申请模型

const mongoose = require('mongoose');

// 请假申请架构
const LeaveRequestSchema = new mongoose.Schema({
  // 请假申请人ID
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '请假申请人不能为空']
  },
  // 请假申请人类型
  requesterType: {
    type: String,
    enum: ['student', 'teacher'],
    required: [true, '请假申请人类型不能为空']
  },
  // 请假类型
  leaveType: {
    type: String,
    enum: ['病假', '事假', '公假', '其他'],
    required: [true, '请假类型不能为空']
  },
  // 开始日期
  startDate: {
    type: Date,
    required: [true, '请假开始日期不能为空']
  },
  // 结束日期
  endDate: {
    type: Date,
    required: [true, '请假结束日期不能为空']
  },
  // 请假原因
  reason: {
    type: String,
    required: [true, '请假原因不能为空'],
    trim: true
  },
  // 请假状态
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // 审批人ID
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // 审批意见
  comments: {
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
LeaveRequestSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// 静态方法：根据申请人ID和类型查找请假记录
LeaveRequestSchema.statics.findByRequester = async function(requesterId, requesterType) {
  return await this.find({ requesterId: requesterId, requesterType: requesterType });
};

// 静态方法：根据状态统计请假记录
LeaveRequestSchema.statics.countByStatus = async function(status) {
  return await this.countDocuments({ status: status });
};

// 静态方法：查找待审批的请假记录
LeaveRequestSchema.statics.findPendingRequests = async function() {
  return await this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

// 虚拟属性：获取请假申请人信息
LeaveRequestSchema.virtual('requester', {
  ref: 'User',
  localField: 'requesterId',
  foreignField: '_id',
  justOne: true
});

// 虚拟属性：获取审批人信息
LeaveRequestSchema.virtual('approver', {
  ref: 'User',
  localField: 'approvedBy',
  foreignField: '_id',
  justOne: true
});

// 虚拟属性：获取状态中文名称
LeaveRequestSchema.virtual('statusName').get(function() {
  const statusMap = {
    'pending': '待审批',
    'approved': '已批准',
    'rejected': '已拒绝'
  };
  return statusMap[this.status] || this.status;
});

// 配置虚拟属性可序列化
LeaveRequestSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // 删除不需要的属性
    delete ret._id;
    delete ret.__v;
    // 格式化日期
    if (ret.startDate) {
      ret.startDate = ret.startDate.toISOString().split('T')[0];
    }
    if (ret.endDate) {
      ret.endDate = ret.endDate.toISOString().split('T')[0];
    }
    if (ret.createdAt) {
      ret.createdAt = ret.createdAt.toISOString().split('T')[0];
    }
    if (ret.updatedAt) {
      ret.updatedAt = ret.updatedAt.toISOString().split('T')[0];
    }
    return ret;
  }
});

LeaveRequestSchema.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    if (ret.startDate) {
      ret.startDate = ret.startDate.toISOString().split('T')[0];
    }
    if (ret.endDate) {
      ret.endDate = ret.endDate.toISOString().split('T')[0];
    }
    return ret;
  }
});

// 创建请假申请模型
const LeaveRequest = mongoose.model('LeaveRequest', LeaveRequestSchema);

module.exports = LeaveRequest;