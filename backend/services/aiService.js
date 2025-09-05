// AI服务 - 封装与各个大模型API交互的逻辑

const axios = require('axios');
const crypto = require('crypto');
const { getAIModelConfig, SUPPORTED_MODELS } = require('../config/aiModels');

class AIService {
  constructor() {
    this.config = getAIModelConfig();
    this.clients = {};
    this.initializeClients();
  }

  // 初始化各个模型的客户端
  initializeClients() {
    SUPPORTED_MODELS.forEach(modelKey => {
      const modelConfig = this.config[modelKey];
      if (modelConfig.apiKey || modelConfig.appId) {
        this.clients[modelKey] = this.createClient(modelKey, modelConfig);
      }
    });
  }

  // 创建特定模型的客户端
  createClient(modelKey, config) {
    const axiosInstance = axios.create({
      baseURL: config.endpoint,
      timeout: 30000,
    });

    // 添加通用请求拦截器
    axiosInstance.interceptors.request.use(
      async (request) => {
        // 根据不同模型添加认证信息
        this.addAuthToRequest(modelKey, request, config);
        return request;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return axiosInstance;
  }

  // 根据不同模型添加认证信息
  addAuthToRequest(modelKey, request, config) {
    switch (modelKey) {
      case 'wenxin':
        request.params = {
          access_token: this.getBaiduAccessToken(config)
        };
        break;
      case 'deepseek':
      case 'kimi':
      case 'tongyi':
      case 'chitu':
      case 'glm4':
      case 'qwen':
      case 'jiutian':
      case 'yuanjing':
      case 'hunyuan':
      case 'jimeng':
        request.headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        };
        break;
      case 'xunfei':
        // 讯飞星火需要特殊的认证处理
        this.addXunfeiAuth(request, config);
        break;
      case 'doubao':
        // 豆包可能有特殊的认证方式
        request.headers = {
          'Content-Type': 'application/json',
          'api-key': config.apiKey,
          'secret-key': config.secretKey
        };
        break;
      default:
        break;
    }
  }

  // 百度文心一言获取AccessToken的方法（示例）
  getBaiduAccessToken(config) {
    // 实际实现中，这里应该调用百度API获取AccessToken
    // 这只是一个示例，需要根据实际API文档实现
    return 'mock_access_token';
  }

  // 讯飞星火认证处理（示例）
  addXunfeiAuth(request, config) {
    const date = new Date().toGMTString();
    const signatureOrigin = `host: ${new URL(config.endpoint).host}\ndate: ${date}\nPOST ${request.path} HTTP/1.1`;
    const signatureSha = crypto.createHmac('sha256', config.apiSecret)
      .update(signatureOrigin)
      .digest('base64');
    const signature = encodeURIComponent(signatureSha);
    const authorizationOrigin = `api_key="${config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = Buffer.from(authorizationOrigin).toString('base64');

    request.headers = {
      'Content-Type': 'application/json',
      'host': new URL(config.endpoint).host,
      'date': date,
      'authorization': authorization
    };
  }

  // 统一的聊天完成方法
  async chatCompletion(modelKey, messages, options = {}) {
    if (!SUPPORTED_MODELS.includes(modelKey)) {
      throw new Error(`不支持的模型: ${modelKey}`);
    }

    const config = this.config[modelKey];
    if (!config.apiKey && !config.appId) {
      throw new Error(`模型 ${modelKey} 的API密钥未配置`);
    }

    try {
      // 根据不同模型格式化请求数据
      const requestData = this.formatRequestData(modelKey, messages, options);
      const client = this.clients[modelKey] || this.createClient(modelKey, config);
      
      // 对于需要特殊处理的模型，使用不同的endpoint
      let endpoint = config.endpoint;
      if (modelKey === 'wenxin') {
        // 文心一言需要先获取token
        const token = await this.getActualBaiduAccessToken(config);
        endpoint = `${endpoint}?access_token=${token}`;
      }

      const response = await client.post(endpoint, requestData);
      
      // 格式化响应数据
      return this.formatResponse(modelKey, response.data);
    } catch (error) {
      console.error(`调用模型 ${modelKey} 出错:`, error);
      throw error;
    }
  }

  // 获取实际的百度AccessToken（示例实现）
  async getActualBaiduAccessToken(config) {
    // 这里应该是实际调用百度API获取AccessToken的逻辑
    // 这只是一个示例
    return 'mock_actual_access_token';
  }

  // 根据不同模型格式化请求数据
  formatRequestData(modelKey, messages, options) {
    switch (modelKey) {
      case 'wenxin':
        return {
          messages: messages.map(msg => ({
            role: msg.role, 
            content: msg.content 
          })),
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.95
        };
      case 'xunfei':
        return {
          header: {
            app_id: config.appId,
            uid: 'user_' + Date.now()
          },
          parameter: {
            chat: {
              domain: 'general',
              temperature: options.temperature || 0.5,
              max_tokens: options.max_tokens || 2048
            }
          },
          payload: {
            message: {
              text: messages.map(msg => ({
                role: msg.role === 'system' ? 'assistant' : msg.role,
                content: msg.content
              }))
            }
          }
        };
      default:
        // 大多数模型使用类似OpenAI的格式
        return {
          model: options.model || this.getDefaultModelForKey(modelKey),
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 2048,
          top_p: options.top_p || 0.95,
          stream: options.stream || false
        };
    }
  }

  // 获取模型的默认模型名称
  getDefaultModelForKey(modelKey) {
    const defaultModels = {
      'deepseek': 'deepseek-chat',
      'kimi': 'moonshot-v1-8k',
      'tongyi': 'qwen-turbo',
      'doubao': 'ERNIE-Bot',
      'glm4': 'glm-4',
      'qwen': 'qwen-max',
      // 其他模型的默认名称
    };
    return defaultModels[modelKey] || 'default';
  }

  // 格式化响应数据
  formatResponse(modelKey, data) {
    switch (modelKey) {
      case 'wenxin':
        return {
          id: data.id,
          object: 'chat.completion',
          created: Date.now(),
          model: data.model,
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: data.result
            },
            finish_reason: data.finish_reason
          }],
          usage: data.usage
        };
      case 'xunfei':
        if (data.header.code !== 0) {
          throw new Error(`讯飞星火错误: ${data.header.message}`);
        }
        return {
          id: data.header.sid,
          object: 'chat.completion',
          created: Date.now(),
          model: 'xunfei-spark',
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: data.payload.message.text[0].content
            },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: data.payload.usage.text.prompt_tokens,
            completion_tokens: data.payload.usage.text.completion_tokens,
            total_tokens: data.payload.usage.text.total_tokens
          }
        };
      default:
        // 大多数模型返回类似OpenAI的格式
        return data;
    }
  }

  // 获取所有可用的模型
  getAvailableModels() {
    return SUPPORTED_MODELS.filter(modelKey => {
      const config = this.config[modelKey];
      return config.apiKey || config.appId;
    });
  }

  // 检查模型是否可用
  isModelAvailable(modelKey) {
    return this.getAvailableModels().includes(modelKey);
  }

  // Kode集成方法（示例）
  async runKodeCommand(command, options = {}) {
    // Kode是一个开源项目，这里提供一个示例实现
    // 实际集成可能需要本地部署或通过特定API调用
    
    // 这里只是模拟Kode的功能
    return {
      success: true,
      output: `执行Kode命令: ${command}\n选项: ${JSON.stringify(options)}`,
      model: 'kode'
    };
  }
}

// 导出单例
module.exports = new AIService();