// AI路由 - 定义前端访问AI模型API的端点

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// 获取可用的AI模型列表
// 访问权限：需要用户登录
router.get('/models', auth, aiController.getAvailableModels);

// 获取特定模型的配置信息
// 访问权限：需要用户登录
router.get('/models/:modelKey', auth, aiController.getModelConfig);

// 发送聊天完成请求
// 访问权限：需要用户登录
router.post('/chat/completions', auth, aiController.chatCompletion);

// 执行Kode命令
// 访问权限：需要管理员权限（高风险操作）
router.post('/kode/run', [auth, auth.isAdmin], aiController.runKodeCommand);

// 批量测试模型可用性
// 访问权限：需要管理员权限
router.post('/models/test', [auth, auth.isAdmin], aiController.testModels);

// API文档路由（可选）
router.get('/docs', (req, res) => {
  res.json({
    "endpoints": [
      {
        "path": "/api/ai/models",
        "method": "GET",
        "description": "获取可用的AI模型列表",
        "requiresAuth": true,
        "requiresAdmin": false
      },
      {
        "path": "/api/ai/models/:modelKey",
        "method": "GET",
        "description": "获取特定模型的配置信息",
        "requiresAuth": true,
        "requiresAdmin": false
      },
      {
        "path": "/api/ai/chat/completions",
        "method": "POST",
        "description": "发送聊天完成请求",
        "requiresAuth": true,
        "requiresAdmin": false
      },
      {
        "path": "/api/ai/kode/run",
        "method": "POST",
        "description": "执行Kode命令",
        "requiresAuth": true,
        "requiresAdmin": true
      },
      {
        "path": "/api/ai/models/test",
        "method": "POST",
        "description": "批量测试模型可用性",
        "requiresAuth": true,
        "requiresAdmin": true
      }
    ]
  });
});

module.exports = router;