import { EmailScene, User } from 'authing-js-sdk'
import React, { FC, useState } from 'react'
import { Button, Form } from 'antd'

import { VerifyCodeInput } from '../../../../common/VerifyCodeInput'
import { useGuardContext } from '../../../../context/global/context'
import { EmailMFAVerifyFormProps } from '../../../../components/AuthingGuard/types'

import './style.less'
import { SendCodeBtn } from '../SendPhoneCode/SendCodeBtn'
import { useTranslation } from 'react-i18next'

const CODE_LEN = 4

export const VerifyCodeForm: FC<EmailMFAVerifyFormProps> = ({
  onSuccess,
  onFail,
  email,
  mfaToken,
  sendCodeRef,
}) => {
  const {
    state: { authClient },
  } = useGuardContext()

  const { t } = useTranslation()

  const [rawForm] = Form.useForm()

  const [MfaCode, setMFACode] = useState(new Array(CODE_LEN).fill(''))
  const [loading, setLoading] = useState(false)

  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const onFinish = async (values: any) => {
    try {
      const user: User = await authClient.mfa.verifyAppEmailMfa({
        mfaToken,
        email: email!,
        code: MfaCode.join(''),
      })
      onSuccess && onSuccess(user)
    } catch (e) {
      onFail?.(e)
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <>
      <h3 className="authing-guard-mfa-title">{t('login.inputEmailCode')}</h3>
      <p className="authing-guard-mfa-tips">
        {sending
          ? t('login.sendingVerifyCode')
          : sent
          ? `${t('login.verifyCodeSended')} ${email}`
          : t('login.clickSent')}
      </p>
      <Form
        form={rawForm}
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
