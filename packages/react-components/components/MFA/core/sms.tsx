import { UserOutlined } from '@ant-design/icons'
import { Input, message as Message } from 'antd'
import { Form } from 'antd'
import { User } from 'authing-js-sdk'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { VerifyCodeInput } from '../../VerifyCodeInput'
import { useAuthClient } from '../../Guard/authClient'
import { SendCodeBtn } from '../../SendCode/SendCodeBtn'
import { VALIDATE_PATTERN } from '../../_utils'
import SubmitButton from '../../SubmitButton'

const CODE_LEN = 4

export interface BindMFASmsProps {
  mfaToken: string
  onBind: (phone: string) => void
}

export const BindMFASms: React.FC<BindMFASmsProps> = ({ mfaToken, onBind }) => {
  const authClient = useAuthClient()
  const submitButtonRef = useRef<any>(null)
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const onFinish = async ({ phone }: any) => {
    submitButtonRef.current.onSpin(true)
    try {
      const bindable = await authClient.mfa.phoneOrEmailBindable({
        mfaToken,
        phone,
      })
      if (!bindable) {
        Message.error(
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
      submitButtonRef.current?.onSpin(false)
    }
  }

  return (
    <>
      <h3 className="authing-g2-mfa-title">{t('common.bindPhone')}</h3>
      <p className="authing-g2-mfa-tips">{t('login.bindPhoneInfo')}</p>
      <Form
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
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
          <Input
            className="authing-g2-input"
            autoComplete="tel"
            size="large"
            placeholder={t('login.inputPhone')}
            prefix={<UserOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <SubmitButton text={t('common.sure')} ref={submitButtonRef} />
      </Form>
    </>
  )
}

export interface VerifyMFASmsProps {
  mfaToken: string
  phone: string
  onVerify: (code: number, data: any) => void
  sendCodeRef: React.RefObject<HTMLButtonElement>
}

export const VerifyMFASms: React.FC<VerifyMFASmsProps> = ({
  mfaToken,
  phone,
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

  const onFinish = async (values: any) => {
    submitButtonRef.current.onSpin(true)
    try {
      const user: User = await authClient.mfa.verifyAppSmsMfa({
        mfaToken,
        phone: phone!,
        code: MfaCode.join(''),
      })
      // TODO
      onVerify(200, user)
    } catch (e) {
      const error = JSON.parse(e.message)
      submitButtonRef.current.onError()
      onVerify(error.code as number, error)
    } finally {
      submitButtonRef.current?.onSpin(false)
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
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
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

export const MFASms: React.FC<{
  mfaToken: string
  phone?: string
  mfaLogin: any
}> = ({ phone: userPhone, mfaToken, mfaLogin }) => {
  const [phone, setPhone] = useState(userPhone)
  const sendCodeRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      {phone ? (
        <VerifyMFASms
          mfaToken={mfaToken}
          phone={phone}
          onVerify={(code, data) => {
            mfaLogin(code, data)
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
