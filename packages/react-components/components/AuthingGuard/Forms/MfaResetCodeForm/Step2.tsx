import React, { FC } from 'react'

import { Button, Checkbox, Form } from 'antd'
import { CopyAbleText } from '../../../CopyAbleText'
import { useTranslation } from 'react-i18next'

export interface MfaResetStep2Props {
  recoverCode: string
  onFinish: () => void
}

export const MfaResetStep2: FC<MfaResetStep2Props> = ({
  recoverCode,
  onFinish,
}) => {
  const { t } = useTranslation()
  return (
    <Form onFinish={onFinish}>
      <CopyAbleText className="authing-guard-secret-block">
        {recoverCode}
      </CopyAbleText>
      <Form.Item
        valuePropName="checked"
        rules={[
          {
            validateTrigger: [],
            validator(r, v) {
              return new Promise((resolve, reject) => {
                if (!v) {
                  reject(t('login.confirmSavedCode'))
                }
                resolve(true)
              })
            },
          },
        ]}
        name="MfaCopyRecoverCode"
      >
        <Checkbox>{t('login.rememberedSecret')}</Checkbox>
      </Form.Item>

      <Button
        className="authing-guard-mfa-confirm-btn"
        htmlType="submit"
        block
        type="primary"
        size="large"
      >
        {t('common.sure')}
      </Button>
    </Form>
  )
}
