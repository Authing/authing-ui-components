import { useGuardHttpClient } from '../../_utils/context'

// 处理所有使用 postMessage 方式的登录
export const usePostMessages = (evt: MessageEvent) => {
  // 借用一下 GuardHttpClient 的方法
  const { responseIntercept } = useGuardHttpClient()

  const { code, message, data, event } = evt.data

  const { source, eventType } = event || {}
  // 社会化登录是用 authing-js-sdk 实现的，不用再在这里回调了
  if (source === 'authing' && eventType === 'socialLogin') {
    return
  }

  // TODO 完整的登陆信息 在 message 中 以 Json 的形式返回 待优化
  const parsedMessage = JSON.parse(message)

  const {
    code: authingCode,
    statusCode,
    apiCode,
    message: authingMessage,
    data: authingResData,
  } = parsedMessage

  responseIntercept({
    statusCode,
    apiCode,
    data: authingResData,
    message: authingMessage,
    code: authingCode,
  })
}
