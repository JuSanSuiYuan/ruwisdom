// 家长模型

const mongoose = require('mongoose');

// 家长架构
const ParentSchema = new mongoose.Schema({
  // 关联的用户ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '家长必须关联用户账号'],
    unique: true
  },
  // 关联的学生ID列表
  childStudents: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, '学生ID不能为空']
      },
      relation: {
        type: String,
        required: [true, '与学生的关系不能为空'],
        enum: ['爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆', '其他'],
        default: '爸爸'
      }
    }
  ],
  // 主要联系人
  isPrimaryContact: {
    type: Boolean,
    default: true
  },
  // 工作单位
  company: {
    type: String,
    trim: true,
    default: ''
  },
  // 职业
  occupation: {
    type: String,
    trim: true,
    default: ''
  },
  // 家庭地址
  address: {
    type: String,
    trim: true,
    default: ''
  },
  // 紧急联系人
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    relation: {
      type: String,
      trim: true,
      default: ''
    }
  },
  // 家长参与度评分
  participationScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  // 家长反馈记录
  feedbackRecords: [
    {
      type: String,
      content: String,
      date: {
        type: Date,
        default: Date.now
      },
      replied: {
        type: Boolean,
        default: false
      },
      replyContent: String,
      replyDate: Date
    }
  ],
  // 家长会议记录
  meetingRecords: [
    {
      date: Date,
      content: String,
      attended: Boolean
    }
  ],
  // 教育观念
  educationConcepts: [
    {
      concept: String
    }
  ],
  // 特殊需求
  specialNeeds: {
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
ParentSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// 静态方法：统计家长数量
ParentSchema.statics.countParents = async function() {
  return await this.countDocuments({});
};

// 静态方法：根据学生ID查找关联的家长
ParentSchema.statics.findByStudentId = async function(studentId) {
  return await this.find({'childStudents.studentId': studentId});
};

// 虚拟属性：获取关联的用户信息
ParentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// 配置虚拟属性可序列化
ParentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // 删除不需要的属性
    delete ret._id;
    delete ret.__v;
    // 格式化日期
    if (ret.childStudents) {
      ret.childStudents.forEach(student => {
        if (student.student) {
          student.student = student.student.toJSON();
        }
      });
    }
    if (ret.feedbackRecords) {
      ret.feedbackRecords.forEach(record => {
        if (record.date) {
          record.date = record.date.toISOString().split('T')[0];
        }
        if (record.replyDate) {
          record.replyDate = record.replyDate.toISOString().split('T')[0];
        }
      });
    }
    if (ret.meetingRecords) {
      ret.meetingRecords.forEach(record => {
        if (record.date) {
          record.date = record.date.toISOString().split('T')[0];
        }
      });
    }
    return ret;
  }
});

ParentSchema.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    // 格式化日期和嵌套对象
    if (ret.childStudents) {
      ret.childStudents.forEach(student => {
        if (student.student) {
          student.student = student.student.toObject();
        }
      });
    }
    // 格式化其他日期字段
    return ret;
  }
});

// 创建家长模型
const Parent = mongoose.model('Parent', ParentSchema);

module.exports = Parent;