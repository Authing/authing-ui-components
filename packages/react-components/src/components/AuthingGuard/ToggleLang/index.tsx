import React, { FC } from 'react'
import { Dropdown, Menu, Space } from 'antd'
import { LANG_MAP } from '../types'
import { useTranslation } from 'react-i18next'
import { changeLang } from '../locales'

export const ToggleLang: FC = () => {
  const onClick = ({ key }: any) => {
    changeLang(key)
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
        size={6}
        style={{
          alignSelf: 'center',
          color: '#999',
          marginTop: 24,
          cursor: 'pointer',
        }}
      >
        {
          LANG_MAP.find((item) => item.value === (i18n.language || 'zh-CN'))
            ?.label
        }
      </Space>
    </Dropdown>
  )
}
