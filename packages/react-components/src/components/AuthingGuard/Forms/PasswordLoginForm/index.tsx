import { Input, Form, Alert } from 'antd'
import { FormInstance, Rule } from 'antd/lib/form'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'

import {
  getRequiredRules,
  getUserRegisterParams,
  validate,
} from '../../../../utils'
import { useGuardContext } from '../../../../context/global/context'
import { NEED_CAPTCHA } from '../../../../components/AuthingGuard/constants'
import {
  PasswordLoginFormProps,
  User,
} from '../../../../components/AuthingGuard/types'
import { LoginFormFooter } from '../../../../components/AuthingGuard/Forms/LoginFormFooter'
import { useTranslation } from 'react-i18next'

export const PasswordLoginForm = forwardRef<
  FormInstance,
  PasswordLoginFormProps
>(({ onSuccess, onValidateFail, onFail }, ref) => {
  const { state } = useGuardContext()
  const { t } = useTranslation()

  const { config, authClient, realHost } = state
  const autoRegister = config.autoRegister
  const passwordLoginMethods = config.passwordLoginMethods

  const captchaUrl = `${realHost}/api/v2/security/captcha`
  const getCaptchaUrl = () => `${captchaUrl}?r=${+new Date()}`

  const [rawForm] = Form.useForm()

  const [needCaptcha, setNeedCaptcha] = useState(false)
  const [verifyCodeUrl, setVerifyCodeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onFinishFailed = (errorInfo: any) => {
    setLoading(false)
    onValidateFail && onValidateFail(errorInfo)
  }

  const usernamePlaceholder = useMemo(() => {
    const loginMethods = passwordLoginMethods
    if (
      loginMethods?.includes('email-password') &&
      loginMethods?.includes('username-password')
    ) {
      return t('login.inputEmailUsername')
    } else if (loginMethods?.includes('username-password')) {
      return t('login.inputUsername')
    } else {
      return t('login.inputEmail')
    }
  }, [passwordLoginMethods, t])

  const identityRules = useMemo(() => {
    const rules: Rule[] = getRequiredRules(t('common.accNotNull'))

    const loginMethods = passwordLoginMethods

    if (
      loginMethods?.includes('email-password') &&
      loginMethods?.length === 1
    ) {
      rules.push({
        type: 'email',
        message: t('common.emailFormatError'),
      })
    }

    return rules
  }, [passwordLoginMethods, t])

  const login = async (
    values: any,
    type: 'loginByEmail' | 'loginByUsername'
  ) => {
    const identity = values.identity && values.identity.trim()
    const password = values.password && values.password.trim()
    const captchaCode = values.captchaCode && values.captchaCode.trim()
    return await authClient[type](identity, password, {
      captchaCode,
      customData: getUserRegisterParams(),
    })
  }

  const onFinish = async (values: any) => {
    try {
      const identity = values.identity && values.identity.trim()

      let user: User
      if (
        passwordLoginMethods?.includes('email-password') &&
        passwordLoginMethods?.includes('username-password')
      ) {
        validate('email', identity)
          ? (user = await login(values, 'loginByEmail'))
          : (user = await login(values, 'loginByUsername'))
      } else if (passwordLoginMethods?.includes('username-password')) {
        user = await login(values, 'loginByUsername')
      } else {
        user = await login(values, 'loginByEmail')
      }

      onSuccess && onSuccess(user)
    } catch (error) {
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
          autoComplete="email,username,tel"
          size="large"
          placeholder={usernamePlaceholder}
          prefix={<UserOutlined style={{ color: '#ddd' }} />}
        />
      ),
      name: 'identity',
      rules: identityRules,
    },
    {
      component: (
        <Input.Password
          size="large"
          placeholder={t('login.inputLoginPwd')}
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
      {autoRegister && (
        <Alert message={t('login.autoRegister')} style={{ marginBottom: 24 }} />
      )}
      {formItems.map(
        (item) =>
          !item.hide && (
            <Form.Item key={item.name} name={item.name} rules={item.rules}>
              {item.component}
            </Form.Item>
          )
      )}

      <LoginFormFooter
        needRegister
        needRestPwd
        loading={loading}
      ></LoginFormFooter>
    </Form>
  )
})
