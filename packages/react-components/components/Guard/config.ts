import { getDefaultLoginConfig, LoginConfig } from '../Login/interface'
import { getDefaultRegisterConfig, RegisterConfig } from '../Register/interface'

export interface GuardComponentConifg extends Partial<GuardLocalConfig> {}

export interface GuardLocalConfig extends RegisterConfig, LoginConfig {}

let defaultConfig: GuardLocalConfig

export const getDefaultGuardLocalConfig = (): GuardLocalConfig => {
  if (!defaultConfig) {
    defaultConfig = {
      ...getDefaultLoginConfig(),
      ...getDefaultRegisterConfig(),
    }
  }

  return defaultConfig
}
