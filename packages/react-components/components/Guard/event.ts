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
