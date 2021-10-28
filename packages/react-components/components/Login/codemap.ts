import { ErrorCode } from '../_utils/GuardErrorCode'
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

  1639: {
    // 首次登陆，跳转去修改密码
    action: 'changeModule',
    module: GuardModuleType.CHANGE_PWD,
    initData: { type: 'inital' },
    // 借助 1639 强行 mock 一下
    // initData: { type: 'rotate' },
  },

  2058: {
    // 密码轮换，跳转去修改密码
    action: 'changeModule',
    module: GuardModuleType.CHANGE_PWD,
    initData: { type: 'rotate' },
  },

  2333: {
    // 密码错误
    action: 'message',
  },
}
