/**
 * 公告管理控制器（薄层）
 */

import * as announcementService from '../services/announcementService.js';
import Response from '../utils/response.js';

export async function getAnnouncements(req, res) {
  try {
    const result = await announcementService.getAnnouncements();
    return res.json(Response.success(result));
  } catch (err) {
    console.error('查询公告列表出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function getLatestAnnouncements(req, res) {
  try {
    const result = await announcementService.getLatestAnnouncements();
    return res.json(Response.success(result));
  } catch (err) {
    console.error('查询最新公告出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function createAnnouncement(req, res) {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json(Response.badRequest('标题和内容不能为空'));
    }
    const result = await announcementService.createAnnouncement(req.body, req.user.id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.status(201).json(Response.created(result, '公告发布成功'));
  } catch (err) {
    console.error('发布公告出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function updateAnnouncement(req, res) {
  try {
    const result = await announcementService.updateAnnouncement(req.params.id, req.body);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(result, '修改成功'));
  } catch (err) {
    console.error('编辑公告出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}

export async function deleteAnnouncement(req, res) {
  try {
    const result = await announcementService.deleteAnnouncement(req.params.id);
    if (result._error) return res.status(result._status).json(Response.error(result._status, result._error));
    return res.json(Response.success(null, '删除成功'));
  } catch (err) {
    console.error('删除公告出错:', err.message);
    return res.status(500).json(Response.error(500, '服务器内部错误'));
  }
}
