import React, { FC, useState } from 'react'
import { Form, Button, Input, message } from 'antd'
import { SafetyOutlined, LockOutlined } from '@ant-design/icons'
import { EmailScene } from 'authing-js-sdk'

import { getRequiredRules } from '../../../../utils'
import { useGuardContext } from '../../../../context/global/context'
import { ResetPasswordStep3Props } from '../../../../components/AuthingGuard/types'
import { useTranslation, Trans } from 'react-i18next'

import './style.less'

export const ResetPasswordStep3: FC<ResetPasswordStep3Props> = ({
  email,
  onSuccess = () => {},
  onFail,
}) => {
  const {
    state: { authClient, guardEvents },
  } = useGuardContext()
  const [rawForm] = Form.useForm()
  const { t } = useTranslation()

  const [reseting, setReseting] = useState(false)
  const [sending, setSending] = useState(false)

  const onSendResetMail = async () => {
    setSending(true)
    try {
      await authClient.sendEmail(email, EmailScene.ResetPassword)
      message.success(t('login.emailSent'))
      guardEvents.onPwdEmailSend?.(authClient)
    } catch (e) {
      guardEvents.onPwdEmailSendError?.(e, authClient)
    } finally {
      setSending(false)
    }
  }

  const onStep3Finish = async (values: any) => {
    const code = values.code
    const password = values.password
    try {
      await authClient.resetPasswordByEmailCode(email, code, password)
      onSuccess()
    } catch (error) {
      onFail?.(error)
    } finally {
      setReseting(false)
    }
  }

  return (
    <>
      <div className="authing-reset-email-text">
        <Trans i18nKey="login.resetEmailSent" values={{ email: email }}>
          重置密码邮件已发送至邮箱 <span>{email}</span>有效期为 5 分钟。
        </Trans>
      </div>

      <Form
        form={rawForm}
        onFinishFailed={() => setReseting(false)}
        onSubmitCapture={() => setReseting(true)}
        onFinish={onStep3Finish}
        className="authing-reset-pwd-form"
      >
        <Form.Item
          name="code"
          rules={getRequiredRules(t('common.captchaCodeNotNull')).concat({
            len: 4,
            message: t('common.inputFourVerifyCode', {
              length: 4,
            }),
          })}
        >
          <Input
            name="code"
            size="large"
            placeholder={t('login.fourVerifyCode', {
              length: 4,
            })}
            prefix={<SafetyOutlined style={{ color: '#ddd' }} />}
            suffix={
              <Button
                className="authing-send-code-btn"
                style={{ boxShadow: 'none' }}
                type="primary"
                ghost
                loading={sending}
                onClick={onSendResetMail}
              >
                {t('common.sendVerifyCode')}
              </Button>
            }
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={getRequiredRules(t('common.passwordNotNull'))}
        >
          <Input.Password
            name="password"
            size="large"
            placeholder={t('user.newPwd')}
            prefix={<LockOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        <Form.Item
          name="repeat-password"
          rules={getRequiredRules(t('common.repeatPassword')).concat({
            validator: async (rule, value) => {
              if (rawForm.getFieldValue('password') !== value) {
                throw new Error(t('login.twoPwdNeedSame'))
              }
            },
          })}
        >
          <Input.Password
            name="repeat-password"
            size="large"
            placeholder={t('login.inputPwdAgain')}
            prefix={<LockOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        <Form.Item>
          <Button
            className="authing-reset-pwd-btn authing-reset-email"
            block
            loading={reseting}
            type="primary"
            size="large"
            htmlType="submit"
          >
            {t('login.resetPwd')}
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
