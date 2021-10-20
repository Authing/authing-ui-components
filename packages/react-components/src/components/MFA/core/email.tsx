import { Input, Button, message } from 'antd'
import { Form } from 'antd'
import { EmailScene, User } from 'authing-js-sdk'
import React, { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { VerifyCodeInput } from 'src/common/VerifyCodeInput'
import { useAuthClient } from 'src/components/Guard/authClient'
import { SendCodeBtn } from 'src/components/SendCode/SendCodeBtn'
import { VALIDATE_PATTERN } from 'src/utils'

const CODE_LEN = 4

interface BindMFAEmailProps {
  mfaToken: string
  onBind: (email: string) => void
}
export const BindMFAEmail: React.FC<BindMFAEmailProps> = ({
  mfaToken,
  onBind,
}) => {
  const { t } = useTranslation()

  const [loading, setLoading] = useState(false)

  const [form] = Form.useForm()

  const authClient = useAuthClient()

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

      console.log('bindable', bindable)
      console.log('onBind', onBind)
      onBind(email)
    } catch (e) {
      const error = JSON.parse(e.message)

      message.error(error.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <h3 className="g2-mfa-title">{t('common.bindEmail')}</h3>
      <p className="g2-mfa-tips">{t('common.bindEmailDoc')}</p>
      <Form
        form={form}
        onFinish={onFinish}
        onSubmitCapture={() => setLoading(true)}
        onFinishFailed={() => setLoading(false)}
      >
        <Form.Item
          className="authing-g2-input-form"
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
          <Input className="authing-g2-input" autoComplete="email" />
        </Form.Item>

        <Button
          className="authing-g2-submit-button email"
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

interface VerifyMFAEmailProps {
  email: string
  mfaToken: string
  onVerify: Function
  sendCodeRef: React.RefObject<HTMLButtonElement>
}

export const VerifyMFAEmail: React.FC<VerifyMFAEmailProps> = ({
  email,
  mfaToken,
  onVerify,
  sendCodeRef,
}) => {
  const { t } = useTranslation()

  const [form] = Form.useForm()

  const [MfaCode, setMFACode] = useState(new Array(CODE_LEN).fill(''))

  const [loading, setLoading] = useState(false)

  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const authClient = useAuthClient()

  const sendVerifyCode = async () => {
    try {
      setSending(true)
      await authClient.sendEmail(email!, EmailScene.MfaVerify)
      setSent(true)
      return true
    } catch (e) {
      return false
    } finally {
      setSending(false)
    }
  }

  const onFinish = async (values: any) => {
    try {
      const user: User = await authClient.mfa.verifyAppEmailMfa({
        mfaToken,
        email: email!,
        code: MfaCode.join(''),
      })

      onVerify({ code: 200, data: user })
    } catch (e) {
      onVerify({ ...e })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h3 className="g2-mfa-title">{t('login.inputEmailCode')}</h3>
      <p className="g2-mfa-tips">
        {sending
          ? t('login.sendingVerifyCode')
          : sent
          ? `${t('login.verifyCodeSended')} ${email}`
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

        <SendCodeBtn btnRef={sendCodeRef} beforeSend={() => sendVerifyCode()} />

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

export const MFAEmail: React.FC<{
  mfaToken: string
  email?: string
}> = ({ email: userEmail, mfaToken }) => {
  const [email, setEmail] = useState(userEmail)
  const sendCodeRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      {email ? (
        <VerifyMFAEmail
          mfaToken={mfaToken}
          email={email}
          onVerify={() => {
            console.log('验证成功')
          }}
          sendCodeRef={sendCodeRef}
        />
      ) : (
        <BindMFAEmail
          mfaToken={mfaToken}
          onBind={(email: string) => {
            console.log('email', email)
            setEmail(email)
            sendCodeRef.current?.click()
          }}
        />
      )}
    </>
  )
}
