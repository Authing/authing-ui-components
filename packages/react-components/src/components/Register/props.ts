import { RegisterMethods } from 'authing-js-sdk'
import { IG2FCProps, IG2Config, getDefaultG2Config } from 'src/classes'

export interface RegisterConfig extends IG2Config {
  registerMethods?: RegisterMethods[]
  defaultRegisterMethod?: RegisterMethods
  disableRegister?: boolean
}

const defaultConfig: RegisterConfig = {
  disableRegister: false,
  defaultRegisterMethod: RegisterMethods.Email,
  registerMethods: [RegisterMethods.Email, RegisterMethods.Phone],
}

export interface RegisterEvents {
  onLogin: () => void
}

export interface GuardLoginProps extends IG2FCProps, RegisterEvents {
  config?: RegisterConfig
}

export const getDefaultRegisterConfig = (): RegisterConfig => ({
  ...getDefaultG2Config(),
  ...defaultConfig,
})
