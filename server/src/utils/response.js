/**
 * 统一响应格式工具类
 *
 * 所有 API 接口统一使用此类返回数据，保证前后端交互格式一致
 * 成功响应格式：{ code: 200, message: "操作成功", data: {...} }
 * 失败响应格式：{ code: 4xx/5xx, message: "错误信息" }
 */

class Response {
  /**
   * 成功响应（通用）
   * @param {*} data - 返回的数据
   * @param {string} message - 提示信息
   */
  static success(data = null, message = '操作成功') {
    return { code: 200, message, data };
  }

  /**
   * 分页查询成功响应
   * @param {Array} rows - 当前页数据列表
   * @param {number} total - 数据总量
   * @param {number} page - 当前页码
   * @param {number} pageSize - 每页条数
   * @param {string} message - 提示信息
   */
  static paginate(rows, total, page, pageSize, message = '查询成功') {
    return {
      code: 200,
      message,
      data: {
        rows,                              // 当前页数据
        total,                             // 总记录数
        page,                              // 当前页码
        pageSize,                          // 每页条数
        totalPages: Math.ceil(total / pageSize), // 总页数
      },
    };
  }

  /**
   * 创建成功响应（201）
   * @param {*} data - 返回的数据
   * @param {string} message - 提示信息
   */
  static created(data = null, message = '创建成功') {
    return { code: 201, message, data };
  }

  // ==================== 错误响应 ====================

  /** 服务器内部错误 */
  static error(code = 500, message = '服务器错误') {
    return { code, message };
  }

  /** 请求参数错误（400） */
  static badRequest(message = '参数错误') {
    return { code: 400, message };
  }

  /** 未授权，需要登录（401） */
  static unauthorized(message = '未登录或登录已过期') {
    return { code: 401, message };
  }

  /** 已登录但无权限（403） */
  static forbidden(message = '无权访问') {
    return { code: 403, message };
  }

  /** 请求的资源不存在（404） */
  static notFound(message = '资源不存在') {
    return { code: 404, message };
  }
}

export default Response;
