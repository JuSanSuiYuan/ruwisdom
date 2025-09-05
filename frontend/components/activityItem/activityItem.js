// 活动项组件逻辑
Component({
  properties: {
    // 活动ID
    id: {
      type: Number,
      value: 0
    },
    // 活动标题
    title: {
      type: String,
      value: ''
    },
    // 活动时间
    time: {
      type: String,
      value: ''
    },
    // 活动类型
    type: {
      type: String,
      value: 'info'
    },
    // 图标图片路径
    icon: {
      type: String,
      value: ''
    },
    // 图标文本
    iconText: {
      type: String,
      value: '📋'
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

  lifetimes: {
    attached: function() {
      // 根据活动类型设置默认图标和背景色
      this.setIconByType();
    }
  },

  methods: {
    // 根据活动类型设置图标
    setIconByType: function() {
      const type = this.properties.type;
      let iconText = this.properties.iconText;
      let iconBgColor = this.properties.iconBgColor;

      // 如果没有自定义图标，则根据类型设置默认图标
      if (!this.properties.icon) {
        switch (type) {
          case 'notification':
            iconText = '🔔';
            iconBgColor = '#fff7e6';
            break;
          case 'schedule':
            iconText = '📅';
            iconBgColor = '#e6f7ff';
            break;
          case 'info':
            iconText = '📊';
            iconBgColor = '#f0f5ff';
            break;
          case 'holiday':
            iconText = '🎉';
            iconBgColor = '#f9f0ff';
            break;
          case 'score':
            iconText = '📝';
            iconBgColor = '#f6ffed';
            break;
          case 'homework':
            iconText = '📚';
            iconBgColor = '#e6f7ff';
            break;
          case 'achievement':
            iconText = '🏆';
            iconBgColor = '#fff7e6';
            break;
          default:
            iconText = '📋';
            iconBgColor = '#f0f5ff';
        }

        this.setData({
          iconText: iconText,
          iconBgColor: iconBgColor
        });
      }
    },

    // 点击事件处理
    onItemClick: function() {
      this.triggerEvent('click', {
        id: this.properties.id,
        type: this.properties.type
      });
    }
  }
});