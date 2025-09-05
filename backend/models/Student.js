// 学生模型

const mongoose = require('mongoose');

// 学生架构
const StudentSchema = new mongoose.Schema({
  // 关联的用户ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '学生必须关联用户账号'],
    unique: true
  },
  // 学号
  studentId: {
    type: String,
    required: [true, '学号不能为空'],
    unique: true,
    trim: true
  },
  // 姓名
  name: {
    type: String,
    required: [true, '学生姓名不能为空'],
    trim: true
  },
  // 性别
  gender: {
    type: String,
    enum: ['男', '女'],
    required: [true, '性别不能为空']
  },
  // 出生日期
  dateOfBirth: {
    type: Date,
    required: [true, '出生日期不能为空']
  },
  // 年级
  grade: {
    type: String,
    required: [true, '年级不能为空'],
    trim: true
  },
  // 班级
  className: {
    type: String,
    required: [true, '班级不能为空'],
    trim: true
  },
  // 班主任ID
  headTeacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  // 家长ID列表
  parentIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent'
    }
  ],
  // 学习成绩
  academicPerformance: [
    {
      subject: {
        type: String,
        required: [true, '科目不能为空']
      },
      examType: {
        type: String,
        required: [true, '考试类型不能为空']
      },
      score: {
        type: Number,
        required: [true, '成绩不能为空'],
        min: 0,
        max: 100
      },
      rank: Number,
      date: {
        type: Date,
        default: Date.now
      },
      comments: String
    }
  ],
  // 行为表现评分
  behaviorScores: [
    {
      dimension: String,
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      evaluatorId: mongoose.Schema.Types.ObjectId,
      evaluatorType: String,
      date: {
        type: Date,
        default: Date.now
      },
      comments: String
    }
  ],
  // 出勤记录
  attendanceRecords: [
    {
      date: {
        type: Date,
        required: [true, '日期不能为空']
      },
      status: {
        type: String,
        enum: ['present', 'absent', 'late', 'leave'],
        required: [true, '出勤状态不能为空']
      },
      reason: String
    }
  ],
  // 作业完成情况
  homeworkCompletion: [
    {
      homeworkId: mongoose.Schema.Types.ObjectId,
      subject: String,
      completionStatus: {
        type: String,
        enum: ['completed', 'incomplete', 'late', 'excellent']
      },
      score: Number,
      comments: String,
      submitDate: Date
    }
  ],
  // 特长爱好
  hobbies: [
    {
      hobby: String
    }
  ],
  // 学习特点
  learningFeatures: [
    {
      feature: String
    }
  ],
  // 特殊需求或注意事项
  specialNotes: {
    type: String,
    trim: true,
    default: ''
  },
  // 入学日期
  enrollmentDate: {
    type: Date,
    required: [true, '入学日期不能为空']
  },
  // 学生照片
  photo: {
    type: String,
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
StudentSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// 静态方法：根据年级和班级统计学生数量
StudentSchema.statics.countByGradeAndClass = async function(grade, className) {
  return await this.countDocuments({ grade: grade, className: className });
};

// 静态方法：根据班主任ID查找学生
StudentSchema.statics.findByHeadTeacherId = async function(teacherId) {
  return await this.find({ headTeacherId: teacherId });
};

// 虚拟属性：获取关联的用户信息
StudentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// 虚拟属性：获取班主任信息
StudentSchema.virtual('headTeacher', {
  ref: 'Teacher',
  localField: 'headTeacherId',
  foreignField: '_id',
  justOne: true
});

// 虚拟属性：获取家长信息
StudentSchema.virtual('parents', {
  ref: 'Parent',
  localField: 'parentIds',
  foreignField: '_id',
  justOne: false
});

// 配置虚拟属性可序列化
StudentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // 删除不需要的属性
    delete ret._id;
    delete ret.__v;
    // 格式化日期
    if (ret.dateOfBirth) {
      ret.dateOfBirth = ret.dateOfBirth.toISOString().split('T')[0];
    }
    if (ret.enrollmentDate) {
      ret.enrollmentDate = ret.enrollmentDate.toISOString().split('T')[0];
    }
    // 格式化嵌套数组中的日期
    if (ret.academicPerformance) {
      ret.academicPerformance.forEach(item => {
        if (item.date) {
          item.date = item.date.toISOString().split('T')[0];
        }
      });
    }
    if (ret.behaviorScores) {
      ret.behaviorScores.forEach(item => {
        if (item.date) {
          item.date = item.date.toISOString().split('T')[0];
        }
      });
    }
    if (ret.attendanceRecords) {
      ret.attendanceRecords.forEach(item => {
        if (item.date) {
          item.date = item.date.toISOString().split('T')[0];
        }
      });
    }
    if (ret.homeworkCompletion) {
      ret.homeworkCompletion.forEach(item => {
        if (item.submitDate) {
          item.submitDate = item.submitDate.toISOString().split('T')[0];
        }
      });
    }
    return ret;
  }
});

StudentSchema.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    // 格式化日期和嵌套对象
    // 与toJSON类似的处理
    return ret;
  }
});

// 创建学生模型
const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;