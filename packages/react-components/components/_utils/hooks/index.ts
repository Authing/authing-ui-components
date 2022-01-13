import { useRef, useCallback, useEffect } from 'react'
import { GuardModuleType } from '../../Guard/module'
import { useModule } from '../../context/module/context'
import { useMediaQuery } from 'react-responsive'

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

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timer.current.time && clearInterval(timer.current.time)
    }
  }, [])

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
      // if (errorBody.current.body) {
      //   return Promise.reject(errorBody.current.body)
      // } else {
      //   return Promise.resolve()
      // }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timer.current, delay]
  )
}

export const useMediaSize = () => {
  const isPhoneMedia = useMediaQuery({
    maxWidth: 450,
  })

  return {
    isPhoneMedia,
  }
}
// shaking 抖动
export const useShaking = () => {
  // form input
  const inputs = document.getElementsByClassName('authing-g2-input')
  // 必选协议
  const agreements = document.getElementsByClassName(
    'authing-agreements-item-invalid'
  )
  // 挂载 shaking
  const MountShaking = () => {
    Array.from(inputs).forEach((input) => {
      input.classList.add('shaking')
    })
    Array.from(agreements).forEach((agreement) => {
      agreement.classList.add('shaking')
    })
  }
  // 卸载 shaking
  const UnMountShaking = () => {
    Array.from(inputs).forEach((input) => {
      input.classList.remove('shaking')
    })
    Array.from(agreements).forEach((agreement) => {
      agreement.classList.remove('shaking')
    })
  }
  return { MountShaking, UnMountShaking }
}
