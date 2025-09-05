// 学生路由

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// 控制器
const studentController = require('../controllers/studentController');

// 中间件
const { auth, authorize } = require('../middleware/auth');

// 验证规则
const studentValidationRules = [
  body('name').notEmpty().withMessage('学生姓名不能为空'),
  body('gender').isIn(['男', '女']).withMessage('性别必须是男或女'),
  body('dateOfBirth').isISO8601().withMessage('出生日期格式不正确'),
  body('grade').notEmpty().withMessage('年级不能为空'),
  body('className').notEmpty().withMessage('班级不能为空'),
  body('studentId').notEmpty().withMessage('学号不能为空'),
  body('enrollmentDate').isISO8601().withMessage('入学日期格式不正确')
];

const performanceValidationRules = [
  body('subject').notEmpty().withMessage('科目不能为空'),
  body('examType').notEmpty().withMessage('考试类型不能为空'),
  body('score').isInt({ min: 0, max: 100 }).withMessage('分数必须是0-100之间的整数')
];

const behaviorValidationRules = [
  body('dimension').notEmpty().withMessage('评分维度不能为空'),
  body('score').isInt({ min: 0, max: 100 }).withMessage('评分必须是0-100之间的整数')
];

const attendanceValidationRules = [
  body('date').isISO8601().withMessage('日期格式不正确'),
  body('status').isIn(['present', 'absent', 'late', 'leave']).withMessage('出勤状态无效')
];

// 路由定义

// 获取学生列表 - 教师、管理员
router.get('/', auth, authorize('teacher', 'admin'), studentController.getStudents);

// 获取单个学生详情 - 教师、管理员、家长
router.get('/:id', auth, authorize('teacher', 'admin', 'parent'), studentController.getStudentById);

// 创建学生 - 教师、管理员
router.post('/', auth, authorize('teacher', 'admin'), studentValidationRules, studentController.createStudent);

// 更新学生信息 - 教师、管理员
router.put('/:id', auth, authorize('teacher', 'admin'), studentController.updateStudent);

// 删除学生 - 管理员
router.delete('/:id', auth, authorize('admin'), studentController.deleteStudent);

// 添加学生成绩 - 教师、管理员
router.post('/:id/performance', auth, authorize('teacher', 'admin'), performanceValidationRules, studentController.addAcademicPerformance);

// 添加行为评分 - 教师、管理员
router.post('/:id/behavior', auth, authorize('teacher', 'admin'), behaviorValidationRules, studentController.addBehaviorScore);

// 添加出勤记录 - 教师、管理员
router.post('/:id/attendance', auth, authorize('teacher', 'admin'), attendanceValidationRules, studentController.addAttendanceRecord);

// 获取学生数据分析 - 教师、管理员、家长
router.get('/:id/analysis', auth, authorize('teacher', 'admin', 'parent'), studentController.getStudentAnalysis);

// 获取学生成绩趋势 - 教师、管理员、家长
router.get('/:id/performance/trend', auth, authorize('teacher', 'admin', 'parent'), async (req, res) => {
  try {
    const { id } = req.params;
    const student = await studentController.getStudentById(req, res);
    // 这里可以添加特定的成绩趋势处理逻辑
    if (student && student.success) {
      const performanceData = student.data.academicPerformance;
      // 按科目分组和处理数据
      const trendData = {};
      performanceData.forEach(item => {
        if (!trendData[item.subject]) {
          trendData[item.subject] = [];
        }
        trendData[item.subject].push({
          date: item.date,
          score: item.score,
          examType: item.examType
        });
        // 按日期排序
        trendData[item.subject].sort((a, b) => new Date(a.date) - new Date(b.date));
      });
      res.status(200).json({
        success: true,
        data: trendData,
        message: '获取成绩趋势成功'
      });
    }
  } catch (error) {
    console.error('获取成绩趋势失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
});

// 获取学生出勤统计 - 教师、管理员、家长
router.get('/:id/attendance/stats', auth, authorize('teacher', 'admin', 'parent'), async (req, res) => {
  try {
    const { id } = req.params;
    const student = await studentController.getStudentById(req, res);
    // 这里可以添加特定的出勤统计处理逻辑
    if (student && student.success) {
      const attendanceRecords = student.data.attendanceRecords;
      // 计算不同状态的出勤次数
      const stats = {
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        total: attendanceRecords.length
      };
      attendanceRecords.forEach(record => {
        if (stats.hasOwnProperty(record.status)) {
          stats[record.status]++;
        }
      });
      // 计算出勤率
      stats.attendanceRate = stats.total > 0 ? (stats.present / stats.total) * 100 : 100;
      res.status(200).json({
        success: true,
        data: stats,
        message: '获取出勤统计成功'
      });
    }
  } catch (error) {
    console.error('获取出勤统计失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
});

module.exports = router;