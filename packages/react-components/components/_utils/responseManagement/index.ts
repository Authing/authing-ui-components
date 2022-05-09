import { message } from 'antd'
import { getHundreds } from '..'
import { AuthingGuardResponse, AuthingResponse } from '../http'
import { CodeAction } from './interface'

export const errorCodeInterceptor: (
  res: AuthingResponse<any>,
  callBack: (code: CodeAction, res: AuthingResponse) => AuthingGuardResponse
) => AuthingResponse<any> = (res, callBack) => {
  if (res.code === -1) {
    message.error('请求超时，请稍后重试')

    return res
  }

  if (!res.statusCode) return res

  const statusCode = res.statusCode

  // if ([6].includes(getHundreds(statusCode))) {
  //   callBack(CodeAction.RENDER_MESSAGE, res)

  //   return res
  // }

  // TODO 临时逻辑 如果有 Code 的话 先不走 statusCode 的行为
  // 否则会出现 messages 渲染两次的问题
  // if (!!res.code) return res

  switch (getHundreds(statusCode)) {
    case 3:
      return callBack(CodeAction.CHANGE_MODULE, res)

    case 4:
    case 6:
      return callBack(CodeAction.RENDER_MESSAGE, res)

    default:
      break
  }

  return res
}
