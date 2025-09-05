// AI控制器 - 处理前端对AI模型的请求

const aiService = require('../services/aiService');
const { getModelDisplayName } = require('../config/aiModels');

// 获取可用的AI模型列表
exports.getAvailableModels = async (req, res) => {
  try {
    const availableModels = aiService.getAvailableModels();
    const modelsWithDetails = availableModels.map(modelKey => ({
      key: modelKey,
      name: getModelDisplayName(modelKey)
    }));
    
    res.status(200).json({
      success: true,
      data: modelsWithDetails
    });
  } catch (error) {
    console.error('获取可用模型失败:', error);
    res.status(500).json({
      success: false,
      message: '获取可用模型失败',
      error: error.message
    });
  }
};

// 发送聊天完成请求
exports.chatCompletion = async (req, res) => {
  try {
    const { modelKey, messages, options } = req.body;
    
    if (!modelKey || !messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: modelKey或messages'
      });
    }
    
    // 检查模型是否可用
    if (!aiService.isModelAvailable(modelKey)) {
      return res.status(400).json({
        success: false,
        message: `模型 ${getModelDisplayName(modelKey)} 不可用，请检查配置`
      });
    }
    
    // 调用AI服务进行聊天完成
    const response = await aiService.chatCompletion(modelKey, messages, options);
    
    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('AI聊天完成请求失败:', error);
    res.status(500).json({
      success: false,
      message: 'AI聊天完成请求失败',
      error: error.message
    });
  }
};

// 执行Kode命令
exports.runKodeCommand = async (req, res) => {
  try {
    const { command, options } = req.body;
    
    if (!command) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: command'
      });
    }
    
    // 检查Kode是否可用
    if (!aiService.isModelAvailable('kode')) {
      return res.status(400).json({
        success: false,
        message: 'Kode不可用，请检查配置'
      });
    }
    
    // 执行Kode命令
    const response = await aiService.runKodeCommand(command, options);
    
    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('执行Kode命令失败:', error);
    res.status(500).json({
      success: false,
      message: '执行Kode命令失败',
      error: error.message
    });
  }
};

// 批量测试模型可用性
exports.testModels = async (req, res) => {
  try {
    const testResults = [];
    const availableModels = aiService.getAvailableModels();
    
    for (const modelKey of availableModels) {
      try {
        // 发送一个简单的测试消息
        const testMessage = [{
          role: 'user',
          content: '请回复"测试成功"'
        }];
        
        const response = await aiService.chatCompletion(modelKey, testMessage, {
          max_tokens: 20
        });
        
        testResults.push({
          modelKey,
          name: getModelDisplayName(modelKey),
          success: true,
          response: response
        });
      } catch (error) {
        testResults.push({
          modelKey,
          name: getModelDisplayName(modelKey),
          success: false,
          error: error.message
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: testResults
    });
  } catch (error) {
    console.error('批量测试模型失败:', error);
    res.status(500).json({
      success: false,
      message: '批量测试模型失败',
      error: error.message
    });
  }
};

// 获取模型配置信息
exports.getModelConfig = async (req, res) => {
  try {
    const { modelKey } = req.params;
    
    // 这里返回的配置不包含敏感信息（如API密钥）
    res.status(200).json({
      success: true,
      data: {
        modelKey,
        name: getModelDisplayName(modelKey),
        available: aiService.isModelAvailable(modelKey),
        // 可以添加其他非敏感配置信息
      }
    });
  } catch (error) {
    console.error('获取模型配置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取模型配置失败',
      error: error.message
    });
  }
};