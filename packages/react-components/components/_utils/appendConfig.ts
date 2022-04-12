import { GuardAppendConfig } from '..'

let appendConfigMapping: GuardAppendConfig

export const getAppendConfig = (): GuardAppendConfig => {
  return appendConfigMapping
}

export const useAppendConfig = getAppendConfig

export const initAppendConfig = (appendConfig: GuardAppendConfig = {}) => {
  appendConfigMapping = appendConfig
}

export const getGuardWindow = () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  if (appendConfigMapping?.window) return appendConfigMapping.window

  return window
}
