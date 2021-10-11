import { useEffect } from 'react'
import { Rule } from 'antd/lib/form'
import { useGuardContext } from '../context/global/context'
import qs from 'qs'

export * from './popupCenter'
export * from './clipboard'

export const VALIDATE_PATTERN = {
  // https://emailregex.com/
  // eslint-disable-next-line no-control-regex
  email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  //   以下的来自 authing-user-portal 项目
  phone: /^1[3-9]\d{9}$/,
  ip: /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/,
  host: /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+.?$/,
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
  recordKey: STYLE_RECORD_KEY
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

  insertedRecord[recordKey] = styleElt
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
