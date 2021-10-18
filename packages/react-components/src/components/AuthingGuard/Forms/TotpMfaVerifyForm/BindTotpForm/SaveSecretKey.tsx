import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Checkbox, Typography, Space } from 'antd'

const { Paragraph } = Typography

export const SaveSecretKey: FC<{
  setIsSaved: Function
  isSaved: boolean
  secret: string
}> = ({ secret, isSaved, setIsSaved }) => {
  const { t } = useTranslation()

  const handleChange = (val: boolean) => {
    setIsSaved(val)
  }
  return (
    <Space size={16} direction="vertical">
      <h4 className="subtitle">{t('user.saveSecret')}</h4>
      <p className={'desc'}>{t('user.resetCodeDoWhat')}</p>

      <Paragraph className={'secretParagraph'} copyable>
        {secret}
      </Paragraph>

      <Checkbox
        onChange={(evt: any) => handleChange(evt.target.checked)}
        checked={isSaved}
      >
        {t('login.rememberedSecret')}
      </Checkbox>
    </Space>
  )
}
