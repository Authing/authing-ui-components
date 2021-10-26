import React, { FC, useState } from 'react'
import { Button, Form, Input, message } from 'antd'
import { useGuardContext } from '../../../context/global/context'
import { MFACheckEmailFormProps } from '../../types'
import './style.less'
import { useTranslation } from 'react-i18next'
import { VALIDATE_PATTERN } from '../../../_utils'

export const CheckEmailForm: FC<MFACheckEmailFormProps> = ({
  onSuccess,
  mfaToken,
}) => {
  const {
    state: { authClient },
  } = useGuardContext()

  const { t } = useTranslation()

  const [rawForm] = Form.useForm()

  const [loading, setLoading] = useState(false)

  const onFinish = async ({ email }: any) => {
    try {
      const bindable = await authClient.mfa.phoneOrEmailBindable({
        mfaToken,
        email,
      })
      if (!bindable) {
        message.error(
          t('common.unBindEmaileDoc', {
            email: email,
          })
        )
        return
      }
      onSuccess(email!)
    } catch (e) {
      // do nothing
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h3 className="authing-guard-mfa-title">{t('common.bindEmail')}</h3>
      <p className="authing-guard-mfa-tips">{t('common.bindEmailDoc')}</p>
      <Form
        form={rawForm}
        onSubmitCapture={() => setLoading(true)}
        onFinish={onFinish}
        onFinishFailed={() => setLoading(false)}
      >
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: t('login.inputEmail'),
            },
            {
              pattern: VALIDATE_PATTERN.email,
              message: t('login.emailError'),
            },
          ]}
        >
          <Input placeholder={t('login.inputEmail')}></Input>
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
