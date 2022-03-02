import { Input, Form, message } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import React, { forwardRef, useImperativeHandle, useState } from 'react'

import { useGuardContext } from '../../../context/global/context'
import {
  ADLoginFormProps,
  LoginMethods,
} from '../../../../components/AuthingGuard/types'
import { LoginFormFooter } from '../../../../components/AuthingGuard/Forms/LoginFormFooter'
import { useTranslation } from 'react-i18next'
import { getRequiredRules } from '../../../_utils'

export const ADLoginForm = forwardRef<FormInstance, ADLoginFormProps>(
  ({ onSuccess, onValidateFail, onFail }, ref) => {
    const { t } = useTranslation()
    const { state } = useGuardContext()
    const { authClient, guardEvents } = state

    const [loading, setLoading] = useState(false)

    const onFinishFailed = (errorInfo: any) => {
      setLoading(false)
      onValidateFail && onValidateFail(errorInfo)
    }

    const [rawForm] = Form.useForm()

    const onFinish = async (values: any) => {
      if (guardEvents.onBeforeLogin) {
        try {
          const canLogin = await guardEvents.onBeforeLogin(
            {
              type: LoginMethods.AD,
              data: {
                identity: values.identity,
                password: values.password,
              },
            },
            authClient
          )

          if (!canLogin) {
            setLoading(false)
            return
          }
        } catch (e) {
          if (typeof e === 'string') {
            message.error(e)
          } else {
            message.error(e.message)
          }
          setLoading(false)
          return
        }
      }

      try {
        const identity = values.identity && values.identity.trim()
        const password = values.password && values.password.trim()
        const user = await authClient.loginByAd(identity, password)
        onSuccess && onSuccess(user)
      } catch (error) {
        if (typeof error.message === 'string') {
          // js sdk httpclient 的报错，这里只有一种情况就是用户开启了 mfa 的报错
          try {
            const errorData = JSON.parse(error.message)
            onFail && onFail(errorData)
            return
          } catch (_) {
            // do nothing
          }
        }
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
        <Form.Item
          name="identity"
          rules={getRequiredRules(t('login.inputAdUsername'))}
        >
          <Input
            autoComplete="off"
            size="large"
            placeholder={t('login.inputAdUsername')}
            prefix={<UserOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={getRequiredRules(t('login.inputAdPwd'))}
        >
          <Input.Password
            autoComplete="off"
            size="large"
            visibilityToggle={false}
            placeholder={t('login.inputAdPwd')}
            prefix={<LockOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        <LoginFormFooter loading={loading}></LoginFormFooter>
      </Form>
    )
  }
)
