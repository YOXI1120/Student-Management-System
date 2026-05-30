/**
 * 数据库连接配置
 * 使用 pg 连接池连接到 Supabase PostgreSQL
 */

// pg 是 CommonJS 包，需要通过默认导入方式使用
import pkg from 'pg';
const { Pool } = pkg;

// 加载 .env 环境变量（ESM 方式）
import 'dotenv/config';

// 创建连接池实例，所有配置来自 .env 文件
const pool = new Pool({
  host: process.env.DB_HOST,          // 数据库主机地址
  port: parseInt(process.env.DB_PORT), // 数据库端口（Supabase 是 6543）
  database: process.env.DB_NAME,       // 数据库名称
  user: process.env.DB_USER,           // 数据库用户名
  password: process.env.DB_PASSWORD,   // 数据库密码
  ssl: { rejectUnauthorized: false },  // Supabase 需要 SSL 连接
  max: 20,                             // 连接池最大连接数
  idleTimeoutMillis: 30000,            // 空闲连接超时时间（毫秒）
  connectionTimeoutMillis: 10000,      // 连接超时时间（毫秒）
});

// 监听连接池错误事件
pool.on('error', (err) => {
  console.error('数据库连接池异常:', err);
});

// 启动时测试数据库连接
pool.query('SELECT NOW()')
  .then(() => console.log('✓ 数据库连接成功'))
  .catch(err => console.error('✗ 数据库连接失败:', err.message));

export default pool;
