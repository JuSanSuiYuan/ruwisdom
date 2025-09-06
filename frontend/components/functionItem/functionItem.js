// 功能项组件逻辑
Component({
  properties: {
    // 功能ID
    id: {
      type: String,
      value: ''
    },
    // 功能名称
    name: {
      type: String,
      value: ''
    },
    // 图标图片路径
    icon: {
      type: String,
      value: ''
    },
    // 图标文本
    iconText: {
      type: String,
      value: '📱'
    },
    // 背景颜色
    bgColor: {
      type: String,
      value: '#f0f5ff'
    }
  },

  data: {
    // 组件内部数据
  },

  lifetimes: {
    attached: function() {
      // 根据功能ID设置默认图标和背景色
      this.setIconByFunctionId();
    }
  },

  methods: {
    // 根据功能ID设置图标和背景色
    setIconByFunctionId: function() {
      const functionId = this.properties.id;
      let iconText = this.properties.iconText;
      let bgColor = this.properties.bgColor;

      // 如果没有自定义图标，则根据功能ID设置默认图标
      if (!this.properties.icon) {
        switch (functionId) {
          case 'student':
            iconText = '👨‍🎓';
            bgColor = '#e6f7ff';
            break;
          case 'homework':
            iconText = '📚';
            bgColor = '#f6ffed';
            break;
          case 'notification':
            iconText = '🔔';
            bgColor = '#fff7e6';
            break;
          case 'analysis':
            iconText = '📊';
            bgColor = '#fff2e8';
            break;
          case 'schedule':
            iconText = '📅';
            bgColor = '#f0f5ff';
            break;
          case 'election':
            iconText = '🗳️';
            bgColor = '#fff7e6';
            break;
          case 'communication':
            iconText = '💬';
            bgColor = '#f9f0ff';
            break;
          default:
            iconText = '📱';
            bgColor = '#f0f5ff';
        }

        this.setData({
          iconText: iconText,
          bgColor: bgColor
        });
      }
    },

    // 点击事件处理
    onItemClick: function() {
      this.triggerEvent('click', {
        id: this.properties.id,
        name: this.properties.name
      });
    }
  }
});