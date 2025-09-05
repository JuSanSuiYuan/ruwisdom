// 视频流服务 - 处理视频流的获取、传输和管理功能

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const Robot = require('../models/Robot');
const Camera = require('../models/Camera');

// 视频流服务类
class VideoStreamService {
  constructor() {
    // 存储活动的视频流
    this.activeStreams = new Map();
    // 录制任务
    this.recordingTasks = new Map();
  }

  // 获取摄像头视频流
  async getCameraStream(cameraId, userId) {
    try {
      // 查找摄像头
      const camera = await Camera.findOne({
        cameraId: cameraId,
        'accessPermissions.userId': userId,
        status: 'online'
      });

      if (!camera) {
        throw new Error('摄像头不存在或无法访问');
      }

      // 如果是RTSP流，需要转码为前端可播放的格式
      if (camera.rtspUrl) {
        return this._createStreamFromRTSP(camera.rtspUrl, cameraId);
      }

      // 如果是直接可访问的流地址
      return camera.streamUrl;
    } catch (error) {
      console.error('获取摄像头流失败:', error);
      throw error;
    }
  }

  // 从RTSP流创建可播放的流
  _createStreamFromRTSP(rtspUrl, cameraId) {
    try {
      // 检查是否已有相同摄像头的流
      if (this.activeStreams.has(cameraId)) {
        return this.activeStreams.get(cameraId).streamUrl;
      }

      // 创建唯一的流ID
      const streamId = `stream_${Date.now()}_${cameraId}`;
      // 构建输出流URL
      const streamUrl = `http://localhost:5000/api/video/streams/${streamId}/index.m3u8`;
      
      // 创建存储目录
      const streamDir = path.join(__dirname, '../../resources/streams', streamId);
      if (!fs.existsSync(streamDir)) {
        fs.mkdirSync(streamDir, { recursive: true });
      }

      // 使用FFmpeg将RTSP流转码为HLS
      const ffmpegProcess = spawn('ffmpeg', [
        '-rtsp_transport', 'tcp',
        '-i', rtspUrl,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-c:a', 'aac',
        '-f', 'hls',
        '-hls_time', '2',
        '-hls_list_size', '3',
        '-hls_flags', 'delete_segments',
        path.join(streamDir, 'index.m3u8')
      ]);

      // 存储流信息
      const streamInfo = {
        streamUrl,
        ffmpegProcess,
        startTime: Date.now(),
        lastAccessTime: Date.now()
      };

      this.activeStreams.set(cameraId, streamInfo);

      // 监听FFmpeg进程退出
      ffmpegProcess.on('exit', (code, signal) => {
        console.log(`FFmpeg进程退出，代码: ${code}, 信号: ${signal}`);
        this._cleanupStream(cameraId);
      });

      return streamUrl;
    } catch (error) {
      console.error('创建RTSP流失败:', error);
      throw error;
    }
  }

  // 清理流资源
  _cleanupStream(cameraId) {
    if (this.activeStreams.has(cameraId)) {
      const streamInfo = this.activeStreams.get(cameraId);
      
      // 终止FFmpeg进程
      if (streamInfo.ffmpegProcess && !streamInfo.ffmpegProcess.killed) {
        streamInfo.ffmpegProcess.kill();
      }

      // 删除流文件
      const streamId = streamInfo.streamUrl.split('/').slice(-2)[0];
      const streamDir = path.join(__dirname, '../../resources/streams', streamId);
      if (fs.existsSync(streamDir)) {
        fs.rmSync(streamDir, { recursive: true, force: true });
      }

      // 从活动流中移除
      this.activeStreams.delete(cameraId);
    }
  }

  // 更新机器人状态
  async updateRobotStatus(robotId, status) {
    try {
      const robot = await Robot.findOneAndUpdate(
        { robotId },
        {
          status,
          [status === 'online' ? 'lastOnlineTime' : 'lastOfflineTime']: Date.now()
        },
        { new: true }
      );

      return robot;
    } catch (error) {
      console.error('更新机器人状态失败:', error);
      throw error;
    }
  }

  // 更新摄像头状态
  async updateCameraStatus(cameraId, status) {
    try {
      const camera = await Camera.findOneAndUpdate(
        { cameraId },
        {
          status,
          [status === 'online' ? 'lastOnlineTime' : '']: status === 'online' ? Date.now() : undefined
        },
        { new: true }
      );

      return camera;
    } catch (error) {
      console.error('更新摄像头状态失败:', error);
      throw error;
    }
  }

  // 控制摄像头云台
  async controlCameraPTZ(cameraId, pan, tilt, zoom, userId) {
    try {
      // 检查摄像头是否存在且用户有权限控制
      const camera = await Camera.findOne({
        cameraId,
        'accessPermissions': {
          $elemMatch: {
            userId,
            permissionLevel: { $in: ['control', 'admin'] }
          }
        },
        ptzEnabled: true,
        status: 'online'
      });

      if (!camera) {
        throw new Error('摄像头不存在、不支持云台控制或用户无权限');
      }

      // 更新数据库中的云台位置
      const updatedCamera = await Camera.findOneAndUpdate(
        { cameraId },
        {
          'ptzPosition.pan': pan,
          'ptzPosition.tilt': tilt,
          'ptzPosition.zoom': zoom
        },
        { new: true }
      );

      // 这里应该有实际控制摄像头云台的代码
      // 例如通过HTTP请求或WebSocket发送控制命令到摄像头设备

      return updatedCamera;
    } catch (error) {
      console.error('控制摄像头云台失败:', error);
      throw error;
    }
  }

