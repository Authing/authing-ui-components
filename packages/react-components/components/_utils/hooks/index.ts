import { useRef, useCallback, useEffect } from 'react'
import { GuardModuleType } from '../../Guard/module'
import { useModule } from '../../context/module/context'
import { useMediaQuery } from 'react-responsive'
import phone from 'phone'
import { LanguageMap } from '../../Type'
export interface PhoneValidResult {
  isValid: boolean
  phoneNumber: string
  countryIso2: string
  countryIso3: string
  countryCode: string
}

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
  const saftyCode = document.getElementsByClassName('authing-g2-code-input')

  const bindTotpSecretSave = document.getElementsByClassName(
    'g2-mfa-bindTotp-secretSave'
  )
  // 挂载 shaking
  const MountShaking = () => {
    Array.from(inputs).forEach((input) => {
      input.classList.add('shaking')
    })
    Array.from(agreements).forEach((agreement) => {
      agreement.classList.add('shaking')
    })
    saftyCode[0] && saftyCode[0].classList.add('shaking')
    bindTotpSecretSave[0] && bindTotpSecretSave[0].classList.add('shaking')
  }
  // 卸载 shaking
  const UnMountShaking = () => {
    Array.from(inputs).forEach((input) => {
      input.classList.remove('shaking')
    })
    Array.from(agreements).forEach((agreement) => {
      agreement.classList.remove('shaking')
    })
    saftyCode[0] && saftyCode[0].classList.remove('shaking')
    bindTotpSecretSave[0] && bindTotpSecretSave[0].classList.remove('shaking')
  }
  return { MountShaking, UnMountShaking }
}
export const defaultAreaCode = LanguageMap[navigator.language]
  ? LanguageMap[navigator.language]
  : 'CN'
/**
 * 解析手机号
 * @param fieldValue 字段值
 * @param areaCode 区号
 * @returns
 */
export const parsePhone = (
  fieldValue: string,
  areaCode: string = defaultAreaCode
) => {
  let countryCode = areaCode

  let phoneNumber = fieldValue

  if (phone(fieldValue, { country: areaCode }).isValid) {
    const parsePhone = phone(fieldValue, {
      country: areaCode,
    }) as PhoneValidResult

    countryCode = parsePhone.countryCode as string

    phoneNumber = parsePhone.phoneNumber.split(countryCode)[1]
  } else if (phone(fieldValue).isValid) {
    const parsePhone = phone(fieldValue) as PhoneValidResult

    countryCode = parsePhone.countryCode as string

    phoneNumber = parsePhone.phoneNumber.split(countryCode)[1]
  }
  return { countryCode, phoneNumber }
}
