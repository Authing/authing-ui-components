import { UserOutlined } from '@ant-design/icons'
import { Input, message, message as Message } from 'antd'
import { Form } from 'antd'
import { EmailScene, User } from 'authing-js-sdk'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { VerifyCodeInput } from '../VerifyCodeInput'
import { useAuthClient } from '../../Guard/authClient'
import { SendCodeBtn } from '../../SendCode/SendCodeBtn'
import SubmitButton from '../../SubmitButton'
import { EmailFormItem, ICheckProps } from '../../ValidatorRules'
import { MFAConfig } from '../props'
import { VerifyCodeFormItem } from '../VerifyCodeInput/VerifyCodeFormItem'

interface BindMFAEmailProps {
  mfaToken: string
  onBind: (email: string) => void
  config: any
}
export const BindMFAEmail: React.FC<BindMFAEmailProps> = ({
  mfaToken,
  onBind,
  config,
}) => {
  const submitButtonRef = useRef<any>(null)
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const ref = useRef<ICheckProps>(null)

  const onFinish = async ({ email }: any) => {
    submitButtonRef.current?.onSpin(true)
    await form.validateFields()
    try {
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
        onValuesChange={(value) => {
          ref.current?.check(value)
        }}
      >
        <EmailFormItem
          className="authing-g2-input-form"
          name="email"
          userPoolId={config.__publicConfig__.userPoolId}
          form={form}
          ref={ref}
          checkRepeat={true}
        >
          <Input
            className="authing-g2-input"
            autoComplete="email"
            size="large"
            placeholder={t('login.inputEmail')}
            prefix={<UserOutlined style={{ color: '#878A95' }} />}
          />
        </EmailFormItem>

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
  codeLength: number
}

export const VerifyMFAEmail: React.FC<VerifyMFAEmailProps> = ({
  email,
  mfaToken,
  onVerify,
  sendCodeRef,
  codeLength,
}) => {
  const authClient = useAuthClient()
  const submitButtonRef = useRef<any>(null)
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [sent, setSent] = useState(false)

  const sendVerifyCode = async () => {
    try {
      await authClient.sendEmail(email!, EmailScene.MfaVerify)
      setSent(true)
      return true
    } catch (e) {
      const errorMessage = JSON.parse(e.message)
      message.error(errorMessage.message)
      return false
    }
  }

  const onFinish = async (values: any) => {
    submitButtonRef.current?.onSpin(true)
    const mfaCode = form.getFieldValue('mfaCode')

    try {
      const user: User = await authClient.mfa.verifyAppEmailMfa({
        mfaToken,
        email: email!,
        code: mfaCode.join(''),
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
        {sent
          ? `${t('login.verifyCodeSended')} ${email}`
          : t('login.clickSent')}
      </p>
      <Form
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current?.onError()}
      >
        <VerifyCodeFormItem
          codeLength={codeLength}
          ruleKeyword={t('common.captchaCode')}
        >
          <VerifyCodeInput length={codeLength} />
        </VerifyCodeFormItem>

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
  config: MFAConfig
}> = ({ email: userEmail, mfaToken, mfaLogin, config }) => {
  const [email, setEmail] = useState(userEmail)
  const sendCodeRef = useRef<HTMLButtonElement>(null)

  const codeLength = config.__publicConfig__?.verifyCodeLength

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
          codeLength={codeLength ?? 4}
        />
      ) : (
        <BindMFAEmail
          config={config}
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
