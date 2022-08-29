import { Dropdown, Menu } from 'antd'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IconFont } from '../IconFont'
import { Lang } from '../Type'
import { useGuardPageConfig } from '../_utils/context'
import './style.less'

export const LngTextMapping: Record<
  Lang,
  {
    label: string
  }
> = {
  'zh-CN': {
    label: '简体中文',
  },
  'zh-TW': {
    label: '繁體中文',
  },
  'en-US': {
    label: 'English',
  },
}

export const ChangeLanguage = (props: {
  onLangChange?: (lang: Lang) => void
  langRange?: string[]
}) => {
  const { langRange = ['zh-CN', 'zh-TW', 'en-US'] } = props

  const { onLangChange } = props
  const { i18n } = useTranslation()
  const guardPageConfig = useGuardPageConfig()

  const onChangeLng = useCallback(
    (lng: Lang) => {
      i18n.changeLanguage(lng)
      onLangChange?.(lng)
    },
    [i18n, onLangChange]
  )

  const showChangeLng = useMemo(() => {
    return guardPageConfig.global?.showChangeLanguage
  }, [guardPageConfig])

  const currentLng = useMemo<Lang>(() => {
    if (Object.keys(LngTextMapping).includes(i18n.language)) {
      return i18n.language as Lang
    } else {
      return (i18n.languages?.[i18n.languages?.length - 1] || 'en-US') as Lang
    }
  }, [i18n.language, i18n.languages])

  const currentLngText = useMemo(() => {
    return (
      <>
        <span>{LngTextMapping[currentLng].label}</span>
      </>
    )
  }, [currentLng])

  const lngMenu = useMemo(() => {
    let menuItem: {
      key: string
      label: string
    }[] = []

    if (langRange) {
      menuItem = Object.keys(LngTextMapping)
        .filter((lng) => langRange.includes(lng as Lang))
        .map((lng) => ({
          key: lng,
          label: LngTextMapping[lng as Lang].label,
        }))
    }
    menuItem = Object.keys(LngTextMapping).map((lng) => ({
      key: lng,
      label: LngTextMapping[lng as Lang].label,
    }))

    return (
      <Menu>
        {menuItem.map(({ key, label }) => {
          const isCurrent = key === currentLng

          return (
            <Menu.Item
              key={key}
              className={isCurrent ? 'select' : ''}
              onClick={() => {
                if (currentLng !== key) {
                  onChangeLng(key as Lang)
                }
              }}
            >
              <span>{label}</span>
              {isCurrent && <IconFont type="authing-check-fill" />}
            </Menu.Item>
          )
        })}
      </Menu>
    )
  }, [currentLng, langRange, onChangeLng])

  if (!showChangeLng || langRange.length === 0) {
    return null
  }

  return (
    <div className="g2-change-language-container">
      <Dropdown
        overlay={lngMenu}
        trigger={['click']}
        placement="bottomCenter"
        overlayClassName="authing-g2-change-language-menu"
        getPopupContainer={(node) => {
          if (node?.parentElement) {
            return node.parentElement
          }
          return node
        }}
      >
        <span className="g2-change-language-text">
          {currentLngText}
          <IconFont
            type="authing-arrow-down-s-fill"
            className="down-fill-svg"
          />
        </span>
      </Dropdown>
    </div>
  )
}
