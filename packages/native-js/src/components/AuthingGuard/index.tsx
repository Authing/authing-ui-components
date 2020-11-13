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

  private eventListeners = Object.values(GuardEventsCamelToKebabMap).reduce(
    (acc, evtName) => {
      return Object.assign({}, acc, {
        [evtName]: [],
      })
    },
    {} as EventListeners
  )

  render() {
    const evts: GuardEventsHandler = Object.entries(
      GuardEventsCamelToKebabMap
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
        id="fuck"
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
