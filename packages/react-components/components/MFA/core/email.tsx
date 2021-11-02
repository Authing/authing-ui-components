import { UserOutlined } from '@ant-design/icons'
import { Input, message as Message } from 'antd'
import { Form } from 'antd'
import { EmailScene, User } from 'authing-js-sdk'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { VerifyCodeInput } from '../../VerifyCodeInput'
import { useAuthClient } from '../../Guard/authClient'
import { SendCodeBtn } from '../../SendCode/SendCodeBtn'
import { VALIDATE_PATTERN } from '../../_utils'
import SubmitButton from '../../SubmitButton'

const CODE_LEN = 4

interface BindMFAEmailProps {
  mfaToken: string
  onBind: (email: string) => void
}
export const BindMFAEmail: React.FC<BindMFAEmailProps> = ({
  mfaToken,
  onBind,
}) => {
  const authClient = useAuthClient()
  const submitButtonRef = useRef<any>(null)
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const onFinish = async ({ email }: any) => {
    submitButtonRef.current?.onSpin(true)
    try {
      const bindable = await authClient.mfa.phoneOrEmailBindable({
        mfaToken,
        email,
      })

      if (!bindable) {
        Message.error(
          t('common.unBindEmaileDoc', {
            email: email,
          })
        )
        return
      }
      onBind(email)
    } catch (e: any) {
      const error = JSON.parse(e?.message)
      submitButtonRef.current.onError()
      Message.error(error.message)
    } finally {
      submitButtonRef.current?.onSpin(false)
    }
  }
  return (
    <>
      <p className="authing-g2-mfa-title">{t('common.bindEmail')}</p>
      <p className="authing-g2-mfa-tips">{t('common.bindEmailDoc')}</p>
      <Form
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
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
          <Input
            className="authing-g2-input"
            autoComplete="email"
            size="large"
            placeholder={t('login.inputEmail')}
            prefix={<UserOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>

        <SubmitButton text={t('common.sure')} ref={submitButtonRef} />
      </Form>
    </>
  )
}

interface VerifyMFAEmailProps {
  email: string
  mfaToken: string
  onVerify: (code: number, data: any) => void
  sendCodeRef: React.RefObject<HTMLButtonElement>
}

export const VerifyMFAEmail: React.FC<VerifyMFAEmailProps> = ({
  email,
  mfaToken,
  onVerify,
  sendCodeRef,
}) => {
  const authClient = useAuthClient()
  const submitButtonRef = useRef<any>(null)
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [MfaCode, setMFACode] = useState(new Array(CODE_LEN).fill(''))
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

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
    submitButtonRef.current?.onSpin(true)
    try {
      const user: User = await authClient.mfa.verifyAppEmailMfa({
        mfaToken,
        email: email!,
        code: MfaCode.join(''),
      })

      onVerify(200, user)
    } catch (e: any) {
      const error = JSON.parse(e?.message)
      onVerify(error.code as number, error)
    } finally {
      submitButtonRef.current?.onSpin(false)
    }
  }

  return (
    <>
      <p className="authing-g2-mfa-title">{t('login.inputEmailCode')}</p>
      <p className="authing-g2-mfa-tips">
        {sending
          ? t('login.sendingVerifyCode')
          : sent
          ? `${t('login.verifyCodeSended')} ${email}`
          : t('login.clickSent')}
      </p>
      <Form
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current?.onError()}
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

        <SubmitButton
          text={t('common.sure')}
          ref={submitButtonRef}
          className="g2-mfa-submit-button"
        />
      </Form>
    </>
  )
}

export const MFAEmail: React.FC<{
  mfaToken: string
  email?: string
  mfaLogin: any
}> = ({ email: userEmail, mfaToken, mfaLogin }) => {
  const [email, setEmail] = useState(userEmail)
  const sendCodeRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      {email ? (
        <VerifyMFAEmail
          mfaToken={mfaToken}
          email={email}
          onVerify={(code, data) => {
            mfaLogin(code, data)
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
