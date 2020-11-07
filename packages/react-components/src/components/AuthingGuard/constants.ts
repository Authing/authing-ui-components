import {
  AppType,
  UserConfig,
  GuardScenes,
  LoginMethods,
  Mode,
  RegisterMethods,
} from '@/components/AuthingGuard/types'

// 当需要 MFA 认证时，登录返回的 error code
export const NEED_MFA_CODE = 1635

// 需要验证吗
export const NEED_CAPTCHA = 2000

export const LOGIN_METHODS_MAP = {
  [LoginMethods.Password]: '密码登录',
  [LoginMethods.PhoneCode]: '验证码登录',
  [LoginMethods.AppQr]: 'APP 扫码登录',
  [LoginMethods.WxMinQr]: '扫码登录',
  [LoginMethods.LDAP]: 'LDAP 登录',
}

export const REGISTER_METHODS_MAP = {
  [RegisterMethods.Email]: '邮箱注册',
  [RegisterMethods.Phone]: '手机号注册',
}

export const defaultGuardConfig: Partial<UserConfig> = {
  loginMethods: [LoginMethods.Password, LoginMethods.PhoneCode],
  defaultLoginMethod: LoginMethods.Password,
  registerMethods: [RegisterMethods.Email, RegisterMethods.Phone],
  defaultRegisterMethod: RegisterMethods.Email,
  mode: Mode.Normal,
  title: 'Authing',
  logo:
    'https://files.authing.co/user-contents/photos/0a4c99ff-b8ce-4030-aaaf-584c807cb21c.png',
  defaultScenes: GuardScenes.Login,
  autoRegister: false,
  clickCloseable: true,
  escCloseable: true,
  isSSO: false,
  appType: AppType.OIDC,
  scope: 'openid profile email phone',
}
