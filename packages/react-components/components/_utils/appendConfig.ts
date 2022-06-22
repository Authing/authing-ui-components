import { GuardAppendConfig } from '..'

let appendConfigMapping: GuardAppendConfig

export const getAppendConfig = (): GuardAppendConfig => {
  return appendConfigMapping
}

export const useAppendConfig = getAppendConfig

/**
 * 初始化 appendConfigMapping
 * @param appendConfig
 */
export const initAppendConfig = (appendConfig: GuardAppendConfig = {}) => {
  appendConfigMapping = appendConfig
}
