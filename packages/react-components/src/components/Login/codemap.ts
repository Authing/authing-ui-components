import { ErrorCode } from 'src/utils/GuardErrorCode'
import { GuardModuleAction, GuardModuleType } from '../Guard/module'

export const codeMap: Record<number, GuardModuleAction> = {
  [ErrorCode.APP_MFA_CODE]: {
    // 跳转去 mfa 验证
    action: 'changeModule',
    module: GuardModuleType.MFA,
  },
  [ErrorCode.INPUT_CAPTCHACODE]: {
    // 需要输入图形验证码
    action: 'message',
  },
  2333: {
    // 密码错误
    action: 'message',
  },
}
