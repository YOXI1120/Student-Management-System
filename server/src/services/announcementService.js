/**
 * 公告管理服务层
 */

import pool from '../config/database.js';
import * as logger from '../logger/index.js';

/**
 * 获取公告列表
 */
export async function getAnnouncements() {
  const result = await pool.query(
    `SELECT a.*, u.username as publisher_name
     FROM announcements a
     LEFT JOIN users u ON a.publisher_id = u.id
     WHERE a.is_published = true
     ORDER BY a.published_at DESC NULLS LAST`
  );
  return result.rows;
}

/**
 * 获取最新公告（首页用）
 */
export async function getLatestAnnouncements() {
  const result = await pool.query(
    `SELECT a.title, a.content, a.published_at, u.username as publisher_name
     FROM announcements a
     LEFT JOIN users u ON a.publisher_id = u.id
     WHERE a.is_published = true
     ORDER BY a.published_at DESC
     LIMIT 5`
  );
  return result.rows;
}

/**
 * 发布公告
 */
export async function createAnnouncement(data, userId) {
  const { title, content } = data;

  const result = await pool.query(
    `INSERT INTO announcements (title, content, publisher_id, is_published, published_at)
     VALUES ($1, $2, $3, true, NOW())
     RETURNING *`,
    [title, content, userId]
  );

  logger.info(`发布公告: ${title}`);
  return result.rows[0];
}

/**
 * 编辑公告
 */
export async function updateAnnouncement(id, data) {
  const { title, content } = data;

  const result = await pool.query(
    `UPDATE announcements
     SET title = COALESCE($1, title),
         content = COALESCE($2, content),
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [title || null, content || null, id]
  );

  if (result.rows.length === 0) {
    return { _error: '公告不存在', _status: 404 };
  }

  logger.info(`编辑公告: ${result.rows[0].title}`);
  return result.rows[0];
}

/**
 * 删除公告
 */
export async function deleteAnnouncement(id) {
  const result = await pool.query('DELETE FROM announcements WHERE id = $1 RETURNING title', [id]);

  if (result.rows.length === 0) {
    return { _error: '公告不存在', _status: 404 };
  }

  logger.info(`删除公告: ${result.rows[0].title}`);
  return { deleted: true };
}
