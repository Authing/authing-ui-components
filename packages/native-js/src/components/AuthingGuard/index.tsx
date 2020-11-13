import React from 'react'
import ReactDOM from 'react-dom'
import { AuthingGuard as ReactAuthingGuard } from 'react-components'
import {
  User,
  GuardMode,
  UserConfig,
  GuardScenes,
  LoginMethods,
  CommonMessage,
  RegisterMethods,
  GuardEventsHandler,
  AuthenticationClient,
  GuardEventsHandlerKebab,
  GuardEventsCamelToKebabMap,
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

export { GuardMode, GuardScenes, LoginMethods, RegisterMethods }

export type EventListeners = {
  [key in keyof GuardEventsHandlerKebab]: Exclude<
    Required<GuardEventsHandlerKebab>[key],
    undefined
  >[]
}

export class AuthingGuard {
  constructor(private userPoolId: string, private config?: UserConfig) {
    this.render(() => {
      if (config?.mode === GuardMode.Modal) {
        const prevVisible = this.visible

        // modal 模式默认不展示
        this.hide()

        /**
         * 为了 modal 模式
         *
         * const guard = new AuthingGuard(...)
         * guard.show()
         *
         * 时也有出场动画
         */
        setTimeout(() => {
          if (prevVisible) {
            this.show()
          }
        })
      }
    })
  }

  static guardId = 'authing_guard_layout'
  static hiddenClassName = 'authing-guard-layout__hidden'

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

  private visible = false

  private eventListeners = Object.values(GuardEventsCamelToKebabMap).reduce(
    (acc, evtName) => {
      return Object.assign({}, acc, {
        [evtName]: [],
      })
    },
    {} as EventListeners
  )

  private render(cb?: () => void) {
    const evts: GuardEventsHandler = Object.entries(
      GuardEventsCamelToKebabMap
    ).reduce((acc, [reactEvt, nativeEvt]) => {
      return Object.assign({}, acc, {
        [reactEvt]: (...rest: any) => {
          this.eventListeners[nativeEvt].forEach((item: any) => {
            item(...rest)
          })

          if (nativeEvt === 'close') {
            // 与 react 里面的状态管理冲突了
            setTimeout(() => {
              this.hide()
            })
          }
        },
      })
    }, {} as GuardEventsHandler)

    return ReactDOM.render(
      <ReactAuthingGuard
        id={`${AuthingGuard.guardId}`}
        {...evts}
        userPoolId={this.userPoolId}
        config={this.config}
      />,
      AuthingGuard.getGuardContainer(this.config?.target),
      cb
    )
  }

  private getGuardDom() {
    return document.querySelector(`#${AuthingGuard.guardId}`)
  }

  on<T extends keyof GuardEventsHandlerKebab>(
    evt: T,
    handler: Exclude<GuardEventsHandlerKebab[T], undefined>
  ) {
    this.eventListeners[evt]!.push(handler as any)
  }

  show() {
    this.visible = true
    this.getGuardDom()?.classList.remove(AuthingGuard.hiddenClassName)
  }

  hide() {
    this.visible = false
    this.getGuardDom()?.classList.add(AuthingGuard.hiddenClassName)
  }
}
