// 认证相关路由

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// 导入模型
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');
const Student = require('../models/Student');

// 登录路由
router.post('/login', [
  check('account', '账号不能为空').notEmpty(),
  check('password', '密码不能为空').notEmpty(),
  check('role', '角色必须是teacher、parent或student').isIn(['teacher', 'parent', 'student'])
], async (req, res) => {
  // 验证请求数据
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '验证失败',
      errors: errors.array()
    });
  }

  const { account, password, role } = req.body;

  try {
    // 查找用户
    const user = await User.findOne({ account, role });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '账号或密码错误'
      });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '账号或密码错误'
      });
    }

    // 根据角色获取详细信息
    let detailedInfo = null;
    if (role === 'teacher') {
      detailedInfo = await Teacher.findOne({ userId: user._id }).select('-__v');
    } else if (role === 'parent') {
      detailedInfo = await Parent.findOne({ userId: user._id }).select('-__v');
    } else if (role === 'student') {
      detailedInfo = await Student.findOne({ userId: user._id }).select('-__v');
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    );

    // 准备返回的用户信息
    const userInfo = {
      id: user._id,
      account: user.account,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      phone: user.phone,
      email: user.email,
      info: detailedInfo || {},
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        userInfo,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试'
    });
  }
});

// 微信登录路由
router.post('/wechat-login', [
  check('code', '微信code不能为空').notEmpty(),
  check('role', '角色必须是teacher、parent或student').isIn(['teacher', 'parent', 'student'])
], async (req, res) => {
  // 验证请求数据
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '验证失败',
      errors: errors.array()
    });
  }

  const { code, role } = req.body;

  try {
    // 调用微信API获取openid和session_key
    const wechatRes = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WECHAT_APP_ID}&secret=${process.env.WECHAT_APP_SECRET}&js_code=${code}&grant_type=authorization_code`
    );

    if (wechatRes.data.errcode) {
      return res.status(400).json({
        success: false,
        message: `微信登录失败: ${wechatRes.data.errmsg}`
      });
    }

    const { openid, session_key } = wechatRes.data;

    // 查找是否存在该openid的用户
    let user = await User.findOne({ wechatOpenId: openid, role });

    if (!user) {
      // 如果用户不存在，创建新用户
      const hashedPassword = await bcrypt.hash(openid + Date.now().toString(), 10);

      user = new User({
        account: `wx_${openid.substring(0, 10)}`,
        password: hashedPassword,
        name: '微信用户',
        role: role,
        wechatOpenId: openid,
        phone: '',
        email: ''
      });

      await user.save();

      // 根据角色创建对应的详细信息
      if (role === 'teacher') {
        const teacher = new Teacher({
          userId: user._id,
          subject: '',
          grade: '',
          className: ''
        });
        await teacher.save();
      } else if (role === 'parent') {
        const parent = new Parent({
          userId: user._id,
          childStudents: [],
          relation: ''
        });
        await parent.save();
      } else if (role === 'student') {
        const student = new Student({
          userId: user._id,
          grade: '',
          className: '',
          parentIds: []
        });
        await student.save();
      }
    }

    // 根据角色获取详细信息
    let detailedInfo = null;
    if (role === 'teacher') {
      detailedInfo = await Teacher.findOne({ userId: user._id }).select('-__v');
    } else if (role === 'parent') {
      detailedInfo = await Parent.findOne({ userId: user._id }).select('-__v');
    } else if (role === 'student') {
      detailedInfo = await Student.findOne({ userId: user._id }).select('-__v');
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    );

    // 准备返回的用户信息
    const userInfo = {
      id: user._id,
      account: user.account,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      phone: user.phone,
      email: user.email,
      info: detailedInfo || {},
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      message: '微信登录成功',
      data: {
        userInfo,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    });
  } catch (error) {
    console.error('微信登录失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试'
    });
  }
});

// 验证token路由
router.get('/validate', async (req, res) => {
  try {
    // 从请求头获取token
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证token'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 检查用户是否存在
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '无效的token，用户不存在'
      });
    }

    res.status(200).json({
      success: true,
      message: 'token有效',
      data: {
        userId: user._id,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'token已过期'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的token'
      });
    }
    console.error('验证token失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试'
    });
  }
});

module.exports = router;