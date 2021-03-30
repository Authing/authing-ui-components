import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import * as enUsTrans from './en'
import * as zhCnTrans from './zh'

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

export const changeLang = (lang: Lang) => {
  i18n.changeLanguage(lang)
}

export const LANGS = Object.values(Lang)

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
    fallbackLng: Lang.enUs,
    debug: false,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  })

export { i18n }
