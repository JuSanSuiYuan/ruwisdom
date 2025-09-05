// 心理咨询服务

const Psychologist = require('../models/Psychologist');
const PsychAppointment = require('../models/PsychAppointment');
const User = require('../models/User');
const Student = require('../models/Student');

// 获取心理咨询师列表
exports.getPsychologists = async (filters = {}) => {
  try {
    // 构建查询条件
    const query = {
      status: 'available'
    };
    
    // 如果有筛选条件，添加到查询中
    if (filters.hospital) {
      query.hospital = filters.hospital;
    }
    
    if (filters.department) {
      query.department = filters.department;
    }
    
    if (filters.specialty) {
      query.specialties = filters.specialty;
    }
    
    // 查询心理咨询师
    const psychologists = await Psychologist.find(query).select('-licenseNumber -phone');
    return psychologists;
  } catch (error) {
    console.error('获取心理咨询师列表失败:', error);
    throw new Error('获取心理咨询师列表失败');
  }
};

// 获取心理咨询师详情
exports.getPsychologistById = async (psychologistId) => {
  try {
    const psychologist = await Psychologist.findById(psychologistId).select('-licenseNumber -phone');
    if (!psychologist) {
      throw new Error('未找到该心理咨询师');
    }
    return psychologist;
  } catch (error) {
    console.error('获取心理咨询师详情失败:', error);
    throw new Error('获取心理咨询师详情失败');
  }
};

// 预约心理咨询
exports.bookPsychologist = async (userId, appointmentData) => {
  try {
    // 验证用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 验证心理咨询师是否存在且可用
    const psychologist = await Psychologist.findById(appointmentData.psychologistId);
    if (!psychologist || psychologist.status !== 'available') {
      throw new Error('心理咨询师不可用');
    }
    
    // 检查是否是家长为学生预约
    let studentInfo = null;
    if (appointmentData.studentId) {
      studentInfo = await Student.findById(appointmentData.studentId);
      if (!studentInfo) {
        throw new Error('学生信息不存在');
      }
      // 验证家长是否有权为该学生预约
      const isParentOfStudent = studentInfo.parentIds.includes(userId);
      if (user.role === 'parent' && !isParentOfStudent) {
        throw new Error('您无权为该学生预约');
      }
    }
    
    // 创建预约记录
    const appointment = new PsychAppointment({
      userId: userId,
      userType: user.role,
      studentId: appointmentData.studentId,
      psychologistId: appointmentData.psychologistId,
      appointmentDate: appointmentData.appointmentDate,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      symptoms: appointmentData.symptoms,
      consultationMethod: appointmentData.consultationMethod,
      notes: appointmentData.notes
    });
    
    await appointment.save();
    return appointment;
  } catch (error) {
    console.error('预约心理咨询失败:', error);
    throw error;
  }
};

// 获取用户的心理咨询预约列表
exports.getUserPsychAppointments = async (userId, userType) => {
  try {
    // 构建查询条件
    const query = { userId };
    
    // 查询预约记录
    const appointments = await PsychAppointment.find(query)
      .populate('psychologistId', 'name hospital department title')
      .populate('studentId', 'name grade className');
    
    return appointments;
  } catch (error) {
    console.error('获取预约列表失败:', error);
    throw new Error('获取预约列表失败');
  }
};

// 取消心理咨询预约
exports.cancelPsychAppointment = async (appointmentId, userId) => {
  try {
    // 查找预约记录
    const appointment = await PsychAppointment.findById(appointmentId);
    if (!appointment) {
      throw new Error('预约记录不存在');
    }
    
    // 验证用户是否有权取消预约
    if (appointment.userId.toString() !== userId.toString()) {
      throw new Error('您无权取消此预约');
    }
    
    // 检查预约是否可以取消（提前24小时）
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    const timeDiff = appointmentDate - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      throw new Error('请提前24小时取消预约');
    }
    
    // 更新预约状态为已取消
    appointment.status = 'cancelled';
    await appointment.save();
    
    return appointment;
  } catch (error) {
    console.error('取消预约失败:', error);
    throw error;
  }
};