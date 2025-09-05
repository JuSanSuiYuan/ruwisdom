// 教师路由

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// 控制器
const teacherController = require('../controllers/teacherController');

// 中间件
const { auth, authorize } = require('../middleware/auth');

// 验证规则
const teacherValidationRules = [
  body('name').notEmpty().withMessage('教师姓名不能为空'),
  body('gender').isIn(['男', '女']).withMessage('性别必须是男或女'),
  body('subject').notEmpty().withMessage('科目不能为空'),
  body('grade').notEmpty().withMessage('年级不能为空'),
  body('className').notEmpty().withMessage('班级不能为空')
];

// 路由定义

// 获取教师列表 - 管理员
router.get('/', auth, authorize('admin'), teacherController.getTeachers);

// 获取单个教师详情 - 教师、管理员
router.get('/:id', auth, authorize('teacher', 'admin'), teacherController.getTeacherById);

// 创建教师 - 管理员
router.post('/', auth, authorize('admin'), teacherValidationRules, teacherController.createTeacher);

// 更新教师信息 - 教师、管理员
router.put('/:id', auth, authorize('teacher', 'admin'), teacherController.updateTeacher);

// 删除教师 - 管理员
router.delete('/:id', auth, authorize('admin'), teacherController.deleteTeacher);

// 获取教师所带班级的学生 - 教师、管理员
router.get('/:id/students', auth, authorize('teacher', 'admin'), teacherController.getTeacherStudents);

// 获取教师教学统计数据 - 教师、管理员
router.get('/:id/statistics', auth, authorize('teacher', 'admin'), teacherController.getTeacherStatistics);

// 获取教师课表（示例）
router.get('/:id/schedule', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    // 实际项目中需要从数据库获取教师课表
    // 这里仅提供示例数据结构
    const { id } = req.params;
    const teacher = await teacherController.getTeacherById(req, res);
    
    if (teacher && teacher.success) {
      // 示例课表数据
      const schedule = {
        teacherId: id,
        teacherName: teacher.data.name,
        weekSchedule: [
          {
            day: '周一',
            lessons: [
              { time: '08:00-08:45', subject: '语文', className: '一年级(1)班' },
              { time: '10:30-11:15', subject: '语文', className: '一年级(2)班' }
            ]
          },
          {
            day: '周二',
            lessons: [
              { time: '09:15-10:00', subject: '数学', className: '一年级(1)班' },
              { time: '14:00-14:45', subject: '数学', className: '一年级(2)班' }
            ]
          },
          // 其他天的课表...
        ]
      };
      
      res.status(200).json({
        success: true,
        data: schedule,
        message: '获取教师课表成功'
      });
    }
  } catch (error) {
    console.error('获取教师课表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
});

// 获取教师待办任务（示例）
router.get('/:id/tasks', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    // 实际项目中需要从数据库获取待办任务
    // 这里仅提供示例数据结构
    const { id } = req.params;
    
    // 示例待办任务数据
    const tasks = [
      {
        id: '1',
        title: '批改一年级(1)班语文作业',
        type: 'homework',
        dueDate: new Date(Date.now() + 86400000), // 明天
        priority: 'high',
        status: 'pending'
      },
      {
        id: '2',
        title: '参加班主任会议',
        type: 'meeting',
        dueDate: new Date(Date.now() + 172800000), // 后天
        priority: 'medium',
        status: 'pending'
      },
      {
        id: '3',
        title: '准备下周测验',
        type: 'exam',
        dueDate: new Date(Date.now() + 604800000), // 下周
        priority: 'medium',
        status: 'pending'
      }
    ];
    
    res.status(200).json({
      success: true,
      data: tasks,
      message: '获取教师待办任务成功'
    });
  } catch (error) {
    console.error('获取教师待办任务失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
});

// 导出路由
module.exports = router;