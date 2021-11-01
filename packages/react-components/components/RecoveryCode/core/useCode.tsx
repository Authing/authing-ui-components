import { LockOutlined } from '@ant-design/icons'
import { Form, Input } from 'antd'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import SubmitButton from '../../SubmitButton'
import { useGuardHttp } from '../../_utils/guradHttp'

export interface UseCodeProps {
  mfaToken: string
}

export const UseCode: React.FC<UseCodeProps> = ({ mfaToken }) => {
  const { t } = useTranslation()

  const [form] = Form.useForm()

  const { post } = useGuardHttp()

  const onFinish = async () => {
    submitButtonRef.current?.onSpin(true)

    await post(
      '/api/v2/mfa/totp/recovery',
      {
        recoveryCode: form.getFieldValue('recoveryCode'),
      },
      {
        headers: {
          authorization: mfaToken,
        },
      }
    )
  }

  let submitButtonRef = useRef<any>(null)

  return (
    <>
      <p className="authing-g2-mfa-title">{t('common.useRecoverCode')}</p>
      <p className="authing-g2-mfa-tips">{t('common.useRecoveryCodetips')}</p>
      <Form
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
      >
        <Form.Item
          className="authing-g2-input-form"
          name="recoveryCode"
          rules={[
            {
              required: true,
              message: t('login.inputRecoverCode'),
            },
          ]}
        >
          <Input
            className="authing-g2-input"
            autoComplete="email"
            size="large"
            placeholder={t('login.inputRecoverCode')}
            prefix={<LockOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>

        <Form.Item className="authing-g2-input-form submit-form">
          <SubmitButton text={t('common.sure')} ref={submitButtonRef} />
        </Form.Item>
      </Form>
    </>
  )
}
