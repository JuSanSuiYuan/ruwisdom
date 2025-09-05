// AI大模型配置文件

// 加载环境变量
export const getAIModelConfig = () => {
  return {
    // 文心一言配置
    wenxin: {
      apiKey: process.env.BAIDU_API_KEY || '',
      secretKey: process.env.BAIDU_SECRET_KEY || '',
      endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions'
    },
    
    // 深度求索R1配置
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      endpoint: 'https://api.deepseek.com/chat/completions'
    },
    
    // 月之暗面Kimi配置
    kimi: {
      apiKey: process.env.KIMI_API_KEY || '',
      endpoint: 'https://api.moonshot.cn/v1/chat/completions'
    },
    
    // 通义千问配置
    tongyi: {
      apiKey: process.env.ALIBABA_API_KEY || '',
      endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
    },
    
    // 豆包配置
    doubao: {
      apiKey: process.env.DOUBAO_API_KEY || '',
      secretKey: process.env.DOUBAO_SECRET_KEY || '',
      endpoint: 'https://api.doubao.com/chat/completions'
    },
    
    // 讯飞星火配置
    xunfei: {
      appId: process.env.XUNFEI_APPID || '',
      apiKey: process.env.XUNFEI_API_KEY || '',
      apiSecret: process.env.XUNFEI_API_SECRET || '',
      endpoint: 'https://spark-api.xf-yun.com/v1.1/chat'
    },
    
    // 赤兔配置
    chitu: {
      apiKey: process.env.CHITU_API_KEY || '',
      endpoint: 'https://api.chitu.ai/v1/chat/completions'
    },
    
    // 智谱清言GLM-4配置
    glm4: {
      apiKey: process.env.ZHIPU_API_KEY || '',
      endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    },
    
    // Qwen-Max配置
    qwen: {
      apiKey: process.env.QWEN_API_KEY || '',
      endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
    },
    
    // 九天配置
    jiutian: {
      apiKey: process.env.JIUTIAN_API_KEY || '',
      endpoint: 'https://api.jiutianai.com/v1/chat/completions'
    },
    
    // 元景配置
    yuanjing: {
      apiKey: process.env.YUANJING_API_KEY || '',
      endpoint: 'https://api.yuanjing.ai/v1/chat/completions'
    },
    
    // 混元大模型配置
    hunyuan: {
      apiKey: process.env.HUNYUAN_API_KEY || '',
      endpoint: 'https://api.hunyuan.com/v1/chat/completions'
    },
    
    // 即梦AI配置
    jimeng: {
      apiKey: process.env.JIMENG_API_KEY || '',
      endpoint: 'https://api.jimeng.ai/v1/chat/completions'
    },
    
    // Kode配置
    kode: {
      baseUrl: process.env.KODE_BASE_URL || 'https://github.com/shareAI-lab/Kode',
      // Kode是一个开源项目，可能需要本地部署或通过API调用
      apiKey: process.env.KODE_API_KEY || ''
    }
  };
};

// 支持的模型列表
export const SUPPORTED_MODELS = [
  'wenxin',
  'deepseek',
  'kimi',
  'tongyi',
  'doubao',
  'xunfei',
  'chitu',
  'glm4',
  'qwen',
  'jiutian',
  'yuanjing',
  'hunyuan',
  'jimeng',
  'kode'
];

// 获取模型显示名称
export const getModelDisplayName = (modelKey) => {
  const displayNames = {
    'wenxin': '文心一言',
    'deepseek': '深度求索R1',
    'kimi': '月之暗面Kimi',
    'tongyi': '通义千问',
    'doubao': '豆包',
    'xunfei': '讯飞星火',
    'chitu': '赤兔',
    'glm4': '智谱清言GLM-4',
    'qwen': 'Qwen-Max',
    'jiutian': '九天',
    'yuanjing': '元景',
    'hunyuan': '混元大模型',
    'jimeng': '即梦AI',
    'kode': 'Kode'
  };
  
  return displayNames[modelKey] || modelKey;
};