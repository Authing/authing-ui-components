import { useRef, useCallback, useEffect } from 'react'
import { GuardModuleType } from '../../Guard/module'
import { useModule } from '../../context/module/context'
import { useMediaQuery } from 'react-responsive'
import phone from 'phone'
// import { LanguageMap } from '../../Type'
import { SocialConnectionProvider } from 'authing-js-sdk'
import {
  HIDE_SOCIALS,
  HIDE_SOCIALS_SHOWIN_ENTERPRISE,
} from '../../AuthingGuard/constants'
import {
  isDingtalkBrowser,
  isLarkBrowser,
  isQQBrowser,
  isQQBuiltInBrowser,
  isSpecialBrowser,
  isWeChatBrowser,
  isWeWorkBuiltInBrowser,
} from '..'
import { ApplicationConfig, SocialConnectionItem } from '../../AuthingGuard/api'
import { GuardLocalConfig } from '../../Guard'
import { getGuardWindow } from '../../Guard/core/useAppendConfig'
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

/**
 * 解析手机号
 * @param fieldValue 字段值
 * @param areaCode 区号
 * @returns
 */
export const parsePhone = (
  isInternationSms: boolean,
  fieldValue: string,
  areaCode: string = 'CN'
) => {
  let countryCode = undefined

  let phoneNumber = fieldValue
  // 未开启国家化短信
  if (!isInternationSms) {
    return { phoneNumber, countryCode: undefined }
  }
  // 处理 类似 192*******9 情况
  if (phone(fieldValue, { country: areaCode }).isValid) {
    const parsePhone = phone(fieldValue, {
      country: areaCode,
    }) as PhoneValidResult

    countryCode = parsePhone.countryCode as string

    phoneNumber = parsePhone.phoneNumber.split(countryCode)[1]
  } else if (phone(fieldValue).isValid) {
    // 处理 +86 19294229909 情况
    const parsePhone = phone(fieldValue) as PhoneValidResult

    countryCode = parsePhone.countryCode as string

    phoneNumber = parsePhone.phoneNumber.split(countryCode)[1]
  }

  return { countryCode, phoneNumber }
}

/**
 *
 * @param config
 * @returns[socialConnectionObjs 社交身份源连接对象 enterpriseConnectionObjs 企业身份源连接对象 isNoMethod 是否没有身份源 ]
 */
export const useMethod: (params: {
  config: GuardLocalConfig
  publicConfig: ApplicationConfig
}) => any = ({ config, publicConfig }) => {
  const noLoginMethods = !config?.loginMethods?.length
  let enterpriseConnectionObjs: ApplicationConfig['identityProviders']
  if (config.enterpriseConnections) {
    enterpriseConnectionObjs =
      publicConfig?.identityProviders?.filter?.((item) =>
        config.enterpriseConnections!.includes(item.identifier)
      ) || []
  } else {
    enterpriseConnectionObjs = publicConfig?.identityProviders || []
  }

  let socialConnectionObjs: SocialConnectionItem[]

  if (!config.socialConnections) {
    socialConnectionObjs = [...(publicConfig?.socialConnections || [])]
  } else {
    const socials = config.socialConnections
    socialConnectionObjs =
      publicConfig?.socialConnections?.filter?.((item) =>
        socials.includes(item.provider)
      ) ?? []
  }

  socialConnectionObjs = socialConnectionObjs
    ?.filter((item) => {
      // 某些社会化登录会在 tabs 中显示，或者无法在 Guard 中使用，所以底部不显示了
      return !HIDE_SOCIALS.includes(item.provider)
    })
    .filter((item: any) => {
      // 某些在企业身份源创建的社交身份源归为企业身份源方式显示
      if (HIDE_SOCIALS_SHOWIN_ENTERPRISE.includes(item.provider)) {
        if (
          !enterpriseConnectionObjs.find(
            (connection: any) => connection.identifier === item.identifier
          )
        ) {
          enterpriseConnectionObjs.push(item)
        }
        return false
      }
      return true
    })
    // 特殊浏览器登录方式
    .filter((item) =>
      isWeChatBrowser()
        ? item.provider === SocialConnectionProvider.WECHATMP
        : item.provider !== SocialConnectionProvider.WECHATMP
    )
    .filter((item) =>
      isDingtalkBrowser()
        ? item.provider !== SocialConnectionProvider.WECHATPC
        : true
    )
    .filter((item) => {
      if (isLarkBrowser()) {
        return (
          item.provider === SocialConnectionProvider.LARK_INTERNAL ||
          item.provider === SocialConnectionProvider.LARK_PUBLIC
        )
      } else {
        return true
      }
    })
    .filter((item) => {
      if (isDingtalkBrowser()) {
        return ![
          SocialConnectionProvider.APPLE,
          SocialConnectionProvider.APPLE_WEB,
          SocialConnectionProvider.ALIPAY,
          SocialConnectionProvider.GOOGLE,
        ].includes(item.provider)
      } else {
        return true
      }
    })
    .filter((item) => {
      if (isQQBrowser()) {
        return (
          ![
            SocialConnectionProvider.APPLE,
            SocialConnectionProvider.APPLE_WEB,
            SocialConnectionProvider.GOOGLE,
          ].includes(item.provider) && !item.provider.includes('wechat')
        )
      } else {
        return true
      }
    })
    .filter((item) => {
      if (isQQBuiltInBrowser()) {
        return ![SocialConnectionProvider.ALIPAY].includes(item.provider)
      } else {
        return true
      }
    })
    .filter((item) => {
      if (isWeWorkBuiltInBrowser()) {
        return ![SocialConnectionProvider.WECHATMP].includes(item.provider)
      } else {
        return true
      }
    })

  const guardWindow = getGuardWindow()

  if (!guardWindow) return

  if (!config?.isHost && (isSpecialBrowser() || !guardWindow.postMessage)) {
    // 嵌入模式下特殊浏览器不显示所有身份源登录
    socialConnectionObjs = []
    enterpriseConnectionObjs = []
  }

  const isNoMethod: boolean =
    noLoginMethods &&
    (!publicConfig?.ssoPageComponentDisplay.socialLoginBtns ||
      !socialConnectionObjs.length) &&
    (!publicConfig?.ssoPageComponentDisplay.idpBtns ||
      !enterpriseConnectionObjs.length)
  return [socialConnectionObjs, enterpriseConnectionObjs, isNoMethod]
}
