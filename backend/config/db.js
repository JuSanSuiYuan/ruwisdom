// 儒智慧数据库连接配置

const mongoose = require('mongoose');

/**
 * 连接MongoDB数据库
 */
const connectDB = async () => {
  try {
    // 确定要连接的数据库URI
    const mongoURI = process.env.NODE_ENV === 'test'
      ? process.env.MONGO_URI_TEST
      : process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('数据库连接URI未配置，请检查环境变量MONGO_URI');
    }

    // 数据库连接选项
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    // 连接数据库
    const conn = await mongoose.connect(mongoURI, options);

    console.log(`MongoDB数据库连接成功: ${conn.connection.host}`);
    
    // 监听连接断开
    conn.connection.on('disconnected', () => {
      console.log('MongoDB连接断开');
    });
    
    // 监听连接错误
    conn.connection.on('error', (err) => {
      console.error('MongoDB连接错误:', err);
      // 如果是连接错误，尝试重新连接
      setTimeout(() => {
        console.log('尝试重新连接MongoDB...');
        connectDB();
      }, 5000);
    });
    
    // 处理进程终止信号
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB连接已关闭（应用程序终止）');
      process.exit(0);
    });
  } catch (error) {
    console.error('MongoDB连接失败:', error.message);
    // 如果连接失败，尝试重新连接
    setTimeout(() => {
      console.log('尝试重新连接MongoDB...');
      connectDB();
    }, 5000);
  }
};

module.exports = connectDB;