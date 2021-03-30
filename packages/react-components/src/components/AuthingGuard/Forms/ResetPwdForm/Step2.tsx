import React, { FC, useState } from 'react'
import { Form, Input, Button } from 'antd'
import { SafetyOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'

import { getRequiredRules } from '../../../../utils'
import { useGuardContext } from '../../../../context/global/context'
import { ResetPasswordStep2Props } from '../../../../components/AuthingGuard/types'
import { SendPhoneCode } from '../../../../components/AuthingGuard/Forms/SendPhoneCode'
import { useTranslation } from 'react-i18next'

export const ResetPasswordStep2: FC<ResetPasswordStep2Props> = ({
  phone,
  onSuccess,
  onFail,
}) => {
  const [rawForm] = Form.useForm()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(false)

  const {
    state: { authClient, guardEvents },
  } = useGuardContext()

  const onStep2Finish = async (values: any) => {
    const code = values.code
    const password = values.password

    try {
      await authClient.resetPasswordByPhoneCode(phone, code, password)
      onSuccess()
    } catch (e) {
      onFail?.(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form
      form={rawForm}
      onFinishFailed={() => setLoading(false)}
      onSubmitCapture={() => setLoading(true)}
      onFinish={onStep2Finish}
    >
      <Form.Item
        name="phone"
        initialValue={phone}
        rules={getRequiredRules(t('common.phoneNotNull'))}
      >
        <Input
          autoComplete="tel"
          name="phone"
          readOnly
          size="large"
          placeholder={t('login.inputPhone')}
          prefix={<UserOutlined style={{ color: '#ddd' }} />}
        />
      </Form.Item>
      <Form.Item
        name="code"
        rules={getRequiredRules(t('common.inputVerifyCode')).concat({
          len: 4,
          message: t('common.inputFourVerifyCode', {
            length: 4,
          }),
        })}
      >
        <Input
          name="code"
          size="large"
          placeholder={t('common.inputFourVerifyCode', {
            length: 4,
          })}
          prefix={<SafetyOutlined style={{ color: '#ddd' }} />}
          suffix={
            <SendPhoneCode
              onError={(error) =>
                guardEvents.onPwdPhoneSendError?.(error, authClient)
              }
              onSend={() => guardEvents.onPwdPhoneSend?.(authClient)}
              phone={phone}
            />
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
      <Button
        className="authing-reset-pwd-btn"
        block
        loading={loading}
        type="primary"
        size="large"
        htmlType="submit"
      >
        {t('login.resetPwd')}
      </Button>
    </Form>
  )
}
