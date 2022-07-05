import { Input, Form, message } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import React, { forwardRef, useImperativeHandle, useState } from 'react'

import { getRequiredRules } from '../../../_utils'
import { useGuardContext } from '../../../context/global/context'
import { NEED_CAPTCHA } from '../../../../components/AuthingGuard/constants'
import {
  LoginMethods,
  PasswordLoginFormProps,
} from '../../../../components/AuthingGuard/types'
import { LoginFormFooter } from '../../../../components/AuthingGuard/Forms/LoginFormFooter'
import { useTranslation } from 'react-i18next'

export const LdapLoginForm = forwardRef<FormInstance, PasswordLoginFormProps>(
  ({ onSuccess, onValidateFail, onFail }, ref) => {
    const { t } = useTranslation()

    const { state } = useGuardContext()
    const { authClient, realHost, guardEvents } = state

    const [rawForm] = Form.useForm()

    const [needCaptcha, setNeedCaptcha] = useState(false)
    const [verifyCodeUrl, setVerifyCodeUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const captchaUrl = `${realHost}/api/v2/security/captcha`
    const getCaptchaUrl = () => `${captchaUrl}?r=${+new Date()}`

    const onFinishFailed = (errorInfo: any) => {
      setLoading(false)
      onValidateFail && onValidateFail(errorInfo)
    }

    const onFinish = async (values: any) => {
      if (guardEvents.onBeforeLogin) {
        try {
          const canLogin = await guardEvents.onBeforeLogin(
            {
              type: LoginMethods.LDAP,
              data: {
                identity: values.identity,
                password: values.password,
                captchaCode: values.captchaCode,
              },
            },
            authClient
          )

          if (!canLogin) {
            setLoading(false)
            return
          }
        } catch (e: any) {
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

        const user = await authClient.loginByLdap(identity, password)
        onSuccess && onSuccess(user)
      } catch (error: any) {
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
            autoComplete="off"
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
            autoComplete="off"
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
            autoComplete="off"
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
