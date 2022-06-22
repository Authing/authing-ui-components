import { useState, useEffect } from 'react'
import { GuardEvents, guardEventsFilter } from '../../event'
import { GuardProps } from '../../Guard'

/**
 * 初始化事件
 * @param guardProps
 * @param openEventsMapping
 * @returns
 */
export default function useEvents(
  guardProps: GuardProps,
  openEventsMapping?: boolean
) {
  const [events, setEvents] = useState<GuardEvents>()

  /**
   * 初始化事件相关
   */
  const initEvents = () => {
    const events = guardEventsFilter(
      {
        ...guardProps,
      },
      !!openEventsMapping
    )
    setEvents(events)
  }

  useEffect(() => {
    initEvents()
  }, [guardProps])

  return {
    events,
    setEvents,
    initEvents,
  }
}
