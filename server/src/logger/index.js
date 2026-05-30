/**
 * 日志模块
 *
 * 分级日志输出：
 *   - INFO  → 写入日志文件，终端不显示（静默）
 *   - WARN  → 写入日志文件 + 终端黄色显示
 *   - ERROR → 写入日志文件 + 终端红色显示
 *   - HTTP  → 写入专属 HTTP 日志文件 + 终端精简显示
 *
 * 日志文件按日期切割，存放在 server/logs/ 目录
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.resolve(__dirname, '../../logs');

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/** 获取当前日期字符串 */
function today() {
  return new Date().toISOString().slice(0, 10);
}

/** 获取当前时间戳字符串 */
function timestamp() {
  return new Date().toLocaleString('zh-CN', { hour12: false });
}

/**
 * 写入日志文件
 */
function writeLog(filename, level, message, data = null) {
  const filePath = path.join(LOG_DIR, filename);
  const time = timestamp();
  const line = data
    ? `[${time}] [${level}] ${message} ${JSON.stringify(data)}\n`
    : `[${time}] [${level}] ${message}\n`;
  fs.appendFileSync(filePath, line, 'utf-8');
}

/**
 * 彩色终端输出
 */
function colorize(text, color) {
  const colors = {
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    dim: '\x1b[2m',
    reset: '\x1b[0m',
  };
  const c = colors[color] || colors.reset;
  return `${c}${text}${colors.reset}`;
}

// ==================== 公开 API ====================

/**
 * 普通信息日志
 * 仅写入文件，终端不显示（静默）
 */
export function info(message, data = null) {
  writeLog(`app-${today()}.log`, 'INFO', message, data);
}

/**
 * 警告日志
 * 写入文件 + 终端黄色显示
 */
export function warn(message, data = null) {
  writeLog(`app-${today()}.log`, 'WARN', message, data);
  console.warn(colorize(`[WARN] ${message}`, 'yellow'), data || '');
}

/**
 * 错误日志
 * 写入文件（同时写入专门的 error 文件）+ 终端红色显示
 */
export function error(message, err = null) {
  const errMsg = err ? `${message} ${err.message || err}` : message;
  writeLog(`app-${today()}.log`, 'ERROR', errMsg);
  writeLog(`error-${today()}.log`, 'ERROR', errMsg, err?.stack || null);
  console.error(colorize(`[ERROR] ${errMsg}`, 'red'));
}

/**
 * HTTP 请求日志
 * 写入专用文件 + 终端精简一行
 */
const requestCounts = {};
let lastHttpLog = Date.now();

export function http(method, url, status, duration) {
  const short = `${method} ${url.split('?')[0]}`;
  const line = `${status} ${short} ${duration}ms`;

  writeLog(`http-${today()}.log`, 'HTTP', `${method} ${url} → ${status} (${duration}ms)`);

  // 终端：每 5 秒聚合一次，避免刷屏
  const now = Date.now();
  if (now - lastHttpLog > 5000) {
    console.log(colorize(line, 'dim'));
    lastHttpLog = now;
  }
}

/**
 * 启动/关键信息（始终显示在终端）
 */
export function startup(message) {
  console.log(colorize(message, 'cyan'));
}
