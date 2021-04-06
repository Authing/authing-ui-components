import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import * as enUsTrans from './en'
import * as zhCnTrans from './zh'
import { LocalesConfig } from '../types'

export enum Lang {
  zhCn = 'zh-CN',
  enUs = 'en-US',
}

export const LANG_MAP = [
  {
    label: '中文',
    value: Lang.zhCn,
  },
  {
    label: 'English',
    value: Lang.enUs,
  },
]

let langChangeFN: (lang: Lang) => void = () => {}

export const changeLang = (lang: Lang) => {
  i18n.changeLanguage(lang)
  langChangeFN && langChangeFN(lang)
}

export const LANGS = Object.values(Lang)

const initI18n = (localesConfig: LocalesConfig) => {
  if (!i18n.language) {
    i18n
      .use(LanguageDetector) // 监测当前浏览器语言
      .use(initReactI18next) // 初始化 i18n
      .init({
        detection: {
          order: [],
        },
        resources: {
          [Lang.enUs]: {
            translation: enUsTrans,
          },
          [Lang.zhCn]: {
            translation: zhCnTrans,
          },
        },
        fallbackLng: localesConfig.defaultLang,
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
