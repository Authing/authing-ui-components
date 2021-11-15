import { ErrorCode } from '../_utils/GuardErrorCode'
import { GuardModuleAction } from '../Guard/module'

export const codeMap: Record<number, GuardModuleAction> = {
  [ErrorCode.USER_EXISTENCE]: {
    action: 'message',
  },
  [ErrorCode.INPUT_CAPTCHACODE]: {
    // 需要输入图形验证码
    action: 'message',
  },
  [ErrorCode.PASSWORD_ERROR]: {
    // 密码错误
    action: 'message',
  },
}
