import React, { FC, useState } from 'react'
import { Button, Form, Input, message } from 'antd'

import { useGuardContext } from '../../../context/global/context'
import { MFACheckPhoneFormProps } from '../../types'

import './style.less'
import { VALIDATE_PATTERN } from '../../../_utils'
import { useTranslation } from 'react-i18next'

export const CheckPhoneForm: FC<MFACheckPhoneFormProps> = ({
  onSuccess,
  mfaToken,
}) => {
  const {
    state: { authClient },
  } = useGuardContext()
  const { t } = useTranslation()

  const [rawForm] = Form.useForm()

  const [loading, setLoading] = useState(false)

  const onFinish = async ({ phone }: any) => {
    try {
      const bindable = await authClient.mfa.phoneOrEmailBindable({
        mfaToken,
        phone,
      })
      if (!bindable) {
        message.error(
          t('common.unBindEmaileDoc', {
            email: phone,
          })
        )
        return
      }
      onSuccess(phone!)
    } catch (e) {
      // do nothing
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h3 className="authing-guard-mfa-title">{t('common.bindPhone')}</h3>
      <p className="authing-guard-mfa-tips">{t('login.bindPhoneInfo')}</p>
      <Form
        className="authing-mfa-check-phone-from"
        form={rawForm}
        onSubmitCapture={() => setLoading(true)}
        onFinish={onFinish}
        onFinishFailed={() => setLoading(false)}
      >
        <Form.Item
          name="phone"
          rules={[
            {
              required: true,
              message: t('login.inputPhone'),
            },
            {
              pattern: VALIDATE_PATTERN.phone,
              message: t('login.phoneError'),
            },
          ]}
        >
          <Input size="large" placeholder={t('login.inputPhone')} />
        </Form.Item>

        <Button
          className="authing-guard-mfa-confirm-btn"
          loading={loading}
          block
          htmlType="submit"
          type="primary"
          size="large"
        >
          {t('common.sure')}
        </Button>
      </Form>
    </>
  )
}
