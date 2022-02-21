import { GuardModuleType } from '../..'
import { AuthingResponse } from '../http'
import { ChangeModuleApiCodeMapping, CodeAction } from './interface'

let changeModule = (a: GuardModuleType, b?: any) => {}

let renderMessage = (message?: string) => {}

const codeActionMapping: Record<
  CodeAction,
  (res: AuthingResponse<any>) => void
> = {
  [CodeAction.CHANGE_MODULE]: (res) => {
    const nextModule = ChangeModuleApiCodeMapping[res.apiCode!]

    const nextData = res.data

    changeModule(nextModule, nextData)
  },
  [CodeAction.RENDER_MESSAGE]: (res) => {
    renderMessage(res.messages)
  },
}

export const errorCodeInterceptor: (
  res: AuthingResponse<any>,
  callBack: (code: CodeAction, res: AuthingResponse) => void
) => AuthingResponse<any> = (res, callBack) => {
  if (!res.statusCode) return res

  // TODO 临时逻辑 如果有 Code 的话 先不走 statusCode 的行为
  // 否则会出现 messages 渲染两次的问题
  if (!!res.code) return res

  const statusCode = res.statusCode

  switch (statusCode[0]) {
    case '3':
      callBack(CodeAction.CHANGE_MODULE, res)
      break

    case '4':
      callBack(CodeAction.RENDER_MESSAGE, res)
      break

    default:
      break
  }

  return res
}
