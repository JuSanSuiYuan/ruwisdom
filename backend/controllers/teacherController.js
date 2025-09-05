// 教师控制器

const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Student = require('../models/Student');
const { validationResult } = require('express-validator');

// 获取教师列表
exports.getTeachers = async (req, res) => {
  try {
    // 获取查询参数
    const { subject, grade, keyword, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const query = {};
    if (subject) query.subject = subject;
    if (grade) query.grade = grade;
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { teacherId: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 执行查询
    const teachers = await Teacher.find(query)
      .populate('user', 'username name phone email avatar')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // 获取总数
    const total = await Teacher.countDocuments(query);

    res.status(200).json({
      success: true,
      data: teachers,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      message: '获取教师列表成功'
    });

  } catch (error) {
    console.error('获取教师列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取单个教师详情
exports.getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找教师
    const teacher = await Teacher.findById(id)
      .populate('user', 'username name phone email avatar');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: '教师不存在'
      });
    }

    // 获取教师所带班级的学生数量
    const studentCount = await Student.countDocuments({ headTeacherId: id });

    res.status(200).json({
      success: true,
      data: {
        ...teacher.toJSON(),
        studentCount
      },
      message: '获取教师详情成功'
    });

  } catch (error) {
    console.error('获取教师详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 创建教师
exports.createTeacher = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, gender, subject, grade, className, teacherId, isHeadTeacher } = req.body;

    // 检查教师ID是否已存在
    if (teacherId) {
      const existingTeacher = await Teacher.findOne({ teacherId });
      if (existingTeacher) {
        return res.status(400).json({
          success: false,
          message: '教师ID已存在'
        });
      }
    }

    // 创建用户账号
    const defaultPassword = '123456'; // 默认密码，首次登录需修改
    const username = teacherId || 'teacher_' + Date.now();
    const user = new User({
      username,
      password: defaultPassword,
      name: name,
      role: 'teacher',
      status: 'active',
      createdBy: req.user.id
    });
    await user.save();

    // 创建教师信息
    const teacher = new Teacher({
      userId: user._id,
      name,
      gender,
      subject,
      grade,
      className,
      teacherId,
      isHeadTeacher: isHeadTeacher || false,
      status: 'active'
    });
    await teacher.save();

    res.status(201).json({
      success: true,
      data: teacher,
      message: '创建教师成功'
    });

  } catch (error) {
    console.error('创建教师失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 更新教师信息
exports.updateTeacher = async (req, res) => {
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

    // 查找并更新教师
    const teacher = await Teacher.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('user', 'username name phone email avatar');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: '教师不存在'
      });
    }

    // 如果更新了用户相关信息，同时更新用户表
    if (updateData.name || updateData.phone || updateData.email) {
      await User.findByIdAndUpdate(teacher.userId, {
        name: updateData.name || teacher.name,
        phone: updateData.phone || undefined,
        email: updateData.email || undefined
      });
    }

    res.status(200).json({
      success: true,
      data: teacher,
      message: '更新教师信息成功'
    });

  } catch (error) {
    console.error('更新教师信息失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 删除教师
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找教师
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: '教师不存在'
      });
    }

    // 检查是否有学生关联此教师
    const studentCount = await Student.countDocuments({ headTeacherId: id });
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: '该教师关联了学生，请先移除学生关联'
      });
    }

    // 删除关联的用户
    await User.findByIdAndDelete(teacher.userId);
    
    // 删除教师信息
    await teacher.remove();

    res.status(200).json({
      success: true,
      message: '删除教师成功'
    });

  } catch (error) {
    console.error('删除教师失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取教师所带班级的学生
exports.getTeacherStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { keyword, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const query = { headTeacherId: id };
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { studentId: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 获取学生列表
    const students = await Student.find(query)
      .populate('user', 'username name phone email avatar')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });

    // 获取总数
    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      data: students,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      message: '获取教师所带班级学生成功'
    });

  } catch (error) {
    console.error('获取教师所带班级学生失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取教师教学统计数据
exports.getTeacherStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找教师
    const teacher = await Teacher.findById(id).populate('user', 'name');
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: '教师不存在'
      });
    }

    // 统计数据
    const studentCount = await Student.countDocuments({ headTeacherId: id });
    
    // 获取学生成绩统计（示例：平均分）
    const students = await Student.find({ headTeacherId: id });
    let totalScore = 0;
    let scoreCount = 0;
    
    students.forEach(student => {
      if (student.academicPerformance && student.academicPerformance.length > 0) {
        // 获取最新的一次考试成绩
        const latestPerformance = student.academicPerformance.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (latestPerformance) {
          totalScore += latestPerformance.score;
          scoreCount++;
        }
      }
    });
    
    const averageScore = scoreCount > 0 ? parseFloat((totalScore / scoreCount).toFixed(2)) : 0;

    // 统计学生出勤情况
    let totalAttendance = 0;
    let presentCount = 0;
    
    students.forEach(student => {
      if (student.attendanceRecords && student.attendanceRecords.length > 0) {
        // 获取最近30天的出勤记录
        const recentAttendance = student.attendanceRecords.filter(record => {
          const recordDate = new Date(record.date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return recordDate >= thirtyDaysAgo;
        });
        
        totalAttendance += recentAttendance.length;
        presentCount += recentAttendance.filter(record => record.status === 'present').length;
      }
    });
    
    const attendanceRate = totalAttendance > 0 ? parseFloat(((presentCount / totalAttendance) * 100).toFixed(2)) : 100;

    res.status(200).json({
      success: true,
      data: {
        teacher: {
          id: teacher._id,
          name: teacher.name,
          subject: teacher.subject,
          grade: teacher.grade,
          className: teacher.className
        },
        studentCount,
        averageScore,
        attendanceRate
      },
      message: '获取教师教学统计数据成功'
    });

  } catch (error) {
    console.error('获取教师教学统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};