import { message } from 'antd'
import { GuardModuleType } from '.'
import { CompleteInfoEvents } from '../CompleteInfo/interface'
import { ForgetPasswordEvents } from '../ForgetPassword/interface'
import { IdentityBindingEvents } from '../IdentityBinding/interface'
import { IdentityBindingAskEvents } from '../IdentityBindingAsk'
import { LoginEvents } from '../Login/interface'
import { RegisterEvents } from '../Register/interface'
import { i18n } from '../_utils/locales'

export interface GuardEvents
  extends LoginEvents,
    RegisterEvents,
    CompleteInfoEvents,
    ForgetPasswordEvents,
    IdentityBindingEvents,
    IdentityBindingAskEvents {
  onBeforeChangeModule?: (
    key: GuardModuleType,
    initData?: any
  ) => boolean | Promise<boolean>
}

export const guardEventsFilter = (props: any, openEventsMapping?: boolean) => {
  const events: GuardEvents = {}

  const eventsNameWhiteList = ['__changeModule']

  const eventsName = Object.keys(props).filter(
    (name) => name.startsWith('on') || eventsNameWhiteList.includes(name)
  )

  eventsName.forEach((eventName) => {
    events[eventName as keyof GuardEvents] = props[eventName]
  })

  return guardEventsHijacking(events, openEventsMapping)
}

const eventsMapping: Partial<GuardEvents> = {
  onLogin: (user, client) => {
    message.success(i18n.t('common.LoginSuccess'))

    if (user) {
      user?.token && client.setToken(user.token)
      client.setCurrentUser(user)
    }

    return [user, client]
  },

  onRegister: (...props) => {
    message.success(i18n.t('common.registrationSuccess'))
    return props
  },
}

export const guardEventsHijacking = (
  events: GuardEvents,
  openEventsMapping?: boolean
): GuardEvents => {
  const newEvents: GuardEvents = {}
  Object.keys(eventsMapping).forEach((eventsKey) => {
    // @ts-ignore
    newEvents[eventsKey] = (...props) => {
      // @ts-ignore
      openEventsMapping && eventsMapping[eventsKey](...props)
      // @ts-ignore
      events[eventsKey]?.(...props)
    }
  })

  return {
    ...events,
    ...newEvents,
  }
}

export const GuardEventsCamelToKebabMapping = {
  onLoad: 'load',
  onLoadError: 'load-error',
  onLogin: 'login',
  onBeforeLogin: 'before-login',
  onLoginError: 'login-error',
  onRegister: 'register',
  onBeforeRegister: 'before-register',
  onRegisterError: 'register-error',
  onPwdEmailSend: 'pwd-email-send',
  onPwdEmailSendError: 'pwd-email-send-error',
  onPwdPhoneSend: 'pwd-phone-send',
  onPwdPhoneSendError: 'pwd-phone-send-error',
  onPwdReset: 'pwd-reset',
  onPwdResetError: 'pwd-reset-error',
  onClose: 'close',
  onLoginTabChange: 'login-tab-change',
  onRegisterTabChange: 'register-tab-change',
  onRegisterInfoCompleted: 'register-info-completed',
  onRegisterInfoCompletedError: 'register-info-completed-error',
  onLangChange: 'lang-change',
} as const

export interface GuardEventsKebabToCamelType {
  // 加载完成，userPool 配置和应用配置（如果有 appId）加载完成
  load: GuardEvents['onLoad']
  // 加载失败
  'load-error': GuardEvents['onLoadError']
  // 登录前，即表单校验完成，请求接口前
  'before-login': GuardEvents['onBeforeLogin']
  // 用户登录成功
  login: GuardEvents['onLogin']
  // 用户登录失败
  'login-error': GuardEvents['onLoginError']
  // 注册前，即表单校验完成，请求接口前
  'before-register': GuardEvents['onBeforeRegister']
  // 注册成功
  register: GuardEvents['onRegister']
  // 注册失败
  'register-error': GuardEvents['onRegisterError']
  // 忘记密码邮件发送成功
  'pwd-email-send': GuardEvents['onPwdEmailSend']
  // 忘记密码邮件发送失败
  'pwd-email-send-error': GuardEvents['onPwdEmailSendError']
  // 忘记密码手机验证码发送成功
  'pwd-phone-send': GuardEvents['onPwdPhoneSend']
  // 忘记密码手机验证码发送失败
  'pwd-phone-send-error': GuardEvents['onPwdPhoneSendError']
  // 重置密码成功
  'pwd-reset': GuardEvents['onPwdReset']
  // 重置密码失败
  'pwd-reset-error': GuardEvents['onPwdResetError']
  // 表单关闭事件
  close: GuardEvents['onClose']
  // 登录的 tab 切换
  'login-tab-change': GuardEvents['onLoginTabChange']
  // 注册的 tab 切换
  'register-tab-change': GuardEvents['onRegisterTabChange']
  // 注册信息补充完毕
  'register-info-completed': GuardEvents['onRegisterInfoCompleted']
  // 注册信息补充失败
  'register-info-completed-error': GuardEvents['onRegisterInfoCompletedError']
  // 语言切换
  'lang-change': GuardEvents['onLangChange']
}
