import { AuthingResponse } from '../http'
import { CodeAction } from './interface'

export const errorCodeInterceptor: (
  res: AuthingResponse<any>,
  callBack: (code: CodeAction, res: AuthingResponse) => void
) => AuthingResponse<any> = (res, callBack) => {
  if (!res.statusCode) return res

  const statusCode = res.statusCode

  if (['6'].includes(statusCode[0])) {
    callBack(CodeAction.RENDER_MESSAGE, res)

    return res
  }

  // TODO 临时逻辑 如果有 Code 的话 先不走 statusCode 的行为
  // 否则会出现 messages 渲染两次的问题
  if (!!res.code) return res

  switch (statusCode[0]) {
    case '3':
      callBack(CodeAction.CHANGE_MODULE, res)
      break

    case '4':
    case '6':
      callBack(CodeAction.RENDER_MESSAGE, res)
      break

    default:
      break
  }

  return res
}
