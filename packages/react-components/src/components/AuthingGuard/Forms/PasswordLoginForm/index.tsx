import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Input, Form, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { User } from 'authing-js-sdk'
import { useGlobalContext } from '@/context/global/context'
import { validate } from '@/utils'
import { FormInstance } from 'antd/lib/form'

export interface PasswordLoginFormProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onSubmit?: () => void
  onSuccess?: (user: User) => void
  onFail?: (error: any) => void
}

const captchaUrl = '/api/v2/security/captcha'
const getCaptchaUrl = () => `${captchaUrl}?r=${+new Date()}`

export const PasswordLoginForm = forwardRef<
  FormInstance,
  PasswordLoginFormProps
>(({ onSubmit, onSuccess, onFail }, ref) => {
  const { state } = useGlobalContext()
  const { config, authClient } = state
  const [rawForm] = Form.useForm()
  const [needVerifyCode, setNeedVerifyCode] = useState(false)
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
      console.log(error.code)

      if (error.code === 2000 && verifyCodeUrl === null) {
        setNeedVerifyCode(true)
        setVerifyCodeUrl(getCaptchaUrl())
      }
    }
  }

  useImperativeHandle(ref, () => rawForm)

  // TODO: 细化表单校验规则
  const rules = [
    {
      required: true,
      message: '不能为空！',
    },
  ]

  return (
    <Form form={rawForm} onSubmitCapture={onSubmit} onFinish={onFinish}>
      <button type="submit" hidden></button>

      <>
        {autoRegister && (
          <Alert
            message="输入帐号密码登录，如果您没有帐号，我们会自动创建。"
            style={{ marginBottom: 24 }}
          />
        )}
        <Form.Item name="identity" rules={rules}>
          <Input
            autoComplete="email,username,tel"
            size="large"
            placeholder="请输入邮箱、用户名或手机号"
            prefix={<UserOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        <Form.Item name="password" rules={rules}>
          <Input.Password
            autoComplete="current-password"
            size="large"
            visibilityToggle={false}
            placeholder="请输入登录密码"
            prefix={<LockOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        {needVerifyCode && (
          <Form.Item name="captchaCode" rules={rules}>
            <Input
              autoComplete="one-time-code"
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
          </Form.Item>
        )}
      </>
    </Form>
  )
})

// export const PasswordLoginForm = forwardRef<FormInstance, PasswordLoginFormProps>(InternalPasswordLoginForm);