  // 开始录制视频
  async startRecording(cameraId, userId) {
    try {
      // 检查摄像头是否存在且用户有权限
      const camera = await Camera.findOne({
        cameraId,
        'accessPermissions': {
          $elemMatch: {
            userId,
            permissionLevel: { $in: ['control', 'admin'] }
          }
        },
        status: 'online'
      });

      if (!camera) {
        throw new Error('摄像头不存在或用户无权限');
      }

      // 检查是否已有录制任务
      if (this.recordingTasks.has(cameraId)) {
        throw new Error('该摄像头已经在录制中');
      }

      // 创建录制目录
      const recordingDir = path.join(__dirname, '../../resources/recordings', userId.toString());
      if (!fs.existsSync(recordingDir)) {
        fs.mkdirSync(recordingDir, { recursive: true });
      }

      // 创建录制文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const recordingFileName = `${cameraId}_${timestamp}.mp4`;
      const recordingFilePath = path.join(recordingDir, recordingFileName);

      // 使用FFmpeg开始录制
      let inputUrl = camera.streamUrl;
      if (camera.rtspUrl) {
        inputUrl = camera.rtspUrl;
      }

      const ffmpegProcess = spawn('ffmpeg', [
        '-rtsp_transport', 'tcp',
        '-i', inputUrl,
        '-c:v', 'copy',
        '-c:a', 'copy',
        recordingFilePath
      ]);

      // 存储录制任务信息
      const recordingInfo = {
        cameraId,
        userId,
        filePath: recordingFilePath,
        fileName: recordingFileName,
        startTime: Date.now(),
        ffmpegProcess
      };

      this.recordingTasks.set(cameraId, recordingInfo);

      // 监听FFmpeg进程退出
      ffmpegProcess.on('exit', (code, signal) => {
        console.log(`录制进程退出，代码: ${code}, 信号: ${signal}`);
        this.recordingTasks.delete(cameraId);
      });

      return {
        success: true,
        message: '录制已开始',
        recordingId: cameraId,
        startTime: recordingInfo.startTime
      };
    } catch (error) {
      console.error('开始录制失败:', error);
      throw error;
    }
  }

  // 停止录制视频
  async stopRecording(cameraId, userId) {
    try {
      // 检查录制任务是否存在
      if (!this.recordingTasks.has(cameraId)) {
        throw new Error('没有找到该摄像头的录制任务');
      }

      const recordingInfo = this.recordingTasks.get(cameraId);

      // 检查用户是否有权限停止录制
      if (recordingInfo.userId.toString() !== userId.toString()) {
        throw new Error('用户无权限停止该录制任务');
      }

      // 终止FFmpeg进程
      if (recordingInfo.ffmpegProcess && !recordingInfo.ffmpegProcess.killed) {
        recordingInfo.ffmpegProcess.kill('SIGINT');
      }

      // 计算录制时长
      const duration = Date.now() - recordingInfo.startTime;

      // 从录制任务中移除
      this.recordingTasks.delete(cameraId);

      return {
        success: true,
        message: '录制已停止',
        fileName: recordingInfo.fileName,
        filePath: recordingInfo.filePath,
        duration: duration,
        fileSize: fs.statSync(recordingInfo.filePath).size
      };
    } catch (error) {
      console.error('停止录制失败:', error);
      throw error;
    }
  }

  // 获取机器人列表
  async getRobots(filters = {}) {
    try {
      const robots = await Robot.find(filters);
      return robots;
    } catch (error) {
      console.error('获取机器人列表失败:', error);
      throw error;
    }
  }

  // 获取摄像头列表
  async getCameras(filters = {}) {
    try {
      const cameras = await Camera.find(filters);
      return cameras;
    } catch (error) {
      console.error('获取摄像头列表失败:', error);
      throw error;
    }
  }

  // 获取用户可访问的摄像头
  async getUserAccessibleCameras(userId) {
    try {
      const cameras = await Camera.find({
        'accessPermissions.userId': userId,
        status: 'online'
      });
      return cameras;
    } catch (error) {
      console.error('获取用户可访问的摄像头失败:', error);
      throw error;
    }
  }

  // 清理过期的流资源（定期调用）
  cleanupExpiredStreams() {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30分钟超时

    for (const [cameraId, streamInfo] of this.activeStreams.entries()) {
      if (now - streamInfo.lastAccessTime > timeout) {
        console.log(`清理过期的流资源: ${cameraId}`);
        this._cleanupStream(cameraId);
      }
    }
  }
}

// 创建单例实例
const videoStreamService = new VideoStreamService();

// 定期清理过期流资源（每10分钟）
setInterval(() => {
  videoStreamService.cleanupExpiredStreams();
}, 10 * 60 * 1000);

export default videoStreamService;