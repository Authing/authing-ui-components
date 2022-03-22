import { useEffect } from 'react'
import { Rule } from 'antd/lib/form'
import qs from 'qs'
import { useGuardContext } from '../context/global/context'
import { i18n } from './locales'
import { RegisterMethods, User } from 'authing-js-sdk'
import { ApplicationConfig, ComplateFiledsPlace } from '../AuthingGuard/api'
export * from './popupCenter'
export * from './clipboard'

export const VALIDATE_PATTERN = {
  // https://emailregex.com/
  // eslint-disable-next-line no-control-regex
  // email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  // https://cloud.tencent.com/developer/article/1751120
  email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
  //   以下的来自 authing-user-portal 项目
  phone: /^1[3-9]\d{9}$/,
  ip: /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/,
  host: /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+.?$/,
  username: /.?/,
} as const

export const validate = (type: keyof typeof VALIDATE_PATTERN, val: string) => {
  return VALIDATE_PATTERN[type].test(val)
}

export const getRequiredRules = (msg: string): Rule[] => {
  return [
    {
      required: true,
      message: msg,
    },
  ]
}

export const fieldRequiredRule = (
  fieldRequiredRule: string,
  fieldRequiredRuleMessage?: string
): Rule[] => {
  return [
    {
      required: true,
      validateTrigger: ['onChange'],
      message:
        fieldRequiredRuleMessage ||
        i18n.t('common.isMissing', {
          name: fieldRequiredRule,
        }),
      whitespace: true,
    },
  ]
}

export function getDeviceName() {
  if (typeof window === 'undefined') {
    return null
  }

  const userAgent = window.navigator.userAgent
  const platform = window.navigator.platform
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
  const iosPlatforms = ['iPhone', 'iPad', 'iPod']

  let os = null

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS'
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS'
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows'
  } else if (/Android/.test(userAgent)) {
    os = 'Android'
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux'
  }

  return os
}

export type STYLE_RECORD_KEY = 'appConfig' | 'userConfig'

/**
 * 传对象 {'background-color': 'red'}
 * 传字符串 "CSS 样式"
 */
const insertedRecord: Record<STYLE_RECORD_KEY, any> = {
  appConfig: null,
  userConfig: null,
}
export const insertStyles = (
  styles: string | any,
  recordKey?: STYLE_RECORD_KEY
) => {
  let styleElt, styleSheet
  if ((document as any).createStyleSheet) {
    // IE
    styleSheet = (document as any).createStyleSheet()
  } else {
    let head = document.getElementsByTagName('head')[0]
    styleElt = document.createElement('style')
    head.appendChild(styleElt)
    styleSheet = document.styleSheets[document.styleSheets.length - 1]
  }
  if (typeof styles === 'string') {
    if (styleElt) styleElt.innerHTML = styles
    else styleSheet.cssText = styles // IE
  } else {
    let i = 0
    for (let selector in styles) {
      if (styleSheet.insertRule) {
        let rule = selector + ' {' + styles[selector] + '}'
        styleSheet.insertRule(rule, i++)
      } else {
        styleSheet.addRule(selector, styles[selector], i++)
      }
    }
  }

  if (recordKey) {
    insertedRecord[recordKey] = styleElt
  }
}

export const removeStyles = (recordKey: STYLE_RECORD_KEY) => {
  if (!insertedRecord[recordKey]) {
    return
  }

  const styleElt = insertedRecord[recordKey]

  styleElt.parentNode?.removeChild(styleElt)

  insertedRecord[recordKey] = null
}

export const useTitle = (title: string, prefix?: string) => {
  const {
    state: { config },
  } = useGuardContext()

  useEffect(() => {
    document.title = `${prefix ?? `${config.title} `} ${title}`
  }, [config.title, prefix, title])
}

export const getClassnames = (classnames: (string | boolean | undefined)[]) => {
  return classnames.filter(Boolean).join(' ')
}

