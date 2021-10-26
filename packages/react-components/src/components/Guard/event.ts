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
