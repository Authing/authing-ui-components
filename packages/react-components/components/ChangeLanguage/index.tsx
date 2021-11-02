import React from 'react'
import { useTranslation } from 'react-i18next'
import { IconFont } from '../IconFont'
import { changeLang } from '../_utils/locales'

export const ChangeLanguage = (props: any) => {
  const { i18n } = useTranslation()
  if (props.langRange.length <= 1) {
    return <></>
  }

  let switchText = 'English'
  if (i18n.language === 'en-US') {
    switchText = '简体中文'
  }
  return (
    <div className="g2-change-language-container">
      <span
        className="g2-change-language-button"
        onClick={() => {
          if (i18n.language === 'zh-CN') {
            changeLang('en-US')
            props.onLangChange?.('en-US')
          } else if (i18n.language === 'en-US') {
            changeLang('zh-CN')
            props.onLangChange?.('zh-CN')
          }
        }}
      >
        <IconFont type="authing-global-line" />
        <span className="g2-change-language-text">{switchText}</span>
      </span>
    </div>
  )
}