/**
 * https://www.itranslater.com/qa/details/2115518846294557696
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * https://www.itranslater.com/qa/details/2115518846294557696
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function deepMerge<T extends any = any>(
  target: T,
  ...sources: any[]
): T {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        // @ts-ignore
        if (!target[key]) {
          Object.assign(target, { [key]: {} })
        }
        // @ts-ignore
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

export const getUserRegisterParams = () => {
  const query = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  })
  return Object.keys(query).map((key) => ({
    key,
    value: query[key],
  }))
}

export const isWechatBrowser = () =>
  /MicroMessenger/i.test(navigator?.userAgent)
export const isLarkBrowser = () => /Lark/i.test(navigator.userAgent)
export const assembledAppHost = (identifier: string, host: string) => {
  const hostUrl = new URL(host)

  const splitHost = hostUrl.hostname.split('.')

  const port = hostUrl.port

  splitHost.shift()

  return `${hostUrl.protocol}//${identifier}.${splitHost.join('.')}${
    port && `:${port}`
  }`
}

// 拼接请求链接
export const assembledRequestHost = (
  requestHostname: string,
  configHost: string
) => {
  const identifier = requestHostname.split('.')[0]

  const hostUrl = new URL(configHost)
  const splitHost = hostUrl.hostname.split('.')

  splitHost.shift()

  // 看看是否有端口号
  const port = hostUrl.port

  return `${hostUrl.protocol}//${identifier}.${splitHost.join('.')}${
    port && `:${port}`
  }`
}

export enum PasswordStrength {
  NoCheck,
  Low,
  Middle,
  High,
  AUTO,
}

export const PASSWORD_STRENGTH_TEXT_MAP: Record<
  PasswordStrength,
  {
    placeholder: () => string
    validateMessage: () => string
  }
> = {
  [PasswordStrength.NoCheck]: {
    placeholder: () => i18n.t('login.inputPwd'),
    validateMessage: () => i18n.t('login.inputPwd'),
  },
  [PasswordStrength.Low]: {
    placeholder: () => i18n.t('login.setPwdLimit1'),
    validateMessage: () => i18n.t('login.setPwdLimitMsg1'),
  },
  [PasswordStrength.Middle]: {
    placeholder: () => i18n.t('login.login.setPwdLimit2'),
    validateMessage: () => i18n.t('login.setPwdLimitMsg2'),
  },
  [PasswordStrength.High]: {
    placeholder: () => i18n.t('login.login.setPwdLimit3'),
    validateMessage: () => i18n.t('login.setPwdLimitMsg3'),
  },
  [PasswordStrength.AUTO]: {
    placeholder: () => i18n.t('login.inputPwd'),
    validateMessage: () => i18n.t('login.inputPwd'),
  },
}

const SYMBOL_TYPE_PATTERNS = [
  /\d+/,
  /[a-zA-Z]/,
  /[-!$%^&*()_+|~=`{}[\]:";'<>?,@./]/,
]

export const getSymbolTypeLength = (pwd: string) => {
  return SYMBOL_TYPE_PATTERNS.map((pattern) => pattern.test(pwd)).filter(
    (item) => item
  ).length
}

export const getPasswordValidate = (
  strength: PasswordStrength = PasswordStrength.NoCheck,
  customPasswordStrength: any = {},
  fieldRequiredRuleMessage?: string
): Rule[] => {
  const required = [
    ...fieldRequiredRule(i18n.t('common.password'), fieldRequiredRuleMessage),
    {
      validateTrigger: 'onBlur',
      validator(_: any, value: any) {
        if ((value ?? '').indexOf(' ') !== -1) {
          return Promise.reject(i18n.t('common.checkPasswordHasSpace'))
        }
        return Promise.resolve()
      },
    },
  ]

  const validateMap: Record<PasswordStrength, Rule[]> = {
    [PasswordStrength.NoCheck]: [...required],
    [PasswordStrength.Low]: [
      ...required,
      {
        validateTrigger: 'onBlur',
        validator(r, v) {
          if (v && v.length < 6) {
            return Promise.reject(
              PASSWORD_STRENGTH_TEXT_MAP[PasswordStrength.Low].validateMessage()
            )
          }
          return Promise.resolve()
        },
      },
    ],
    [PasswordStrength.Middle]: [
      ...required,
      {
        validateTrigger: 'onBlur',
        validator(r, v) {
          if (v && (v.length < 6 || getSymbolTypeLength(v) < 2)) {
            return Promise.reject(
              PASSWORD_STRENGTH_TEXT_MAP[
                PasswordStrength.Middle
              ].validateMessage()
            )
          }
          return Promise.resolve()
        },
      },
    ],
    [PasswordStrength.High]: [
      ...required,
      {
        validateTrigger: 'onBlur',
        validator(r, v) {
          if (v && (v.length < 6 || getSymbolTypeLength(v) < 3)) {
            return Promise.reject(
              PASSWORD_STRENGTH_TEXT_MAP[
                PasswordStrength.High
              ].validateMessage()
            )
          }
          return Promise.resolve(true)
        },
      },
    ],
    [PasswordStrength.AUTO]: [
      ...required,
      {
        validateTrigger: 'onBlur',
        pattern: customPasswordStrength?.regex,
        message: customPasswordStrength?.message,
      },
    ],
  }

  return validateMap[strength]
}

export const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay))

export const shoudGoToComplete = (
  user: User,
  contextType: ComplateFiledsPlace,
  config: ApplicationConfig | undefined,
  autoRegister?: boolean //是否登录注册合并
) => {
  // console.log('需要补全吗？', user, contextType, config)
  // 先判断开关，再对比字段。
  let needGo = false
  // 判断新版本
  if (
    config?.complateFiledsPlace?.length &&
    config.complateFiledsPlace.includes(contextType) &&
    config?.extendsFields &&
    config?.extendsFields?.length > 0
  ) {
    needGo = true
  }

  //autoRegister 开启注册登录合并后 就不区分登录注册场景 只要 complateFiledsPlace 有值即可

  if (
    autoRegister &&
    config?.complateFiledsPlace?.length &&
    config?.extendsFields &&
    config?.extendsFields?.length > 0
  ) {
    needGo = true
  }
  // 兼容老版本
  if (
    !config?.complateFiledsPlace?.length &&
    config?.extendsFieldsEnabled &&
    config?.extendsFields &&
    config?.extendsFields?.length > 0
  ) {
    needGo = true
  }
  // 对比字段
  const allFieldsToComp = config?.extendsFields
  if (
    needGo &&
    contextType === 'register' &&
    allFieldsToComp &&
    allFieldsToComp.length > 0
  ) {
    if (
      user.email &&
      allFieldsToComp?.length === 1 &&
      allFieldsToComp[0]?.type === 'internal' &&
      allFieldsToComp[0]?.name === 'email'
    ) {
      return false
    }
    if (
      user.phone &&
      allFieldsToComp?.length === 1 &&
      allFieldsToComp[0]?.type === 'internal' &&
      allFieldsToComp[0]?.name === 'phone'
    ) {
      return false
    }
    return true
  }
  if (
    needGo &&
    contextType === 'login' &&
    allFieldsToComp &&
    allFieldsToComp.length > 0
  ) {
    // console.log('判断补全')
    // TODO 自动注册登录
    needGo = false
    const userFields = allFieldsToComp.filter(
      (item) => item.type === 'internal'
    )
    const udvs = allFieldsToComp.filter((item) => item.type !== 'internal')
    for (const f of userFields) {
      const currKey = f.name
      // gender 特例
      if (currKey === 'gender' && user['gender'] === 'U') {
        needGo = true
        break
      }
      //@ts-ignore
      if (!user[currKey] || user[currKey] === '') {
        needGo = true
        break
      }
    }
    if (!needGo) {
      const { customData } = user
      if (customData) {
        for (const f of udvs) {
          if (!customData[f.name] || customData[f.name] === '') {
            needGo = true
            break
          }
        }
      }
    }
  }
  return needGo
}

export const tabSort = (
  defaultValue: RegisterMethods,
  tabList: RegisterMethods[]
): RegisterMethods[] => {
  const index = tabList.indexOf(defaultValue)
  const element = tabList.splice(index, 1)[0]
  tabList.unshift(element)
  return tabList
}

export const mailDesensitization = (mail: string) => {
  const mailArr = mail.split('@')
  const mailName = mailArr[0].substr(0, 1) + '***'
  return mailName + '@' + mailArr[1]
}

export const phoneDesensitization = (phone: string) => {
  return phone.replace(/(\d{3})\d*(\d{4})/, '$1****$2')
}

export const getHundreds = (num: number) => {
  return Math.floor(num / 100)
}
