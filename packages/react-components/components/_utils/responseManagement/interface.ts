export enum StatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,

  // 以下是自定义的
  // module 切换
  CHANGE_MODULE = 306,
  // messages 渲染
  RENDER_MESSAGES = 333,
}

export enum ApiCode {}

export const ChangeModuleApiCodeMapping = {}
