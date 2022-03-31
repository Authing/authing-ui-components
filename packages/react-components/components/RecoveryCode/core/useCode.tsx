import { Form, Input } from 'antd'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { User } from '../..'
import { IconFont } from '../../IconFont'
import SubmitButton from '../../SubmitButton'
import { useGuardIsAuthFlow } from '../../_utils/context'
import { useGuardHttp } from '../../_utils/guardHttp'
import { authFlow, TotpRecoveryCodeBusinessAction } from '../businessRequest'

export interface UseCodeProps {
  mfaToken: string
  onSubmit: (recoveryCode: string, user?: User) => void
}

export const UseCode: React.FC<UseCodeProps> = ({ mfaToken, onSubmit }) => {
  const { t } = useTranslation()

  const isAuthFlow = useGuardIsAuthFlow()

  const [form] = Form.useForm()

  const { post } = useGuardHttp()

  let submitButtonRef = useRef<any>(null)

  const onFinish = async (values: any) => {
    submitButtonRef.current?.onSpin(true)

    if (isAuthFlow) {
      const { data, onGuardHandling, isFlowEnd } = await authFlow<{
        recoveryCode: string
      }>(TotpRecoveryCodeBusinessAction.RecoveryTotp, {
        recoveryCode: values.recoveryCode,
      })

      submitButtonRef.current?.onSpin(false)

      if (isFlowEnd) {
        onSubmit(data!.recoveryCode)
      } else {
        submitButtonRef.current?.onError()

        onGuardHandling?.()
      }
    } else {
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
          // message.error(res.message)
          submitButtonRef.current?.onError()
          res.onGuardHandling?.()
        }
      } catch (error) {
        // TODO: handle error
        submitButtonRef.current?.onError()
      } finally {
        submitButtonRef.current?.onSpin(false)
      }
    }
  }

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
            autoComplete="off"
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
