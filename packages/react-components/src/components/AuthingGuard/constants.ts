import { LoginMethods } from '@/components/AuthingGuard/types'

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
