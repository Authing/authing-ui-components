import React from 'react'
import ReactDOM from 'react-dom'
import { AuthingGuard as ReactAuthingGuard } from 'react-components'
import {
  Mode,
  User,
  UserConfig,
  GuardScenes,
  LoginMethods,
  CommonMessage,
  RegisterMethods,
  GuardEventsHandler,
  AuthenticationClient,
  GuardEventsHandlerKebab,
} from 'react-components'
import 'react-components/lib/index.css'

export type {
  User,
  UserConfig,
  CommonMessage,
  GuardEventsHandler,
  AuthenticationClient,
  GuardEventsHandlerKebab,
}

export { Mode, GuardScenes, LoginMethods, RegisterMethods }

export type EventListeners = {
  [key in keyof GuardEventsHandlerKebab]: Exclude<
    Required<GuardEventsHandlerKebab>[key],
    undefined
  >[]
}

export class AuthingGuard {
  constructor(private userPoolId: string, private config?: UserConfig) {
    if (config?.target) {
      this.render()
    }
  }

  static getGuardContainer(selector?: string | HTMLElement) {
    const defaultId = 'authing_guard_container'

    if (!selector) {
      let container = document.querySelector(`#${defaultId}`)
      if (!container) {
        container = document.createElement('div')
        container.id = defaultId
      }

      container.innerHTML = ''

      return container
    }

    if (typeof selector === 'string') {
      return document.querySelector(selector)
    }

    return selector
  }

  private eventListeners: EventListeners = {
    // 加载完成，userPool 配置和应用配置（如果有 appId）加载完成
    load: [],
    // 加载失败
    'load-error': [],
    // 用户登录成功
    login: [],
    // 用户登录失败
    'login-error': [],
    // 注册成功
    register: [],
    // 注册失败
    'register-error': [],
    // 忘记密码邮件发送成功
    'pwd-email-send': [],
    // 忘记密码邮件发送失败
    'pwd-email-send-error': [],
    // 忘记密码手机验证码发送成功
    'pwd-phone-send': [],
    // 忘记密码手机验证码发送失败
    'pwd-phone-send-error': [],
    // 重置密码成功
    'pwd-reset': [],
    // 重置密码失败
    'pwd-reset-error': [],
    // 表单关闭事件
    close: [],
  }

  static reactEvtMapNative: Record<
    keyof GuardEventsHandler,
    keyof GuardEventsHandlerKebab
  > = {
    onLoad: 'load',
    onLoadError: 'load-error',
    onLogin: 'login',
    onLoginError: 'login-error',
    onRegister: 'register',
    onRegisterError: 'register-error',
    onPwdEmailSend: 'pwd-email-send',
    onPwdEmailSendError: 'pwd-email-send-error',
    onPwdPhoneSend: 'pwd-phone-send',
    onPwdPhoneSendError: 'pwd-phone-send-error',
    onPwdReset: 'pwd-reset',
    onPwdResetError: 'pwd-reset-error',
    onClose: 'close',
  }

  render() {
    const evts: GuardEventsHandler = Object.entries(
      AuthingGuard.reactEvtMapNative
    ).reduce((acc, [reactEvt, nativeEvt]) => {
      return Object.assign({}, acc, {
        [reactEvt]: (...rest: any) => {
          this.eventListeners[nativeEvt].forEach((item: any) => {
            item(...rest)
          })
        },
      })
    }, {} as GuardEventsHandler)

    return ReactDOM.render(
      <ReactAuthingGuard
        {...evts}
        userPoolId={this.userPoolId}
        config={this.config}
      />,
      AuthingGuard.getGuardContainer(this.config?.target)
    )
  }

  on<T extends keyof GuardEventsHandlerKebab>(
    evt: T,
    handler: Exclude<GuardEventsHandlerKebab[T], undefined>
  ) {
    this.eventListeners[evt]!.push(handler as any)
  }

  show() {
    if (!this.config?.target) {
      this.render()
    }
  }
}
