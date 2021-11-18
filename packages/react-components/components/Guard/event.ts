import { message } from 'antd'
import { CompleteInfoEvents } from '../CompleteInfo/interface'
import { ForgetPasswordEvents } from '../ForgetPassword/interface'
import { LoginEvents } from '../Login/props'
import { RegisterEvents } from '../Register/props'
import { i18n } from '../_utils/locales'

export interface GuardEvents
  extends LoginEvents,
    RegisterEvents,
    CompleteInfoEvents,
    ForgetPasswordEvents {}

export const guardEventsFilter = (props: any) => {
  const events: GuardEvents = {}
  const eventsName = Object.keys(props).filter((name) => name.startsWith('on'))
  eventsName.forEach((eventName) => {
    events[eventName as keyof GuardEvents] = props[eventName]
  })

  return guardEventsHijacking(events)
}

const eventsMapping: Partial<GuardEvents> = {
  onLogin: (...props) => {
    message.success(i18n.t('common.LoginSuccess'))
    return props
  },

  onRegister: (...props) => {
    message.success(i18n.t('common.registrationSuccess'))
    return props
  },
}

export const guardEventsHijacking = (events: GuardEvents): GuardEvents => {
  const newEvents: GuardEvents = {}
  Object.keys(eventsMapping).forEach((eventsKey) => {
    // @ts-ignore
    newEvents[eventsKey] = (...props) => {
      // @ts-ignore
      const newProps = eventsMapping[eventsKey](...props)
      // @ts-ignore
      events[eventsKey]?.(...newProps)
    }
  })

  return {
    ...events,
    ...newEvents,
  }
}
