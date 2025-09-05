// 心理咨询控制器

const psychService = require('../services/psychService');

// 获取心理咨询师列表
exports.getPsychologists = async (req, res) => {
  try {
    // 获取查询参数
    const filters = {
      hospital: req.query.hospital,
      department: req.query.department,
      specialty: req.query.specialty
    };
    
    // 获取心理咨询师列表
    const psychologists = await psychService.getPsychologists(filters);
    
    res.status(200).json({
      success: true,
      data: psychologists,
      message: '获取心理咨询师列表成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '获取心理咨询师列表失败'
    });
  }
};

// 获取心理咨询师详情
exports.getPsychologistById = async (req, res) => {
  try {
    const psychologistId = req.params.id;
    
    // 获取心理咨询师详情
    const psychologist = await psychService.getPsychologistById(psychologistId);
    
    res.status(200).json({
      success: true,
      data: psychologist,
      message: '获取心理咨询师详情成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '获取心理咨询师详情失败'
    });
  }
};

// 预约心理咨询
exports.bookPsychologist = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentData = req.body;
    
    // 预约心理咨询
    const appointment = await psychService.bookPsychologist(userId, appointmentData);
    
    res.status(201).json({
      success: true,
      data: appointment,
      message: '预约成功'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '预约失败'
    });
  }
};

// 获取用户的心理咨询预约列表
exports.getUserPsychAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.role;
    
    // 获取预约列表
    const appointments = await psychService.getUserPsychAppointments(userId, userType);
    
    res.status(200).json({
      success: true,
      data: appointments,
      message: '获取预约列表成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '获取预约列表失败'
    });
  }
};

// 取消心理咨询预约
exports.cancelPsychAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;
    
    // 取消预约
    const appointment = await psychService.cancelPsychAppointment(appointmentId, userId);
    
    res.status(200).json({
      success: true,
      data: appointment,
      message: '取消预约成功'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '取消预约失败'
    });
  }
};