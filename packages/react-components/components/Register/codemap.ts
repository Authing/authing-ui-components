import { ErrorCode } from '../_utils/GuardErrorCode'
import { GuardModuleAction } from '../Guard/module'

export const codeMap: Record<number, GuardModuleAction> = {
  [ErrorCode.USER_EXISTENCE]: {
    action: 'message',
  },
  // 频繁注册
  1002: {
    action: 'message',
  },
}
