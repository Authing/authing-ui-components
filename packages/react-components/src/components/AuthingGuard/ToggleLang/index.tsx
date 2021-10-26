import React, { FC } from 'react'
import { Dropdown, Menu, Space } from 'antd'
import { LANG_MAP } from '../types'
import { useTranslation } from 'react-i18next'
import { changeLang } from '../../_utils/locales'
import { useGuardContext } from '../../context/global/context'
import { IconFont } from '../IconFont'

export const ToggleLang: FC = () => {
  const {
    state: { authClient },
  } = useGuardContext()

  const onClick = ({ key }: any) => {
    changeLang(key)
    authClient.setLang(key)
  }
  const { i18n } = useTranslation()

  return (
    <Dropdown
      className="authing-toggle-language"
      overlay={
        <Menu onClick={onClick}>
          {LANG_MAP.map((item) => (
            <Menu.Item key={item.value}>{item.label}</Menu.Item>
          ))}
        </Menu>
      }
    >
      <Space
        size={1}
        style={{
          alignSelf: 'center',
          color: '#999',
          marginTop: 24,
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        <IconFont type="authing-yuyan" />
        <span>
          {
            LANG_MAP.find((item) => item.value === (i18n.language || 'zh-CN'))
              ?.label
          }
        </span>
      </Space>
    </Dropdown>
  )
}
