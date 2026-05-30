# 学生管理系统（大学版）

基于 **Vue 3 + Element Plus + Pinia**（前端）和 **Node.js Express + pg**（后端）构建的大学学生管理系统，使用 **Supabase (PostgreSQL)** 作为数据库，实现学院、班级、学生、课程、选课、成绩的信息化管理，支持多角色权限控制及数据导入导出。

---

## 功能模块

| 模块            | 功能                                                                |
| --------------- | ------------------------------------------------------------------- |
| 🏫 **学院管理** | 学院信息增删改查                                                    |
| 👥 **班级管理** | 班级信息增删改查，查看班级学生列表                                  |
| 👨‍🎓 **学生管理** | 学生信息增删改查，学籍状态变更（休学/复学/退学/毕业），变更记录审计 |
| 👩‍🏫 **教师管理** | 教师信息增删改查                                                    |
| 📚 **课程管理** | 课程信息增删改查，必修/选修分类                                     |
| 📅 **排课管理** | 排课增删（含时间冲突检测），必修课自动分配，开课学院筛选            |
| ✅ **选课管理** | 必修课自动分配，学生自主选修选修课（含冲突检测）                    |
| 📊 **成绩管理** | 成绩查询、批量录入、统计（平均分/最高分/最低分/及格率/分数段分布）  |
| 📤 **数据导出** | 学生名单导出（Excel）、成绩单导出（Excel）                          |
| 📰 **公告管理** | 管理员发布/编辑/删除公告，教师只读查看                              |
| 🔐 **系统管理** | 用户管理（创建/修改/删除账号），个人中心修改密码                    |

---

## 角色权限

| 角色               | 权限范围                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------- |
| **管理员** (admin) | 所有功能的完全访问权限，系统配置管理                                                          |
| **教师** (teacher) | 查看数据、录入/修改自己所教课程的成绩、导出数据。**班主任**额外拥有本班学生编辑和学籍变更权限 |
| **学生** (student) | 查看个人信息、选课（选修课）、查看本人成绩、查看课表                                          |

> 默认密码：非管理员用户初始密码均为 `123456`

详细权限说明见 [教师权限说明.md](教师权限说明.md)

---

## 技术栈

| 层次       | 技术                    | 说明                          |
| ---------- | ----------------------- | ----------------------------- |
| 前端框架   | Vue 3 (Composition API) | SFC + `<script setup>`        |
| UI 组件库  | Element Plus            | 表格、表单、菜单、对话框等    |
| 状态管理   | Pinia                   | 用户状态管理                  |
| 路由       | Vue Router 4            | 路由守卫 + 角色权限控制       |
| HTTP 请求  | Axios                   | 请求/响应拦截器，自动携带 JWT |
| 后端框架   | Express                 | RESTful API                   |
| 认证       | JWT (jsonwebtoken)      | Token 认证                    |
| 密码加密   | bcryptjs                | 密码哈希存储                  |
| 数据库     | PostgreSQL (Supabase)   | 关系型数据库                  |
| 数据库驱动 | pg (node-postgres)      | 原生 SQL 连接池               |
| 导出       | ExcelJS                 | Excel 文件生成                |

---

## 项目结构

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
│           ├── course-manage/            # 课程管理 + 排课管理
│           ├── score-manage/             # 成绩查询 + 录入 + 统计
│           ├── dashboard/                # 首页仪表盘
│           ├── students/                 # 学生管理
│           ├── classes/                  # 班级管理
│           ├── teachers/                 # 教师管理
│           ├── colleges/                 # 学院管理
│           ├── announcements/            # 公告管理
│           ├── elective/                 # 选修课选课
│           ├── my-courses/               # 我的选课
│           └── system/                   # 用户管理 + 个人中心
│
├── server/                              # 后端（Express）
│   └── src/
│       ├── config/
│       │   └── database.js               # 数据库连接池（pg）
│       ├── middleware/
│       │   └── auth.js                   # JWT 认证 + 角色授权中间件
│       ├── services/                     # 业务逻辑层
│       │   ├── authService.js
│       │   ├── userService.js
│       │   ├── collegeService.js
│       │   ├── classService.js
│       │   ├── studentService.js
│       │   ├── teacherService.js
│       │   ├── courseService.js
│       │   ├── scheduleService.js
│       │   ├── scoreService.js
│       │   ├── studentCourseService.js
│       │   ├── announcementService.js
│       │   └── exportService.js
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

