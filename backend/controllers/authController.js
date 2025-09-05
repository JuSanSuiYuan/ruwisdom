// 认证控制器

const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// 生成JWT令牌
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role: role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  );
};

// 登录处理
exports.login = async (req, res) => {
  try {
    // 验证请求数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, password, role } = req.body;

    // 查找用户
    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用，请联系管理员'
      });
    }

    // 生成令牌
    const token = generateToken(user._id, user.role);

    // 获取用户关联信息
    let userInfo = user.toJSON();
    let detailedInfo = null;

    switch (user.role) {
      case 'teacher':
        detailedInfo = await Teacher.findOne({ userId: user._id }).populate('user', 'username name phone email avatar');
        break;
      case 'parent':
        detailedInfo = await Parent.findOne({ userId: user._id }).populate('user', 'username name phone email avatar');
        break;
      case 'student':
        detailedInfo = await Student.findOne({ userId: user._id }).populate('user', 'username name phone email avatar');
        break;
      default:
        break;
    }

    // 返回登录成功信息
    res.status(200).json({
      success: true,
      token,
      userInfo,
      detailedInfo: detailedInfo ? detailedInfo.toJSON() : null,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      message: '登录成功'
    });

  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 微信登录处理
exports.wechatLogin = async (req, res) => {
  try {
    const { code, role } = req.body;

    // 验证必要参数
    if (!code || !role) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 调用微信API获取openid等信息
    // 注意：实际开发中需要调用微信官方API
    // 这里仅为示例，实际项目需要实现具体逻辑
    const wxResult = {
      openid: 'wx' + Math.random().toString(36).substring(2, 15),
      session_key: Math.random().toString(36).substring(2, 20)
    };

    // 根据openid查找或创建用户
    let user = await User.findOne({ wechatOpenId: wxResult.openid });
    
    if (!user) {
      // 创建新用户
      const defaultPassword = bcrypt.hashSync('123456', 10);
      user = new User({
        username: 'wx_' + wxResult.openid.substring(0, 10),
        password: defaultPassword,
        role: role,
        wechatOpenId: wxResult.openid,
        status: 'active',
        createdBy: 'system'
      });
      await user.save();

      // 根据角色创建对应详细信息
      switch (role) {
        case 'teacher':
          await Teacher.create({
            userId: user._id,
            name: '微信用户',
            status: 'active'
          });
          break;
        case 'parent':
          await Parent.create({
            userId: user._id,
            isPrimaryContact: true
          });
          break;
        case 'student':
          await Student.create({
            userId: user._id,
            name: '微信用户',
            studentId: 'WX' + Date.now(),
            gender: '男',
            grade: '未知',
            className: '未知',
            dateOfBirth: new Date(),
            enrollmentDate: new Date()
          });
          break;
        default:
          break;
      }
    }

    // 生成令牌
    const token = generateToken(user._id, user.role);

    // 获取用户详细信息
    let detailedInfo = null;
    switch (user.role) {
      case 'teacher':
        detailedInfo = await Teacher.findOne({ userId: user._id });
        break;
      case 'parent':
        detailedInfo = await Parent.findOne({ userId: user._id });
        break;
      case 'student':
        detailedInfo = await Student.findOne({ userId: user._id });
        break;
      default:
        break;
    }

    res.status(200).json({
      success: true,
      token,
      userInfo: user.toJSON(),
      detailedInfo: detailedInfo ? detailedInfo.toJSON() : null,
      message: '微信登录成功'
    });

  } catch (error) {
    console.error('微信登录失败:', error);
    res.status(500).json({
      success: false,
      message: '微信登录失败，请稍后再试'
    });
  }
};

// 验证令牌
exports.validateToken = async (req, res) => {
  try {
    // 从请求头获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '无效的令牌或用户不存在'
      });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用'
      });
    }

    // 获取用户详细信息
    let detailedInfo = null;
    switch (user.role) {
      case 'teacher':
        detailedInfo = await Teacher.findOne({ userId: user._id });
        break;
      case 'parent':
        detailedInfo = await Parent.findOne({ userId: user._id });
        break;
      case 'student':
        detailedInfo = await Student.findOne({ userId: user._id });
        break;
      default:
        break;
    }

    res.status(200).json({
      success: true,
      message: '令牌有效',
      userInfo: user.toJSON(),
      detailedInfo: detailedInfo ? detailedInfo.toJSON() : null
    });

  } catch (error) {
    console.error('令牌验证失败:', error);
    res.status(401).json({
      success: false,
      message: '无效的令牌'
    });
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // 从token中获取的用户ID

    // 查找用户
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 验证旧密码
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '旧密码错误'
      });
    }

    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // 保存更新
    await user.save();

    res.status(200).json({
      success: true,
      message: '密码修改成功'
    });

  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};