import { message } from 'antd'
import { CompleteInfoEvents } from '../CompleteInfo/props'
import { LoginEvents } from '../Login/props'
import { RegisterEvents } from '../Register/props'

export interface GuardEvents
  extends LoginEvents,
    RegisterEvents,
    CompleteInfoEvents {}

export const guardEventsFilter = (props: any) => {
  const events: GuardEvents = {}
  const eventsName = Object.keys(props).filter((name) => name.startsWith('on'))
  eventsName.forEach((eventName) => {
    events[eventName as keyof GuardEvents] = props[eventName]
  })

  return events
}

// const eventsMapping: Partial<GuardEvents> = {
//   onLogin: (...props) => {
//     message.success('登录成功')
//     return props
//   },
// }

// export const guardEventsHijacking = (events: GuardEvents): GuardEvents => {
//   const newEvents: GuardEvents = {}
//   (Object.keys(eventsMapping) as ).forEach(eventsKey => {
//     newEvents[eventsKey] =
//   })

//   return events
// }
