/**
 * 成绩管理控制器（薄层）
 */

import * as scoreService from '../services/scoreService.js';
import Response from '../utils/response.js';

export async function getScores(req, res) {
  try {
    const result = await scoreService.getScores(req.query);
    return res.json(Response.success(result));
  } catch (err) {
    console.error('查询成绩出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function batchSaveScores(req, res) {
  try {
    const { scores } = req.body;
    if (!Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json(Response.badRequest('请提供成绩数据'));
    }

    // 教师身份校验：只能录自己所教课程的成绩
    if (req.user.role === 'teacher') {
      const scIds = [...new Set(scores.map(s => s.student_course_id).filter(Boolean))];
      const verify = await scoreService.verifyTeacherScores(req.user.id, scIds);
      if (verify._error) return res.status(verify._status).json(Response.error(verify._status, verify._error));
    }

    const result = await scoreService.batchSaveScores(scores);
    return res.json(Response.success({ savedCount: result.savedCount }, `成功保存 ${result.savedCount} 条成绩`));
  } catch (err) {
    console.error('批量录入成绩出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function getStudentScores(req, res) {
  try {
    const result = await scoreService.getStudentScores(req.params.id);
    return res.json(Response.success(result));
  } catch (err) {
    console.error('查询学生成绩出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function getScoreStatistics(req, res) {
  try {
    const { course_schedule_id } = req.query;
    if (!course_schedule_id) {
      return res.status(400).json(Response.badRequest('请指定课程'));
    }
    const result = await scoreService.getScoreStatistics(course_schedule_id);
    return res.json(Response.success(result));
  } catch (err) {
    console.error('成绩统计出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}
