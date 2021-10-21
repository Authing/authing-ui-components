import { Input, Button, message } from 'antd'
import { Form } from 'antd'
import { User } from 'authing-js-sdk'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { VerifyCodeInput } from 'src/common/VerifyCodeInput'
import { useAuthClient } from 'src/components/Guard/authClient'
import { SendCodeBtn } from 'src/components/SendCode/SendCodeBtn'
import { VALIDATE_PATTERN } from 'src/utils'

const CODE_LEN = 4

export interface BindMFASmsProps {
  mfaToken: string
  onBind: (phone: string) => void
}

export const BindMFASms: React.FC<BindMFASmsProps> = ({ mfaToken, onBind }) => {
  const { t } = useTranslation()

  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)

  const authClient = useAuthClient()

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

      onBind(phone)
    } catch (e) {
      // do nothing
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h3 className="authing-g2-mfa-title">{t('common.bindPhone')}</h3>
      <p className="authing-g2-mfa-tips">{t('login.bindPhoneInfo')}</p>
      <Form
        form={form}
        onSubmitCapture={() => setLoading(true)}
        onFinish={onFinish}
        onFinishFailed={() => setLoading(false)}
      >
        <Form.Item
          className="authing-g2-input-form"
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
          <Input className="authing-g2-input" />
        </Form.Item>

        <Button
          className="authing-g2-submit-button"
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

export interface VerifyMFASmsProps {
  mfaToken: string
  phone: string
  onVerify: Function
  sendCodeRef: React.RefObject<HTMLButtonElement>
}

export const VerifyMFASms: React.FC<VerifyMFASmsProps> = ({
  mfaToken,
  phone,
  sendCodeRef,
}) => {
  const { t } = useTranslation()

  const [form] = Form.useForm()

  const authClient = useAuthClient()

  const [MfaCode, setMFACode] = useState(new Array(CODE_LEN).fill(''))
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const onFinish = async (values: any) => {
    try {
      const user: User = await authClient.mfa.verifyAppSmsMfa({
        mfaToken,
        phone: phone!,
        code: MfaCode.join(''),
      })
      // TODO
    } catch (e) {
      // TODO
    } finally {
      setLoading(false)
    }
  }

  const sendVerifyCode = async () => {
    setSending(true)
    try {
      await authClient.sendSmsCode(phone!)
      setSent(true)
      return true
    } catch (e) {
      return false
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <h3 className="authing-g2-mfa-title">{t('login.inputPhoneCode')}</h3>
      <p className="authing-g2-mfa-tips">
        {sending
          ? t('login.sendingVerifyCode')
          : sent
          ? `${t('login.verifyCodeSended')} ${phone}`
          : t('login.clickSent')}
      </p>
      <Form
        form={form}
        onSubmitCapture={() => setLoading(true)}
        onFinish={onFinish}
        onFinishFailed={() => setLoading(false)}
      >
        <Form.Item
          name="mfaCode"
          rules={[
            {
              validateTrigger: [],
              validator() {
                if (MfaCode.some((item) => !item)) {
                  return Promise.reject(t('login.inputFullMfaCode'))
                }
                return Promise.resolve()
              },
            },
          ]}
        >
          <VerifyCodeInput
            length={CODE_LEN}
            verifyCode={MfaCode}
            setVerifyCode={setMFACode}
          />
        </Form.Item>

        <SendCodeBtn
          btnRef={sendCodeRef}
          beforeSend={() => sendVerifyCode()}
          type="link"
        />

        <Button
          className="authing-g2-submit-button g2-mfa-submit-button"
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

export const MFASms: React.FC<{
  mfaToken: string
  phone?: string
}> = ({ phone: userPhone, mfaToken }) => {
  const [phone, setPhone] = useState(userPhone)
  const sendCodeRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      {phone ? (
        <VerifyMFASms
          mfaToken={mfaToken}
          phone={phone}
          onVerify={() => {
            console.log('验证成功')
          }}
          sendCodeRef={sendCodeRef}
        />
      ) : (
        <BindMFASms
          mfaToken={mfaToken}
          onBind={(phone: string) => {
            setPhone(phone)
            sendCodeRef.current?.click()
          }}
        />
      )}
    </>
  )
}