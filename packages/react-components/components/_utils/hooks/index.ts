import { useRef, useCallback } from 'react'
import { GuardModuleType } from '../../Guard/module'
import { useModule } from '../../context/module/context'

export const useChangeModule = () => {
  const { module, changeModule, setInitData } = useModule()

  const nextModule = (nextModuleType: GuardModuleType, nextData?: any) => {
    if (nextModuleType !== module) changeModule(nextModuleType)

    setInitData(nextData ?? {})
  }

  return nextModule
}

let thisAppId: string = ''

export const useAppId = (appId?: string) => {
  if (appId) {
    thisAppId = appId
  }

  return thisAppId
}

export const useDebounce = (
  // 回调函数
  fn: any,
  // 延迟时间
  delay: number
) => {
  const timer = useRef<{ time: any }>({ time: null })
  const errorBody = useRef<{ body: any }>({ body: null })
  return useCallback(
    (...args: any[]) => {
      if (timer.current.time) {
        clearTimeout(timer.current.time)
        timer.current.time = null
      }
      timer.current.time = setTimeout(() => {
        // fn.apply(this, args);
        const res = fn(...args)
        timer.current.time = null
        errorBody.current.body = res
      }, delay)
      if (errorBody.current.body) {
        return Promise.reject(errorBody.current.body)
      } else {
        return Promise.resolve()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timer.current, delay]
  )
}
