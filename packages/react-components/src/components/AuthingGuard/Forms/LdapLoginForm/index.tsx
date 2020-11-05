import { Input, Form } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import React, { forwardRef, useImperativeHandle, useState } from 'react'

import { getRequiredRules, validate } from '@/utils'
import { useGuardContext} from '@/context/global/context'
import { NEED_CAPTCHA } from '@/components/AuthingGuard/constants'
import { PasswordLoginFormProps } from '@/components/AuthingGuard/types'
import { LoginFormFooter } from '@/components/AuthingGuard/Forms/LoginFormFooter'

const captchaUrl = '/api/v2/security/captcha'
const getCaptchaUrl = () => `${captchaUrl}?r=${+new Date()}`

export const LdapLoginForm = forwardRef<FormInstance, PasswordLoginFormProps>(
  ({ onSuccess, onValidateFail, onFail }, ref) => {
    const { state } = useGuardContext()
    const { config, authClient } = state
    const autoRegister = config.autoRegister

    const [rawForm] = Form.useForm()

    const [needCaptcha, setNeedCaptcha] = useState(false)
    const [verifyCodeUrl, setVerifyCodeUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const onFinishFailed = (errorInfo: any) => {
      setLoading(false)
      onValidateFail && onValidateFail(errorInfo)
    }

    const onFinish = async (values: any) => {
      try {
        const identity = values.identity && values.identity.trim()
        const password = values.password && values.password.trim()
        const captchaCode = values.captchaCode && values.captchaCode.trim()

        const user = validate('phone', identity)
          ? await authClient.loginByPhonePassword(identity, password, {
              autoRegister,
              captchaCode,
            })
          : validate('email', identity)
          ? await authClient.loginByEmail(identity, password, {
              autoRegister,
              captchaCode,
            })
          : await authClient.loginByUsername(identity, password, {
              autoRegister,
              captchaCode,
            })

        onSuccess && onSuccess(user)
      } catch (error) {
        onFail && onFail(error)

        if (error.code === NEED_CAPTCHA && verifyCodeUrl === null) {
          setNeedCaptcha(true)
          setVerifyCodeUrl(getCaptchaUrl())
        }
      } finally {
        setLoading(false)
      }
    }

    useImperativeHandle(ref, () => rawForm)

    const formItems = [
      {
        component: (
          <Input
            autoComplete="ldap,username"
            size="large"
            placeholder="请输入 LDAP 用户名"
            prefix={<UserOutlined style={{ color: '#ddd' }} />}
          />
        ),
        name: 'identity',
        rules: getRequiredRules('LDAP 账号不能为空'),
      },
      {
        component: (
          <Input.Password
            size="large"
            placeholder="请输入 LDAP 密码"
            prefix={<LockOutlined style={{ color: '#ddd' }} />}
          />
        ),
        name: 'password',
        rules: getRequiredRules('密码不能为空'),
      },
      {
        component: (
          <Input
            autoComplete="off"
            size="large"
            placeholder="请输入图形验证码"
            addonAfter={
              <img
                src={verifyCodeUrl ?? ''}
                alt="图形验证码"
                style={{ height: '2em', cursor: 'pointer' }}
                onClick={() => setVerifyCodeUrl(getCaptchaUrl())}
              />
            }
          />
        ),
        name: 'captchaCode',
        rules: getRequiredRules('验证码不能为空'),
        hide: !needCaptcha,
      },
    ]

    return (
      <Form form={rawForm} onFinishFailed={onFinishFailed} onFinish={onFinish}>
        {formItems.map(
          (item) =>
            !item.hide && (
              <Form.Item key={item.name} name={item.name} rules={item.rules}>
                {item.component}
              </Form.Item>
            )
        )}

        <LoginFormFooter
          onLogin={() => setLoading(true)}
          loading={loading}
        ></LoginFormFooter>
      </Form>
    )
  }
)
