import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Input, Form } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useGlobalContext } from '@/context/global/context'
import { getRequiredRules, validate } from '@/utils'
import { FormInstance } from 'antd/lib/form'
import { NEED_CAPTCHA } from '@/components/AuthingGuard/constants'
import { PasswordLoginFormProps } from '@/components/AuthingGuard/types'

const captchaUrl = '/api/v2/security/captcha'
const getCaptchaUrl = () => `${captchaUrl}?r=${+new Date()}`

export const LdapLoginForm = forwardRef<
  FormInstance,
  PasswordLoginFormProps
>(({ onSuccess, onValidateFail, onFail }, ref) => {
  const { state } = useGlobalContext()
  const { config, authClient } = state
  const [rawForm] = Form.useForm()
  const [needCaptcha, setNeedCaptcha] = useState(false)
  const [verifyCodeUrl, setVerifyCodeUrl] = useState<string | null>(null)
  const autoRegister = config.autoRegister

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
    <Form form={rawForm} onFinishFailed={onValidateFail} onFinish={onFinish}>
      {formItems.map(
        (item) =>
          !item.hide && (
            <Form.Item key={item.name} name={item.name} rules={item.rules}>
              {item.component}
            </Form.Item>
          )
      )}
    </Form>
  )
})