## 快速开始

### 环境要求

- Node.js >= 18

### 1. 克隆项目

```bash
git clone https://github.com/你的用户名/学生管理系统.git
cd 学生管理系统
```

数据库已预配置，`.env` 文件直接包含在项目中，clone 后无需额外配置。

### 2. 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 3. 初始化种子数据（可选）

插入测试数据（10个学院、50+教师、60+班级、200名学生、课程、排课、成绩）：

```bash
cd server
npm run dev:seed
```

种子数据包含：

- 管理员账号 `admin` / `admin123`
- 教师账号（如 `T000001`），默认密码 `123456`
- 学生账号（如 `20240001`），默认密码 `123456`

### 4. 启动项目

```bash
# 终端1：启动后端（端口 3000）
cd server
npm run dev

# 终端2：启动前端（端口 5173）
cd client
npm run dev
```

### 5. 访问

打开浏览器访问 `http://localhost:5173`

---

## 默认账号

| 角色   | 用户名                  | 密码       | 说明                 |
| ------ | ----------------------- | ---------- | -------------------- |
| 管理员 | `admin`                 | `admin123` | 全部权限             |
| 教师   | `T000001` ~ `T0000XX`   | `123456`   | 查看、录入成绩、导出 |
| 学生   | `20240001` ~ `20240200` | `123456`   | 查看成绩、选修课选课 |

> 教师和学生的初始密码均为 `123456`，建议登录后修改。
> 教师编号和学号由种子数据自动生成，具体可查看运行 `seed.js` 后的控制台输出。

---

## API 概览

| 模块     | 接口                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------- |
| **认证** | `POST /api/auth/login` `GET /api/auth/profile` `PUT /api/auth/password`                               |
| **学院** | `GET/POST /api/colleges` `GET/PUT/DELETE /api/colleges/:id`                                           |
| **学生** | `GET/POST /api/students` `GET/PUT/DELETE /api/students/:id`                                           |
| **教师** | `GET/POST /api/teachers` `GET/PUT/DELETE /api/teachers/:id`                                           |
| **班级** | `GET/POST /api/classes` `GET/PUT/DELETE /api/classes/:id`                                             |
| **课程** | `GET/POST /api/courses` `PUT/DELETE /api/courses/:id`                                                 |
| **排课** | `GET/POST /api/schedules` `DELETE /api/schedules/:id` `GET /api/schedules/by-class/:id`               |
| **选课** | `GET /api/student-courses` `POST /api/student-courses/select` `POST /api/student-courses/auto-assign` |
| **成绩** | `GET /api/scores` `POST /api/scores/batch` `GET /api/scores/statistics`                               |
| **导出** | `POST /api/export/students` `POST /api/export/scores`                                                 |
| **公告** | `GET /api/announcements` `POST/PUT/DELETE /api/announcements/:id`                                     |
| **用户** | `GET/POST /api/users` `PUT/DELETE /api/users/:id`                                                     |

---

## 后端架构设计

项目采用 **Controller → Service** 双层架构：

```
routes/  →  controllers/  →  services/  →  database
  (路由)      (HTTP 薄层)     (业务逻辑)     (pg 连接池)
```

- **routes**：定义 URL 路径和中间件（认证、角色授权）
- **controllers**：解析请求参数、校验必填字段、调用 service、返回响应（**不包含业务逻辑**）
- **services**：所有 SQL 查询、业务规则校验、权限判定（**不关心 HTTP 细节**）
- 共识约定：service 返回 `{ _error, _status }` 表示业务校验失败，controller 据此转为 HTTP 错误响应

---

## 许可证

MIT
