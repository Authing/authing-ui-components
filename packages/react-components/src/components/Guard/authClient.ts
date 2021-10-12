import message from 'antd/lib/message'
import { AuthenticationClient } from 'authing-js-sdk'
import { FrameType } from 'src/FrameType'
import { ErrorCode } from 'src/utils/GuardErrorCode'
import { DefaultConfig } from './config'

let authClient: AuthenticationClient

export const initAuthClient = (
  config: DefaultConfig,
  appId: string,
  frame?: FrameType
) => {
  const {
    base: { host },
  } = config

  if (!authClient) {
    authClient = new AuthenticationClient({
      appHost: host,
      appId,
      requestFrom: `ui-components-${frame ?? FrameType.React}`,
      lang: config.base.lang,
      onError: (code, msg: any) => {
        if (code === 2020) {
          return
        }
        if ([ErrorCode.OTP_MFA_CODE, ErrorCode.APP_MFA_CODE].includes(code)) {
          message.info(msg)
          return
        }
        message.error(msg)
      },
    })
  }

  return authClient
}

export const getAuthClient = () => {
  if (!authClient) {
    throw new Error('Please initialize AuthClient')
  }

  return authClient
}

export const useAuthClient = () => getAuthClient()
