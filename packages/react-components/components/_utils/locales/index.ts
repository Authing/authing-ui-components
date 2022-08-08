import i18n, { InitOptions, Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import * as enUsTrans from './en-us'
import * as zhCnTrans from './zh-cn'
import * as zhTwTrans from './zh-tw'
import { Lang } from '../../Type'

const LanguageResources: Resource = {
  'en-US': { translation: enUsTrans },
  'zh-CN': { translation: zhCnTrans },
  'zh-TW': { translation: zhTwTrans },
}

export interface InitGuardI18nOptions {
  // 默认显示
  defaultLanguage?: Lang | 'browser'
}

export const initGuardI18n = (options: InitGuardI18nOptions) => {
  const { defaultLanguage } = options

  const detectionOrder: string[] = []

  let lng: Lang | undefined = undefined

  // 如果需要跟随浏览器语言, 则添加到监测顺序
  if (defaultLanguage === 'browser') {
    detectionOrder.push(
      ...[
        'querystring',
        'cookie',
        'navigator',
        'localStorage',
        'htmlTag',
        'path',
        'subdomain',
      ]
    )
  } else {
    // 此处 defaultLanguage 可能为 Lng 也可能是 undefined
    lng = defaultLanguage
  }

  // 统一拼装一下 i18n 的 options
  const i18nOptions: InitOptions = {
    // 默认语言
    lng: lng,
    detection: {
      order: detectionOrder,
    },
    resources: LanguageResources,
    // 兜底语言
    fallbackLng: (code = '') => {
      if (!code || code === 'en') return ['en-US']

      if (!code || code === 'zh') return ['zh-CN']

      const fallbacks = []

      if (code.startsWith('en-')) {
        fallbacks.push(`en-US`)
        return fallbacks
      }

      if (code.startsWith('zh-')) {
        if (
          ['zh-tw', 'zh-hk', 'zh-mo', 'zh-hant'].includes(
            code.toLocaleLowerCase()
          )
        ) {
          fallbacks.push(`zh-TW`)
        } else if (
          ['zh-cn', 'zh-sg', 'zh-my'].includes(code.toLocaleLowerCase())
        ) {
          fallbacks.push(`zh-CN`)
        } else {
          fallbacks.push(`zh-CN`)
        }

        return fallbacks
      }

      return ['en-US']
    },
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  }

  // 开始初始化了嗷~
  i18n.use(LanguageDetector).use(initReactI18next).init(i18nOptions)
}

export { i18n }
