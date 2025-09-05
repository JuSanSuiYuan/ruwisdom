// 后端服务入口文件

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// 中间件
const { auth, errorHandler, notFound, logger } = require('./middleware/auth');

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

// 创建Express应用
const app = express();

// 基础中间件
app.use(logger); // 日志记录
app.use(cors({ 
  origin: process.env.FRONTEND_URL || '*',
  credentials: true 
})); // 跨域处理
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码请求体
app.use(cookieParser()); // 解析Cookie

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 路由注册
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/parents', require('./routes/parentRoutes'));
app.use('/api/leave', require('./routes/leaveRoutes'));
app.use('/api/oa', require('./routes/oaRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/robot', require('./routes/robotRoutes'));
app.use('/api/psych', require('./routes/psychRoutes'));

// 未找到路由处理
app.use(notFound);

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
});

// 处理未捕获的异常
process.on('uncaughtException', (err, origin) => {
  console.error('未捕获的异常:', err);
  console.error('异常来源:', origin);
  // 在实际生产环境中，可能需要进行更优雅的关闭处理
  // process.exit(1); // 非零退出表示有错误
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  console.error('Promise对象:', promise);
  // 在实际生产环境中，可能需要进行更优雅的关闭处理
});

// 导出app供测试使用
module.exports = app;