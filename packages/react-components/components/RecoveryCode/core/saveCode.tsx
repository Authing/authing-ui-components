import { Checkbox, Form, Typography } from 'antd'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import SubmitButton from '../../SubmitButton'

const { Paragraph } = Typography

export const SaveCode: React.FC<{
  secret: string
  onBind: any
}> = (props) => {
  const { secret, onBind } = props
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const submitButtonRef = useRef<any>(null)

  const bindSuccess = async () => {
    submitButtonRef.current?.onSpin(true)
    try {
      await form.validateFields()
      onBind()
    } catch (e: any) {
      submitButtonRef.current?.onError()
    } finally {
      submitButtonRef.current?.onSpin(false)
    }
  }

  return (
    <>
      <p className="authing-g2-mfa-title">{t('common.useRecoverCode')}</p>
      <p className="authing-g2-mfa-tips">{t('common.totpGenerateCode')}</p>

      <div className="g2-mfa-bindTotp-copySecret">
        <Paragraph copyable>{secret}</Paragraph>
      </div>

      <Form
        form={form}
        onFinish={bindSuccess}
        style={{ width: '100%' }}
        onFinishFailed={() => submitButtonRef.current?.onError()}
      >
        <Form.Item
          className="authing-g2-input-form g2-mfa-totp-recoveryCode-input"
          name="remember"
          rules={[
            {
              validator: (_, value) => {
                if (!value) {
                  return Promise.reject(t('common.pleaseRecordKey'))
                }
                return Promise.resolve()
              },
            },
          ]}
          valuePropName="checked"
        >
          <Checkbox className="g2-mfa-bindTotp-secretSave">
            {t('login.rememberedSecret')}
          </Checkbox>
        </Form.Item>

        <SubmitButton text={t('common.confirm')} ref={submitButtonRef} />
      </Form>
    </>
  )
}
