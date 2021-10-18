import React, { FC } from 'react'
import { Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { VerifyCodeInput } from '../../../../../common/VerifyCodeInput'

export const InputSaftyCode: FC<{
  saftyCode: string[]
  isPhoneMedia: boolean
  setSaftyCode: (code: string[]) => void
}> = ({ saftyCode, setSaftyCode, isPhoneMedia }) => {
  const { t } = useTranslation()

  return (
    <Space size={14} direction="vertical">
      <h4 className={'subtitle'}>{t('user.inputSafteyCode')}</h4>
      <p className={'desc'}>{t('user.viewInputSixCode')}</p>
      <VerifyCodeInput
        className={'saftyCodeInput'}
        verifyCode={saftyCode}
        setVerifyCode={setSaftyCode}
      />
      <p className={'saftyCodeTip'}>{t('user.numberSafteyCode')}</p>
    </Space>
  )
}
