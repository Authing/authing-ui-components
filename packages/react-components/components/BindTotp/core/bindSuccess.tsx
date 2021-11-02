import { Form, Checkbox, Typography } from 'antd'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import SubmitButton from '../../SubmitButton'

const { Paragraph } = Typography

export interface BindSuccessProps {
  onBind: any
  secret: string
}

export const BindSuccess: React.FC<BindSuccessProps> = ({ secret, onBind }) => {
  // const [isSaved, setIsSaved] = useState(false)
  const submitButtonRef = useRef<any>(null)
  const [form] = Form.useForm()

  const { t } = useTranslation()

  const bindSuccess = async () => {
    submitButtonRef.current?.onSpin(true)
    try {
      await form.validateFields()
      submitButtonRef.current?.onSpin(true)
      onBind()
    } finally {
      submitButtonRef.current?.onSpin(true)
    }
  }

  return (
    <>
      <p className="authing-g2-mfa-title">{t('common.totpText1')}</p>
      <p className="authing-g2-mfa-tips">{t('common.totpText2')}</p>

      <div className="g2-mfa-bindTotp-copySecret">
        <Paragraph copyable>{secret}</Paragraph>
      </div>

      <Form form={form} onFinish={bindSuccess} style={{ width: '100%' }}>
        <Form.Item
          className="authing-g2-input-form"
          name="remember"
          rules={[
            {
              required: true,
              message: t('common.pleaseRecordKey'),
            },
          ]}
          valuePropName="checked"
        >
          <Checkbox className="g2-mfa-bindTotp-secretSave">
            {t('login.rememberedSecret')}
          </Checkbox>
        </Form.Item>

        <SubmitButton text={t('common.bindSuccess')} ref={submitButtonRef} />
      </Form>
    </>
  )
}
