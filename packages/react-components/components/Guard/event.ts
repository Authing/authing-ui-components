import { message } from 'antd'
import { GuardModuleType } from '.'
import { CompleteInfoEvents } from '../CompleteInfo/interface'
import { ForgetPasswordEvents } from '../ForgetPassword/interface'
import { LoginEvents } from '../Login/interface'
import { RegisterEvents } from '../Register/interface'
import { i18n } from '../_utils/locales'

export interface GuardEvents
  extends LoginEvents,
    RegisterEvents,
    CompleteInfoEvents,
    ForgetPasswordEvents {
  onBeforeChangeModule?: (
    key: GuardModuleType,
    initData?: any
  ) => boolean | Promise<boolean>
}

export const guardEventsFilter = (props: any) => {
  const events: GuardEvents = {}
  const eventsName = Object.keys(props).filter((name) => name.startsWith('on'))
  eventsName.forEach((eventName) => {
    events[eventName as keyof GuardEvents] = props[eventName]
  })
  return guardEventsHijacking(events, props.config.openEventsMapping)
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

export const guardEventsHijacking = (
  events: GuardEvents,
  openEventsMapping: boolean
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
