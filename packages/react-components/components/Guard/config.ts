import { getDefaultLoginConfig, LoginConfig } from '../Login/props'
import { getDefaultRegisterConfig, RegisterConfig } from '../Register/props'

export interface GuardConfig extends RegisterConfig, LoginConfig {}

let defaultConfig: GuardConfig

export const getDefaultGuardConfig = (): GuardConfig => {
  if (!defaultConfig) {
    defaultConfig = {
      ...getDefaultLoginConfig(),
      ...getDefaultRegisterConfig(),
    }
  }

  return defaultConfig
}
