import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { FormInstance, Rule } from 'antd/lib/form'
import { Alert, Form, Input } from 'antd'
import { UserOutlined, SafetyOutlined } from '@ant-design/icons'

import {
  getRequiredRules,
  getUserRegisterParams,
  VALIDATE_PATTERN,
} from '../../../../utils'
import { useGuardContext } from '../../../../context/global/context'
import { PhoneCodeLoginFormProps } from '../../../../components/AuthingGuard/types'
import { SendPhoneCode } from '../../../../components/AuthingGuard/Forms/SendPhoneCode'
import { LoginFormFooter } from '../../../../components/AuthingGuard/Forms/LoginFormFooter'
import { useTranslation } from 'react-i18next'

export const PhoneCodeLoginForm = forwardRef<
  FormInstance,
  PhoneCodeLoginFormProps
>(({ onSuccess, onFail, onValidateFail }, ref) => {
  const {
    state: { authClient, config },
  } = useGuardContext()
  const { t } = useTranslation()

  const rulesMap: Record<string, Rule[]> = {
    phone: getRequiredRules(t('login.inputPhone')).concat({
      pattern: VALIDATE_PATTERN.phone,
      message: t('common.phoneFormateError'),
    }),
    code: getRequiredRules(t('common.inputVerifyCode')),
  }

  const [rawForm] = Form.useForm()

  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const onFinishFailed = (errorInfo: any) => {
    setLoading(false)
    onValidateFail && onValidateFail(errorInfo)
  }

  const onFinish = async (values: any) => {
    try {
      const { phone, code } = values
      const user = await authClient.loginByPhoneCode(phone, code, {
        params: getUserRegisterParams(),
      })
      onSuccess && onSuccess(user)
    } catch (error) {
      onFail && onFail(error)
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => rawForm)

  return (
    <Form
      form={rawForm}
      onSubmitCapture={() => setLoading(true)}
      onFinishFailed={onFinishFailed}
      onFinish={onFinish}
    >
      {config.autoRegister && (
        <Alert
          message={t('login.phoneAutoRegister')}
          style={{ marginBottom: 24 }}
        />
      )}
      <Form.Item name="phone" rules={rulesMap.phone}>
        <Input
          autoComplete="tel"
          onChange={(e) => {
            setPhone(e.target.value)
          }}
          size="large"
          placeholder={t('login.inputPhone')}
          prefix={<UserOutlined style={{ color: '#ddd' }} />}
        />
      </Form.Item>
      <Form.Item name="code" rules={rulesMap.code}>
        <Input
          size="large"
          placeholder={t('common.inputFourVerifyCode', {
            length: 4,
          })}
          prefix={<SafetyOutlined style={{ color: '#ddd' }} />}
          suffix={<SendPhoneCode phone={phone} />}
        />
      </Form.Item>

      <LoginFormFooter needRegister loading={loading}></LoginFormFooter>
    </Form>
  )
})
