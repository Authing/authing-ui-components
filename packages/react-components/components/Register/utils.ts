import { useGuardPublicConfig } from '../_utils/context'

// 是否进行注册信息补全
export const useIsChangeComplete = (currentMode: 'phone' | 'email') => {
  const { extendsFields } = useGuardPublicConfig()

  const { complateFiledsPlace } = useGuardPublicConfig()

  // 开关控制 如果没有 register 就不开启了
  if (!complateFiledsPlace.includes('register')) {
    return false
  }

  if (!Boolean(extendsFields) || extendsFields.length === 0) {
    // 为空就不补了～
    return false
  }

  // 字段唯一 切 与注册的方式相同 就不补了
  if (extendsFields.length === 1 && extendsFields[0].name === currentMode) {
    return false
  }

  // 其他的补
  return true
}
