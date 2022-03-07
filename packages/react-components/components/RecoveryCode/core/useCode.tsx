import { Form, Input, message } from 'antd'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { User } from '../..'
import { IconFont } from '../../IconFont'
import SubmitButton from '../../SubmitButton'
import { useGuardHttp } from '../../_utils/guardHttp'

export interface UseCodeProps {
  mfaToken: string
  onSubmit: (recoveryCode: string, user: User) => void
}

export const UseCode: React.FC<UseCodeProps> = ({ mfaToken, onSubmit }) => {
  const { t } = useTranslation()

  const [form] = Form.useForm()

  const { post } = useGuardHttp()

  const onFinish = async () => {
    submitButtonRef.current?.onSpin(true)

    try {
      const res = await post(
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
      if (res.code === 200) {
        // @ts-ignore
        onSubmit(res.recoveryCode, res.data)
      } else {
        message.error(res.message)
        submitButtonRef.current?.onError()
      }
    } catch (error) {
      // TODO: handle error
      submitButtonRef.current?.onError()
    } finally {
      submitButtonRef.current?.onSpin(false)
    }
  }

  let submitButtonRef = useRef<any>(null)

  return (
    <>
      <p className="authing-g2-mfa-title">{t('common.useRecoverCode')}</p>
      <p className="authing-g2-mfa-tips">{t('login.mfaAfterReset')}</p>
      <Form
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
      >
        <Form.Item
          validateTrigger={['onBlur', 'onChange']}
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
            prefix={
              <IconFont
                type="authing-a-lock-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </Form.Item>

        <Form.Item className="authing-g2-input-form submit-form">
          <SubmitButton text={t('common.sure')} ref={submitButtonRef} />
        </Form.Item>
      </Form>
    </>
  )
}
