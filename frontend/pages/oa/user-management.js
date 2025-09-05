// 用户管理页面逻辑

Page({
  data: {
    // 用户列表
    users: [],
    // 筛选条件
    activeFilter: 'all',
    statusOptions: ['全部状态', '正常', '未激活', '已暂停'],
    statusIndex: 0,
    statusFilter: '',
    // 搜索相关
    showSearchBar: false,
    searchKeyword: '',
    // 分页相关
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
    // 添加用户弹窗
    showAddDialog: false,
    newUser: {
      name: '',
      account: '',
      password: '',
      role: 'student',
      roleIndex: 0,
      phone: ''
    },
    roleOptions: ['学生', '教师', '家长', '管理员'],
    roleMap: {
      '学生': 'student',
      '教师': 'teacher',
      '家长': 'parent',
      '管理员': 'admin'
    },
    // 加载状态
    isLoading: true
  },

  onLoad: function() {
    // 加载用户列表
    this.loadUsers();
  },

  // 加载用户列表
  loadUsers: function() {
    wx.showLoading({ title: '加载中...' });
    
    // 构建请求参数
    const params = {
      page: this.data.currentPage,
      limit: this.data.limit
    };
    
    // 添加角色筛选
    if (this.data.activeFilter !== 'all') {
      params.role = this.data.activeFilter;
    }
    
    // 添加状态筛选
    if (this.data.statusFilter) {
      params.status = this.data.statusFilter;
    }
    
    // 添加搜索关键词
    if (this.data.searchKeyword) {
      params.keyword = this.data.searchKeyword;
    }
    
    // 发送API请求
    wx.request({
      url: 'http://localhost:5000/api/oa/users',
      method: 'GET',
      data: params,
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          this.setData({
            users: res.data.data,
            total: res.data.total,
            totalPages: res.data.pages
          });
        }
      },
      fail: (err) => {
        console.error('获取用户列表失败:', err);
        // 使用模拟数据
        this.setMockUsers();
      },
      complete: () => {
        this.setData({ isLoading: false });
        wx.hideLoading();
      }
    });
  },

  // 设置模拟用户数据
  setMockUsers: function() {
    const mockUsers = [
      {
        id: '1',
        name: '张老师',
        account: 'teacher001',
        role: 'teacher',
        roleName: '教师',
        status: 'active',
        statusName: '正常',
        phone: '13800138001',
        avatar: '/images/teacher-avatar.png'
      },
      {
        id: '2',
        name: '李同学',
        account: 'student001',
        role: 'student',
        roleName: '学生',
        status: 'active',
        statusName: '正常',
        phone: '13800138002',
        avatar: '/images/student-avatar.png'
      },
      {
        id: '3',
        name: '王家长',
        account: 'parent001',
        role: 'parent',
        roleName: '家长',
        status: 'active',
        statusName: '正常',
        phone: '13800138003',
        avatar: '/images/parent-avatar.png'
      },
      {
        id: '4',
        name: '管理员',
        account: 'admin',
        role: 'admin',
        roleName: '管理员',
        status: 'active',
        statusName: '正常',
        phone: '13800138000',
        avatar: '/images/admin-avatar.png'
      }
    ];
    
    // 根据筛选条件过滤模拟数据
    let filteredUsers = mockUsers;
    if (this.data.activeFilter !== 'all') {
      filteredUsers = mockUsers.filter(user => user.role === this.data.activeFilter);
    }
    
    this.setData({
      users: filteredUsers,
      total: filteredUsers.length,
      totalPages: 1
    });
  },

  // 设置角色筛选
  setFilter: function(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      activeFilter: filter,
      currentPage: 1
    });
    this.loadUsers();
  },

  // 设置状态筛选
  setStatusFilter: function(e) {
    const index = e.detail.value;
    const statusText = this.data.statusOptions[index];
    let status = '';
    
    if (statusText === '正常') {
      status = 'active';
    } else if (statusText === '未激活') {
      status = 'inactive';
    } else if (statusText === '已暂停') {
      status = 'suspended';
    }
    
    this.setData({
      statusIndex: index,
      statusFilter: status,
      currentPage: 1
    });
    this.loadUsers();
  },

  // 显示搜索框
  showSearch: function() {
    this.setData({ showSearchBar: true });
  },

  // 隐藏搜索框
  hideSearch: function() {
    this.setData({ showSearchBar: false, searchKeyword: '' });
    this.loadUsers();
  },

  // 搜索输入
  onSearchInput: function(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  // 执行搜索
  onSearch: function() {
    this.setData({ currentPage: 1 });
    this.loadUsers();
  },

  // 上一页
  prevPage: function() {
    if (this.data.currentPage > 1) {
      this.setData({ currentPage: this.data.currentPage - 1 });
      this.loadUsers();
    }
  },

  // 下一页
  nextPage: function() {
    if (this.data.currentPage < this.data.totalPages) {
      this.setData({ currentPage: this.data.currentPage + 1 });
      this.loadUsers();
    }
  },

  // 显示添加用户弹窗
  showAddUserDialog: function() {
    this.setData({
      showAddDialog: true,
      newUser: {
        name: '',
        account: '',
        password: '',
        role: 'student',
        roleIndex: 0,
        phone: ''
      }
    });
  },

  // 隐藏添加用户弹窗
  hideAddUserDialog: function() {
    this.setData({ showAddDialog: false });
  },

  // 用户名输入
  onNameInput: function(e) {
    this.setData({ 'newUser.name': e.detail.value });
  },

  // 账号输入
  onAccountInput: function(e) {
    this.setData({ 'newUser.account': e.detail.value });
  },

  // 密码输入
  onPasswordInput: function(e) {
    this.setData({ 'newUser.password': e.detail.value });
  },

  // 角色选择
  onRoleChange: function(e) {
    const index = e.detail.value;
    const roleText = this.data.roleOptions[index];
    const role = this.data.roleMap[roleText];
    
    this.setData({
      'newUser.roleIndex': index,
      'newUser.role': role
    });
  },

  // 电话输入
  onPhoneInput: function(e) {
    this.setData({ 'newUser.phone': e.detail.value });
  },

  // 确认添加用户
  confirmAddUser: function() {
    const { name, account, password, role, phone } = this.data.newUser;
    
    // 表单验证
    if (!name || !account || !password) {
      wx.showToast({ title: '用户名、账号和密码不能为空', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '添加中...' });
    
    // 发送API请求
    wx.request({
      url: 'http://localhost:5000/api/auth/register',
      method: 'POST',
      data: {
        name,
        account,
        password,
        role,
        phone
      },
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.statusCode === 201 && res.data.success) {
          wx.showToast({ title: '添加成功' });
          this.hideAddUserDialog();
          this.loadUsers();
        } else {
          wx.showToast({ title: res.data.message || '添加失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('添加用户失败:', err);
        wx.showToast({ title: '添加失败，请稍后重试', icon: 'none' });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 编辑用户
  editUser: function(e) {
    const userId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/oa/user-edit?id=${userId}`
    });
  },

  // 删除用户
  deleteUser: function(e) {
    const userId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该用户吗？此操作不可撤销。',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          
          // 发送API请求
          wx.request({
            url: `http://localhost:5000/api/oa/users/${userId}`,
            method: 'DELETE',
            header: {
              'Authorization': `Bearer ${wx.getStorageSync('token')}`
            },
            success: (res) => {
              if (res.statusCode === 200 && res.data.success) {
                wx.showToast({ title: '删除成功' });
                this.loadUsers();
              } else {
                wx.showToast({ title: res.data.message || '删除失败', icon: 'none' });
              }
            },
            fail: (err) => {
              console.error('删除用户失败:', err);
              wx.showToast({ title: '删除失败，请稍后重试', icon: 'none' });
            },
            complete: () => {
              wx.hideLoading();
            }
          });
        }
      }
    });
  }
});