import { Input, Form } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import React, { forwardRef, useImperativeHandle, useState } from 'react'

import { getRequiredRules } from '../../../../utils'
import { useGuardContext } from '../../../../context/global/context'
import { NEED_CAPTCHA } from '../../../../components/AuthingGuard/constants'
import { PasswordLoginFormProps } from '../../../../components/AuthingGuard/types'
import { LoginFormFooter } from '../../../../components/AuthingGuard/Forms/LoginFormFooter'
import { useTranslation } from 'react-i18next'

const captchaUrl = '/api/v2/security/captcha'
const getCaptchaUrl = () => `${captchaUrl}?r=${+new Date()}`

export const LdapLoginForm = forwardRef<FormInstance, PasswordLoginFormProps>(
  ({ onSuccess, onValidateFail, onFail }, ref) => {
    const { t } = useTranslation()

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

        const user = await authClient.loginByLdap(identity, password, {
          autoRegister,
          captchaCode,
        })
        onSuccess && onSuccess(user)
      } catch (error) {
        if (typeof error.message === 'string') {
          // js sdk httpclient 的报错，这里只有一种情况就是用户开启了 mfa 的报错
          try {
            const errorData = JSON.parse(error.message)
            onFail && onFail(errorData)
            return
          } catch (_) {}
        }

        if (error.code === NEED_CAPTCHA && verifyCodeUrl === null) {
          setNeedCaptcha(true)
          setVerifyCodeUrl(getCaptchaUrl())
        }

        onFail && onFail(error)
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
            placeholder={t('login.inputLdapUsername')}
            prefix={<UserOutlined style={{ color: '#ddd' }} />}
          />
        ),
        name: 'identity',
        rules: getRequiredRules(t('common.LDAPAccountNotNull')),
      },
      {
        component: (
          <Input.Password
            size="large"
            placeholder={t('login.inputLdapPwd')}
            prefix={<LockOutlined style={{ color: '#ddd' }} />}
          />
        ),
        name: 'password',
        rules: getRequiredRules(t('common.passwordNotNull')),
      },
      {
        component: (
          <Input
            size="large"
            placeholder={t('login.inputCaptchaCode')}
            addonAfter={
              <img
                src={verifyCodeUrl ?? ''}
                alt={t('login.captchaCode')}
                style={{ height: '2em', cursor: 'pointer' }}
                onClick={() => setVerifyCodeUrl(getCaptchaUrl())}
              />
            }
          />
        ),
        name: 'captchaCode',
        rules: getRequiredRules(t('common.captchaCodeNotNull')),
        hide: !needCaptcha,
      },
    ]

    return (
      <Form
        form={rawForm}
        onSubmitCapture={() => setLoading(true)}
        onFinishFailed={onFinishFailed}
        onFinish={onFinish}
      >
        {formItems.map(
          (item) =>
            !item.hide && (
              <Form.Item key={item.name} name={item.name} rules={item.rules}>
                {item.component}
              </Form.Item>
            )
        )}

        <LoginFormFooter loading={loading}></LoginFormFooter>
      </Form>
    )
  }
)
