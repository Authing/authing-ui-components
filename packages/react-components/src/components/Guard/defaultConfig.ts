import { LoginMethods, RegisterMethods } from 'authing-js-sdk'
import {
  BaseConfig,
  GuardConfig,
  GuardMode,
  GuardScenes,
  Headers,
  LoginConfig,
  RegisterConfig,
} from './config'
import { Lang } from 'authing-js-sdk/build/main/types'

export interface DefaultBaseConfig extends BaseConfig {
  lang: Lang
  host: string
  logo: string
  title: string
  isSSO: boolean
  mode: GuardMode
  escCloseable: boolean
  clickCloseable: boolean
  defaultScenes: GuardScenes
  headers: Headers
}

const defaultBaseConfig: DefaultBaseConfig = {
  isSSO: false,
  lang: 'zh-CN',
  title: 'Authing',
  escCloseable: true,
  clickCloseable: true,
  mode: GuardMode.Normal,
  host: 'https://core.authing.cn',
  defaultScenes: GuardScenes.Login,
  logo:
    'https://files.authing.co/user-contents/photos/0a4c99ff-b8ce-4030-aaaf-584c807cb21c.png',
  headers: {
    'userpool-id': 'x-authing-userpool-id',
    'app-id': 'x-authing-app-id',
    'request-from': 'x-authing-request-from',
    'sdk-version': 'x-authing-sdk-version',
    lang: 'x-authing-lang',
  },
}

export interface DefaultLoginConfig extends LoginConfig {
  autoRegister: boolean
  disableResetPwd: boolean
  defaultLoginMethod: LoginMethods
  loginMethods: LoginMethods[]
}

const defaultLoginConfig: DefaultLoginConfig = {
  autoRegister: false,
  disableResetPwd: false,
  defaultLoginMethod: LoginMethods.Password,
  loginMethods: [LoginMethods.Password, LoginMethods.PhoneCode],
}

export interface DefaultRegisterConfig extends RegisterConfig {
  disableRegister: boolean
  defaultRegisterMethod: RegisterMethods
  registerMethods: RegisterMethods[]
}

const defaultRegisteConfig: DefaultRegisterConfig = {
  disableRegister: false,
  defaultRegisterMethod: RegisterMethods.Email,
  registerMethods: [RegisterMethods.Email, RegisterMethods.Phone],
}

export interface DefaultConfig extends GuardConfig {
  base: DefaultBaseConfig
  login: DefaultLoginConfig
  registe: DefaultRegisterConfig
}

export const defaultConfig: DefaultConfig = {
  base: defaultBaseConfig,
  login: defaultLoginConfig,
  registe: defaultRegisteConfig,
}
