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
            props.onLangChange?.('en-US')
            changeLang('en-US')
          } else if (i18n.language === 'en-US') {
            props.onLangChange?.('zh-CN')
            changeLang('zh-CN')
          }
        }}
      >
        <IconFont
          style={{ fontSize: 16 }}
          type={
            i18n.language === 'zh-CN'
              ? 'authing-a-yingwen1'
              : 'authing-zhongwen'
          }
        />
        <span className="g2-change-language-text">{switchText}</span>
      </span>
    </div>
  )
}
