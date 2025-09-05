// 统计卡片组件逻辑
Component({
  properties: {
    // 统计数值
    number: {
      type: Number,
      value: 0
    },
    // 统计标签
    label: {
      type: String,
      value: ''
    },
    // 图标图片路径
    icon: {
      type: String,
      value: ''
    },
    // 图标文本（如果没有图片）
    iconText: {
      type: String,
      value: '📊'
    },
    // 图标背景色
    iconBgColor: {
      type: String,
      value: '#f0f5ff'
    }
  },

  data: {
    // 组件内部数据
  },

  methods: {
    // 点击事件处理
    onCardClick: function() {
      this.triggerEvent('click', {
        label: this.properties.label,
        number: this.properties.number
      });
    }
  }
});