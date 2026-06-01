# 🎓 学生管理系统


基于 **Vue 3 + Element Plus + Pinia**（前端）和 **Express + pg**（后端）构建的大学学生管理系统，支持多角色权限控制及数据导入导出。

---

## 技术栈

| 层次 | 技术 |
| --- | --- |
| 前端框架 | Vue 3 (Composition API + `<script setup>`) |
| UI 组件库 | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router 4（路由守卫 + 角色权限控制） |
| HTTP 请求 | Axios |
| 构建工具 | Vite |
| 后端框架 | Express |
| 认证 | JWT (jsonwebtoken) + bcryptjs |
| 数据库 | PostgreSQL (pg 驱动) |
| 数据导出 | ExcelJS |

## 功能

- 🏫 **学院管理** — 学院信息增删改查
- 👥 **班级管理** — 班级信息管理，查看班级学生列表
- 👨‍🎓 **学生管理** — 学生信息管理，学籍状态变更（休学/复学/退学/毕业），变更记录审计
- 👩‍🏫 **教师管理** — 教师信息增删改查
- 📚 **课程管理** — 课程信息管理，必修/选修分类
- 📅 **排课管理** — 排课增删（含时间冲突检测），必修课自动分配
- ✅ **选课管理** — 必修课自动分配，学生自主选课（含冲突检测）
- 📊 **成绩管理** — 成绩查询、批量录入、统计（平均分/最高分/最低分/及格率/分数段）
- 📤 **数据导出** — 学生名单导出、成绩单导出（Excel）
- 📰 **公告管理** — 公告发布、编辑、删除
- 🔐 **系统管理** — 用户管理、个人中心、密码修改

**角色权限：** 管理员（全部权限）、教师（数据查看/成绩录入/导出）、学生（个人信息/选课/成绩查询）

## 环境要求

- Node.js >= 18
- PostgreSQL 数据库（可直接使用 Supabase 或本地部署）

## 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/YOXI1120/Student-Management-System.git
cd 学生管理系统

# 2. 安装依赖
cd server && npm install
cd ../client && npm install

# 3. 配置数据库
# 编辑 server/.env，填入你的数据库连接信息
# 然后执行数据库初始化：
node src/initDb.js

# 4. 初始化种子数据（可选，插入测试数据）
npm run dev:seed

# 5. 启动
# 终端1：后端（端口 3000）
npm run dev

# 终端2：前端（端口 5173）
cd ../client
npm run dev
```

打开浏览器访问 **http://localhost:5173**

### 默认账号

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | `admin` | `admin123` |
| 教师 | `T000001` ~ `T0000XX` | `123456` |
| 学生 | `20240001` ~ `20240200` | `123456` |

## 项目结构

```
├── client/                         # 前端（Vue 3 + Vite）
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── api/
│       │   ├── request.js          # Axios 实例 + 拦截器
│       │   └── modules/            # 按模块拆分的 API 接口
│       ├── components/
│       │   └── Layout.vue          # 主布局（侧边栏 + 顶部导航）
│       ├── router/
│       │   └── index.js            # 路由配置 + 路由守卫
│       ├── store/
│       │   └── user.js             # 用户状态（Pinia）
│       ├── views/
│       │   ├── login/              # 登录
│       │   ├── dashboard/          # 首页仪表盘
│       │   ├── colleges/           # 学院管理
│       │   ├── classes/            # 班级管理
│       │   ├── students/           # 学生管理
│       │   ├── teachers/           # 教师管理
│       │   ├── course-manage/      # 课程管理 + 排课
│       │   ├── elective/           # 选修课选课
│       │   ├── my-courses/         # 我的选课
│       │   ├── score-manage/       # 成绩查询 + 录入 + 统计
│       │   ├── announcements/      # 公告管理
│       │   └── system/             # 用户管理 + 个人中心
│       ├── App.vue
│       └── main.js
├── server/                         # 后端（Express）
│   ├── .env                        # 环境变量配置
│   ├── package.json
│   └── src/
│       ├── index.js                # 应用入口
│       ├── initDb.js               # 数据库初始化
│       ├── seed.js                 # 种子数据生成
│       ├── config/
│       │   └── database.js         # 数据库连接池（pg）
│       ├── middleware/
│       │   └── auth.js             # JWT 认证 + 角色授权中间件
│       ├── routes/                 # 路由定义
│       ├── controllers/            # HTTP 控制器（薄层）
│       ├── services/               # 业务逻辑层
│       ├── utils/                  # 工具类
│       │   ├── response.js         # 统一响应格式
│       │   └── studentNo.js        # 学号生成器
│       └── logger/                 # 日志模块
├── init.sql                        # 数据库建表脚本
└── README.md
```

## 常见问题

**1. 启动后端报数据库连接错误**
检查 `server/.env` 中的数据库配置是否正确，确保 PostgreSQL 服务在运行中。

**2. 前端请求后端报跨域错误**
后端已配置 CORS，默认允许 `http://localhost:5173`，若端口变更请修改 `server/src/index.js` 中的 CORS 配置。

**3. 种子数据运行失败**
确保已先执行 `init.sql` 建表或运行 `node src/initDb.js` 后再执行 seed。

**4. JWT 过期**
默认 Token 有效期 24 小时，可在 `.env` 中修改 `JWT_EXPIRES_IN`。

---

## 许可证

MIT