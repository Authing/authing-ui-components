import {
  GuardMode,
  UserConfig,
  GuardScenes,
  LoginMethods,
  RegisterMethods,
} from '../../components/AuthingGuard/types'

// 个人版 OTP MFA 的 error code
export const OTP_MFA_CODE = 1635
// 企业版手机和短信验证吗 MFA 的 error code
export const APP_MFA_CODE = 1636

// 需要验证吗
export const NEED_CAPTCHA = 2000

export const LOGIN_METHODS_MAP = {
  [LoginMethods.Password]: '密码登录',
  [LoginMethods.PhoneCode]: '验证码登录',
  [LoginMethods.AppQr]: 'APP 扫码登录',
  [LoginMethods.WxMinQr]: '扫码登录',
  [LoginMethods.LDAP]: 'LDAP 登录',
  [LoginMethods.AD]: 'AD 登录',
}

export const REGISTER_METHODS_MAP = {
  [RegisterMethods.Email]: '邮箱注册',
  [RegisterMethods.Phone]: '手机号注册',
}

// 某些社会化登录会在 tabs 中显示，或者无法在 Guard 中使用，所以底部不显示了
export const HIDE_SOCIALS = [
  'wechat:miniprogram:app-launch',
  'wechat:miniprogram:qrconnect',
  'wechat:webpage-authorization',
  'wechat:miniprogram:default',
  'wechatwork:addressbook',
  'wechat:mobile',
]

// 企业版 MFA 支持的方式
export enum ApplicationMfaType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  // OTP = 'OTP',
  // FACE = 'FACE',
  // FINGERPRINT = 'FINGERPRINT',
}

export const defaultGuardConfig: Partial<UserConfig> = {
  isSSO: false,
  title: 'Authing',
  text: {
    loginTabs: LOGIN_METHODS_MAP,
    loginBtn: {
      normal: '登录',
      loading: '登录',
    },
    registerBtn: {
      normal: '注册',
      loading: '注册',
    },
  },
  escCloseable: true,
  autoRegister: false,
  clickCloseable: true,
  mode: GuardMode.Normal,
  disableRegister: false,
  disableResetPwd: false,
  defaultScenes: GuardScenes.Login,
  apiHost: 'https://core.authing.cn',
  defaultLoginMethod: LoginMethods.Password,
  defaultRegisterMethod: RegisterMethods.Email,
  loginMethods: [LoginMethods.Password, LoginMethods.PhoneCode],
  registerMethods: [RegisterMethods.Email, RegisterMethods.Phone],
  logo:
    'https://files.authing.co/user-contents/photos/0a4c99ff-b8ce-4030-aaaf-584c807cb21c.png',
}
