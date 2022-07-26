import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import * as enUsTrans from './en'
import * as zhCnTrans from './zh-cn'
import * as zhTwTrans from './zh-tw'
import { LocalesConfig, Lang } from '../../AuthingGuard/types'
import { getGuardWindow } from '../../Guard/core/useAppendConfig'

let langChangeFN: (lang: Lang) => void = () => {}

export const changeLang = (lang: Lang) => {
  i18n.changeLanguage(lang)
  langChangeFN && langChangeFN(lang)
}

const initI18n = (localesConfig: LocalesConfig = {}, lang?: string) => {
  let initLang: 'zh-CN' | 'en-US' = 'zh-CN'

  const guardWindow = getGuardWindow()

  if (guardWindow) {
    initLang =
      guardWindow?.navigator?.language?.split('-')?.[0] === 'zh'
        ? 'zh-CN'
        : 'en-US'
  }

  if (Boolean(i18n.language)) {
    i18n.changeLanguage(lang)
  } else {
    i18n
      .use(LanguageDetector) // 监测当前浏览器语言
      .use(initReactI18next) // 初始化 i18n
      .init({
        detection: {
          order: [],
        },
        resources: {
          'en-US': {
            translation: enUsTrans,
          },
          'zh-CN': {
            translation: zhCnTrans,
          },
          'zh-TW': {
            translation: zhTwTrans,
          },
        },
        fallbackLng: lang ?? initLang,
        debug: false,
        interpolation: {
          escapeValue: false, // react already safes from xss
        },
      })
    if (localesConfig.onChange) {
      langChangeFN = localesConfig.onChange
    }
  }
}

export { i18n, initI18n }
