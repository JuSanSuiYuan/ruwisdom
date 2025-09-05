// 学生控制器

const Student = require('../models/Student');
const User = require('../models/User');
const Parent = require('../models/Parent');
const { validationResult } = require('express-validator');

// 获取学生列表
exports.getStudents = async (req, res) => {
  try {
    // 获取查询参数
    const { grade, className, keyword, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const query = {};
    if (grade) query.grade = grade;
    if (className) query.className = className;
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { studentId: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 执行查询
    const students = await Student.find(query)
      .populate('user', 'username name phone email avatar')
      .populate('headTeacher', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // 获取总数
    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      data: students,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      message: '获取学生列表成功'
    });

  } catch (error) {
    console.error('获取学生列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取单个学生详情
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找学生
    const student = await Student.findById(id)
      .populate('user', 'username name phone email avatar')
      .populate('headTeacher', 'name subject grade className')
      .populate('parentIds');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学生不存在'
      });
    }

    res.status(200).json({
      success: true,
      data: student,
      message: '获取学生详情成功'
    });

  } catch (error) {
    console.error('获取学生详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 创建学生
exports.createStudent = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, gender, dateOfBirth, grade, className, studentId, enrollmentDate, headTeacherId } = req.body;

    // 检查学号是否已存在
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: '学号已存在'
      });
    }

    // 创建用户账号
    const defaultPassword = '123456'; // 默认密码，首次登录需修改
    const user = new User({
      username: studentId,
      password: defaultPassword,
      name: name,
      role: 'student',
      status: 'active',
      createdBy: req.user.id
    });
    await user.save();

    // 创建学生信息
    const student = new Student({
      userId: user._id,
      name,
      gender,
      dateOfBirth,
      grade,
      className,
      studentId,
      enrollmentDate,
      headTeacherId: headTeacherId || null
    });
    await student.save();

    res.status(201).json({
      success: true,
      data: student,
      message: '创建学生成功'
    });

  } catch (error) {
    console.error('创建学生失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 更新学生信息
exports.updateStudent = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // 查找并更新学生
    const student = await Student.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('user', 'username name phone email avatar');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学生不存在'
      });
    }

    // 如果更新了用户相关信息，同时更新用户表
    if (updateData.name || updateData.phone || updateData.email) {
      await User.findByIdAndUpdate(student.userId, {
        name: updateData.name || student.name,
        phone: updateData.phone || undefined,
        email: updateData.email || undefined
      });
    }

    res.status(200).json({
      success: true,
      data: student,
      message: '更新学生信息成功'
    });

  } catch (error) {
    console.error('更新学生信息失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 删除学生
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找学生
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学生不存在'
      });
    }

    // 删除关联的用户
    await User.findByIdAndDelete(student.userId);
    
    // 删除学生信息
    await student.remove();

    res.status(200).json({
      success: true,
      message: '删除学生成功'
    });

  } catch (error) {
    console.error('删除学生失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 添加学生成绩
exports.addAcademicPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, examType, score, rank, comments } = req.body;

    // 查找学生
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学生不存在'
      });
    }

    // 添加成绩记录
    student.academicPerformance.push({
      subject,
      examType,
      score,
      rank,
      comments,
      date: new Date()
    });

    await student.save();

    res.status(200).json({
      success: true,
      data: student,
      message: '添加成绩成功'
    });

  } catch (error) {
    console.error('添加成绩失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 添加行为评分
exports.addBehaviorScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { dimension, score, comments } = req.body;

    // 查找学生
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学生不存在'
      });
    }

    // 添加行为评分
    student.behaviorScores.push({
      dimension,
      score,
      evaluatorId: req.user.id,
      evaluatorType: req.user.role,
      comments,
      date: new Date()
    });

    await student.save();

    res.status(200).json({
      success: true,
      data: student,
      message: '添加行为评分成功'
    });

  } catch (error) {
    console.error('添加行为评分失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 添加出勤记录
exports.addAttendanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, status, reason } = req.body;

    // 查找学生
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学生不存在'
      });
    }

    // 添加出勤记录
    student.attendanceRecords.push({
      date,
      status,
      reason
    });

    await student.save();

    res.status(200).json({
      success: true,
      data: student,
      message: '添加出勤记录成功'
    });

  } catch (error) {
    console.error('添加出勤记录失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取学生数据分析
exports.getStudentAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找学生
    const student = await Student.findById(id).populate('user', 'name');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: '学生不存在'
      });
    }

    // 计算成绩趋势分析
    const performanceTrend = {};
    student.academicPerformance.forEach(item => {
      if (!performanceTrend[item.subject]) {
        performanceTrend[item.subject] = [];
      }
      performanceTrend[item.subject].push({
        date: item.date,
        score: item.score,
        examType: item.examType
      });
      // 按日期排序
      performanceTrend[item.subject].sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    // 计算平均行为评分
    const behaviorScoresByDimension = {};
    student.behaviorScores.forEach(item => {
      if (!behaviorScoresByDimension[item.dimension]) {
        behaviorScoresByDimension[item.dimension] = [];
      }
      behaviorScoresByDimension[item.dimension].push(item.score);
    });

    const averageBehaviorScores = {};
    Object.keys(behaviorScoresByDimension).forEach(dimension => {
      const scores = behaviorScoresByDimension[dimension];
      averageBehaviorScores[dimension] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    // 计算出勤率
    let presentCount = 0;
    let totalAttendance = student.attendanceRecords.length;
    if (totalAttendance > 0) {
      presentCount = student.attendanceRecords.filter(record => record.status === 'present').length;
    }
    const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 100;

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.name,
          grade: student.grade,
          className: student.className
        },
        performanceTrend,
        averageBehaviorScores,
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),
        totalAttendance
      },
      message: '获取学生数据分析成功'
    });

  } catch (error) {
    console.error('获取学生数据分析失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};