// 认证中间件

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 验证JWT令牌
exports.auth = async (req, res, next) => {
  try {
    // 从请求头获取token
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }
    
    // 检查token是否存在
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未授权访问，请先登录'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用，请联系管理员'
      });
    }

    // 将用户信息添加到请求对象中
    req.user = user;
    
    next();

  } catch (error) {
    console.error('认证失败:', error);
    
    // 区分不同的错误类型
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '令牌已过期，请重新登录'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的令牌'
      });
    }
    
    res.status(401).json({
      success: false,
      message: '认证失败，请重新登录'
    });
  }
};

// 角色权限验证
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // 检查用户角色是否在允许的角色列表中
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '您没有权限执行此操作'
      });
    }
    
    next();
  };
};

// 错误处理中间件
exports.errorHandler = (err, req, res, next) => {
  console.error('错误堆栈:', err.stack);
  
  // 设置默认错误状态和消息
  let statusCode = 500;
  let errorMessage = '服务器错误，请稍后再试';
  
  // 根据错误类型设置不同的状态码和消息
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // 提取验证错误信息
    const messages = Object.values(err.errors).map(val => val.message);
    errorMessage = messages.join(', ');
  } else if (err.code === 11000) {
    statusCode = 400;
    // 提取重复字段信息
    const field = Object.keys(err.keyValue)[0];
    errorMessage = `${field}字段的值已存在`;
  } else if (err.name === 'CastError') {
    statusCode = 404;
    errorMessage = `找不到ID为${err.value}的资源`;
  } else if (err.name === 'SyntaxError') {
    statusCode = 400;
    errorMessage = '请求数据格式错误';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorMessage = '未授权访问';
  }
  
  // 在开发环境中显示详细错误信息
  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      success: false,
      error: err.message,
      stack: err.stack,
      message: errorMessage
    });
  } else {
    // 在生产环境中只显示基本错误信息
    res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
};

// 未找到路由处理中间件
exports.notFound = (req, res, next) => {
  const error = new Error(`未找到请求的路由: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// 日志记录中间件
exports.logger = (req, res, next) => {
  // 获取请求信息
  const { method, url, headers, body } = req;
  const userAgent = headers['user-agent'];
  const ip = headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // 记录请求信息
  console.log(`[${new Date().toISOString()}] ${method} ${url} from ${ip} - ${userAgent}`);
  
  // 如果是POST请求，记录请求体（不包含敏感信息）
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    const sanitizedBody = { ...body };
    // 移除敏感信息
    if (sanitizedBody.password) delete sanitizedBody.password;
    if (sanitizedBody.confirmPassword) delete sanitizedBody.confirmPassword;
    if (sanitizedBody.token) delete sanitizedBody.token;
    
    console.log('请求体:', JSON.stringify(sanitizedBody));
  }
  
  // 记录响应状态和时间
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] 响应状态: ${res.statusCode}, 响应时间: ${duration}ms`);
  });
  
  next();
};