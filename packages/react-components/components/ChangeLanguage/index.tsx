import { Dropdown, Menu } from 'antd'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IconFont } from '../IconFont'
import { Lang } from '../Type'
import { useGuardPageConfig } from '../_utils/context'
import { changeLang } from '../_utils/locales'
import './style.less'

const LngTextMapping: Record<
  Lang,
  {
    label: string
    icon: React.ReactNode
  }
> = {
  'zh-CN': {
    label: '简体中文',
    icon: 'authing-zhongwen',
  },
  'zh-TW': {
    label: '繁体中文',
    icon: 'authing-zhongwen',
  },
  'en-US': {
    label: 'English',
    icon: 'authing-a-yingwen1',
  },
}

export const ChangeLanguage = (props: any) => {
  const { i18n } = useTranslation()

  const guardPageConfig = useGuardPageConfig()

  const onChangeLng = useCallback((lng: Lang) => {
    changeLang(lng)
  }, [])

  const showChangeLng = useMemo(() => {
    return guardPageConfig.global?.showChangeLanguage
  }, [guardPageConfig])

  const currentLng = useMemo<Lang>(() => {
    return i18n.language as Lang
  }, [i18n.language])

  const currentLngText = useMemo(() => {
    return (
      <>
        <IconFont
          type={LngTextMapping[currentLng].icon as string}
          className="lng-svg"
        />
        <span>{LngTextMapping[currentLng].label}</span>
      </>
    )
  }, [currentLng])

  const lngMenu = useMemo(() => {
    const menuItem = Object.keys(LngTextMapping).map((lng) => ({
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
              onClick={() => onChangeLng(key as Lang)}
            >
              <span>{label}</span>
              {isCurrent && <IconFont type="authing-close-line" />}
            </Menu.Item>
          )
        })}
      </Menu>
    )
  }, [currentLng, onChangeLng])

  if (!showChangeLng) {
    return null
  }

  return (
    <div className="g2-change-language-container">
      <Dropdown
        overlay={lngMenu}
        trigger={['click', 'hover']}
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
