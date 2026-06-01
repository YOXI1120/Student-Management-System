# 🎓 学生管理系统（大学版）

<p align="center">
  <img alt="Vue 3" src="https://img.shields.io/badge/Vue_3-4FC08D?logo=vue.js&logoColor=white" />
  <img alt="Element Plus" src="https://img.shields.io/badge/Element_Plus-409EFF?logo=element&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-000000?logo=express&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" />
  <img alt="JWT" src="https://img.shields.io/badge/JWT_Auth-000000?logo=jsonwebtokens&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow" />
</p>

基于 **Vue 3 + Element Plus + Pinia**（前端）和 **Express + pg**（后端）构建，使用 **Supabase (PostgreSQL)** 作为数据库的**大学学生管理系统**。实现学院、班级、学生、课程、选课、成绩的信息化管理，支持**多角色权限控制**及**数据导入导出**。

---

## 📋 目录

- [功能模块](#-功能模块)
- [角色权限](#-角色权限)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [默认账号](#-默认账号)
- [API 概览](#-api-概览)
- [后端架构设计](#-后端架构设计)
- [数据库配置](#-数据库配置)
- [常见问题](#-常见问题)

---

## 🏗️ 功能模块

| 模块 | 功能 |
| --- | --- |
| 🏫 **学院管理** | 学院信息增删改查 |
| 👥 **班级管理** | 班级信息增删改查，查看班级学生列表 |
| 👨‍🎓 **学生管理** | 学生信息增删改查，学籍状态变更（休学/复学/退学/毕业），变更记录审计 |
| 👩‍🏫 **教师管理** | 教师信息增删改查 |
| 📚 **课程管理** | 课程信息增删改查，必修/选修分类 |
| 📅 **排课管理** | 排课增删（含时间冲突检测），必修课自动分配，开课学院筛选 |
| ✅ **选课管理** | 必修课自动分配，学生自主选修选修课（含冲突检测） |
| 📊 **成绩管理** | 成绩查询、批量录入、统计（平均分/最高分/最低分/及格率/分数段分布） |
| 📤 **数据导出** | 学生名单导出（Excel）、成绩单导出（Excel） |
| 📰 **公告管理** | 管理员发布/编辑/删除公告，教师只读查看 |
| 🔐 **系统管理** | 用户管理（创建/修改/删除账号），个人中心修改密码 |

---

## 👤 角色权限

| 角色 | 权限范围 |
| --- | --- |
| **管理员** (admin) | 所有功能的完全访问权限，系统配置管理 |
| **教师** (teacher) | 查看数据、录入/修改自己所教课程的成绩、导出数据。**班主任**额外拥有本班学生编辑和学籍变更权限 |
| **学生** (student) | 查看个人信息、选课（选修课）、查看本人成绩、查看课表 |

> 默认密码：非管理员用户初始密码均为 `123456`

详细权限说明见 [教师权限说明.md](教师权限说明.md)

---

## ⚙️ 技术栈

| 层次 | 技术 | 说明 |
| --- | --- | --- |
| 前端框架 | Vue 3 (Composition API) | SFC + `<script setup>` |
| UI 组件库 | Element Plus | 表格、表单、菜单、对话框等 |
| 状态管理 | Pinia | 用户状态管理 |
| 路由 | Vue Router 4 | 路由守卫 + 角色权限控制 |
| HTTP 请求 | Axios | 请求/响应拦截器，自动携带 JWT |
| 构建工具 | Vite | 开发服务器 + 生产构建 |
| 后端框架 | Express | RESTful API |
| 认证 | JWT (jsonwebtoken) | Token 认证 |
| 密码加密 | bcryptjs | 密码哈希存储 |
| 数据库 | PostgreSQL (Supabase) | 关系型数据库 |
| 数据库驱动 | pg (node-postgres) | 原生 SQL 连接池 |
| 导出 | ExcelJS | Excel 文件生成 |
| 开发工具 | Nodemon | 后端热重载开发 |

---

## 📁 项目结构

```
student-management-system/
├── client/                              # 前端（Vue 3）
│   └── src/
│       ├── api/modules/                  # API 接口封装（按模块）
│       ├── components/
│       │   └── Layout.vue                # 主布局（侧边栏 + 顶部导航）
│       ├── router/
│       │   └── index.js                  # 路由配置 + 路由守卫
│       ├── store/
│       │   └── user.js                   # 用户状态（Pinia）
│       └── views/
│           ├── dashboard/                # 首页仪表盘
│           ├── colleges/                 # 学院管理
│           ├── classes/                  # 班级管理
│           ├── students/                 # 学生管理
│           ├── teachers/                 # 教师管理
│           ├── course-manage/            # 课程管理 + 排课管理
│           ├── elective/                 # 选修课选课
│           ├── my-courses/               # 我的选课
│           ├── score-manage/             # 成绩查询 + 录入 + 统计
│           ├── announcements/            # 公告管理
│           └── system/                   # 用户管理 + 个人中心
│
├── server/                              # 后端（Express）
│   └── src/
│       ├── config/
│       │   └── database.js               # 数据库连接池（pg）
│       ├── middleware/
│       │   └── auth.js                   # JWT 认证 + 角色授权中间件
│       ├── services/                     # 业务逻辑层
│       │   ├── authService.js            # 认证服务
│       │   ├── userService.js            # 用户管理
│       │   ├── collegeService.js         # 学院管理
│       │   ├── classService.js           # 班级管理
│       │   ├── studentService.js         # 学生管理
│       │   ├── teacherService.js         # 教师管理
│       │   ├── courseService.js          # 课程管理
│       │   ├── scheduleService.js        # 排课管理
│       │   ├── scoreService.js           # 成绩管理
│       │   ├── studentCourseService.js   # 选课管理
│       │   ├── announcementService.js    # 公告管理
│       │   └── exportService.js          # 数据导出
│       ├── controllers/                  # HTTP 控制器（薄层）
│       ├── routes/                       # 路由定义
│       ├── utils/                        # 工具类
│       ├── initDb.js                     # 数据库初始化
│       ├── seed.js                       # 种子数据生成
│       └── index.js                      # 应用入口
│
├── init.sql                              # 数据库建表脚本
├── 教师权限说明.md                        # 教师角色权限文档
└── README.md
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18

### 1. 克隆项目

```bash
git clone https://github.com/YOXI1120/Student-Management-System.git
cd 学生管理系统
```

> ⚠️ 注意：仓库已迁移至 `Student-Management-System`，若之前从旧地址 clone，请更新远程地址：
> ```bash
> git remote set-url origin https://github.com/YOXI1120/Student-Management-System.git
> ```

### 2. 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 3. 配置数据库

项目默认连接已配置的 Supabase PostgreSQL 数据库，`.env` 文件已包含连接信息。如需使用自己的数据库，请修改 `server/.env`：

```env
# 服务端口
PORT=3000

# PostgreSQL 连接配置
DB_HOST=你的数据库主机
DB_PORT=5432
DB_NAME=你的数据库名
DB_USER=你的数据库用户
DB_PASSWORD=你的数据库密码

# JWT 配置
JWT_SECRET=你的密钥
JWT_EXPIRES_IN=24h
```

然后运行数据库初始化脚本：

```bash
cd server
# 方法1：通过 SQL 脚本初始化（推荐）
psql -h <主机> -U <用户> -d <数据库名> -f ../init.sql

# 方法2：通过应用初始化（自动建表）
node src/initDb.js
```

### 4. 初始化种子数据（可选）

插入测试数据（10个学院、50+教师、60+班级、200名学生、课程、排课、成绩）：

```bash
cd server
npm run dev:seed
```

种子数据包含：

- 管理员账号 `admin` / `admin123`
- 教师账号（如 `T000001`），默认密码 `123456`
- 学生账号（如 `20240001`），默认密码 `123456`

### 5. 启动项目

```bash
# 终端1：启动后端（端口 3000）
cd server
npm run dev

# 终端2：启动前端（端口 5173）
cd client
npm run dev
```

生产环境启动后端：

```bash
cd server
npm start
```

### 6. 访问

打开浏览器访问 **http://localhost:5173**

---

## 🔑 默认账号

| 角色 | 用户名 | 密码 | 说明 |
| --- | --- | --- | --- |
| 管理员 | `admin` | `admin123` | 全部权限 |
| 教师 | `T000001` ~ `T0000XX` | `123456` | 查看、录入成绩、导出 |
| 学生 | `20240001` ~ `20240200` | `123456` | 查看成绩、选修课选课 |

> 教师和学生的初始密码均为 `123456`，建议登录后修改。
> 教师编号和学号由种子数据自动生成，具体可查看运行 `seed.js` 后的控制台输出。

---

## 📡 API 概览

| 模块 | 接口 |
| --- | --- |
| **认证** | `POST /api/auth/login` · `GET /api/auth/profile` · `PUT /api/auth/password` |
| **学院** | `GET/POST /api/colleges` · `GET/PUT/DELETE /api/colleges/:id` |
| **学生** | `GET/POST /api/students` · `GET/PUT/DELETE /api/students/:id` |
| **教师** | `GET/POST /api/teachers` · `GET/PUT/DELETE /api/teachers/:id` |
| **班级** | `GET/POST /api/classes` · `GET/PUT/DELETE /api/classes/:id` |
| **课程** | `GET/POST /api/courses` · `PUT/DELETE /api/courses/:id` |
| **排课** | `GET/POST /api/schedules` · `DELETE /api/schedules/:id` · `GET /api/schedules/by-class/:id` |
| **选课** | `GET /api/student-courses` · `POST /api/student-courses/select` · `POST /api/student-courses/auto-assign` |
| **成绩** | `GET /api/scores` · `POST /api/scores/batch` · `GET /api/scores/statistics` |
| **导出** | `POST /api/export/students` · `POST /api/export/scores` |
| **公告** | `GET /api/announcements` · `POST/PUT/DELETE /api/announcements/:id` |
| **用户** | `GET/POST /api/users` · `PUT/DELETE /api/users/:id` |

---

## 🧩 后端架构设计

项目采用 **Controller → Service** 双层架构：

```
routes/  →  controllers/  →  services/  →  database
  (路由)      (HTTP 薄层)     (业务逻辑)     (pg 连接池)
```

- **routes**：定义 URL 路径和中间件（认证、角色授权）
- **controllers**：解析请求参数、校验必填字段、调用 service、返回响应（**不包含业务逻辑**）
- **services**：所有 SQL 查询、业务规则校验、权限判定（**不关心 HTTP 细节**）
- 共识约定：service 返回 `{ _error, _status }` 表示业务校验失败，controller 据此转为 HTTP 错误响应

### 认证与授权流程

1. 用户登录 → 后端验证身份 → 返回 JWT Token
2. 前端将 Token 存储在 localStorage，Axios 拦截器自动附加到请求头
3. 后端 `auth.js` 中间件解析 Token → 验证有效性 → 挂载用户信息到 `req.user`
4. 角色中间件检查 `req.user.role` → 授权通过则继续，否则返回 403

---

## 🗄️ 数据库配置

### 使用 Supabase（默认）

项目默认连接 Supabase 托管的 PostgreSQL 数据库，连接信息在 `server/.env` 中已预配置。

### 使用本地 PostgreSQL

若需使用本地数据库，修改 `.env` 中的连接参数后：

1. 执行 `init.sql` 创建表结构
2. （可选）运行 `npm run dev:seed` 插入测试数据
3. 启动后端即可自动连接

### 数据库表结构

核心表包括：`users`（用户）、`colleges`（学院）、`classes`（班级）、`students`（学生）、`teachers`（教师）、`courses`（课程）、`schedules`（排课）、`student_courses`（选课）、`scores`（成绩）、`announcements`（公告），详情见 `init.sql`。

---

## ❓ 常见问题

### 1. 启动后端报数据库连接错误

检查 `server/.env` 中的数据库配置是否正确，确保 PostgreSQL 服务在运行中。

### 2. 前端请求后端报跨域错误

后端已配置 CORS 中间件，默认允许前端开发服务器地址（`http://localhost:5173`）。若端口变更，需修改 `server/src/index.js` 中的 CORS 配置。

### 3. 种子数据运行失败

确保已先执行 `init.sql` 建表，或运行 `node src/initDb.js` 初始化表结构后再运行 seed。

### 4. JWT 过期

默认 Token 有效期为 24 小时，过期后需重新登录。可在 `.env` 中修改 `JWT_EXPIRES_IN`。

---

## 📄 许可证

MIT
