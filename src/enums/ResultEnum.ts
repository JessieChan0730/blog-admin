/**
 * 响应码枚举
 */
export const enum ResultEnum {
  /**
   * 成功
   */
  SUCCESS = 200,

  /**
   * 删除成功
   */
  NOT_CONtTENT = 204,

  /**
   * 错误
   */
  ERROR = 500,
  /**
   * 令牌无效或过期
   */
  TOKEN_INVALID = "401",

  /**
   * 请求错误
   */
  BAD_REQUEST = 400,
}
