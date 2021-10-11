import { Input, Form, Alert, message as Message, message } from 'antd'
import { FormInstance, Rule } from 'antd/lib/form'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'

import { getRequiredRules, getUserRegisterParams } from '../../../../utils'
import { useGuardContext } from '../../../../context/global/context'
import { NEED_CAPTCHA } from '../../../../components/AuthingGuard/constants'
import {
  LoginMethods,
  PasswordLoginFormProps,
  User,
} from '../../../../components/AuthingGuard/types'
import { LoginFormFooter } from '../../../../components/AuthingGuard/Forms/LoginFormFooter'
import { useTranslation } from 'react-i18next'
import { PasswordLoginMethods } from '../../api'
import { requestClient } from '../../api/http'

export const PasswordLoginForm = forwardRef<
  FormInstance,
  PasswordLoginFormProps
>(({ onSuccess, onValidateFail, onFail }, ref) => {
  const { state, getValue } = useGuardContext()
  const { t } = useTranslation()

  const { config, authClient, realHost, userPoolId, appId, guardEvents } = state
  const autoRegister = config.autoRegister

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

  const loginMethodsText = useMemo<
    Record<
      PasswordLoginMethods,
      {
        t: string
        sort: number
      }
    >
  >(
    () => ({
      'email-password': {
        t: t('common.email'),
        sort: 2,
      },
      'phone-password': {
        t: t('common.phoneNumber'),
        sort: 1,
      },
      'username-password': {
        t: t('common.username'),
        sort: 0,
      },
    }),
    [t]
  )

  const usernamePlaceholder = useMemo(
    () =>
      t('login.inputAccount', {
        text: config.passwordLoginMethods
          ?.map((item) => loginMethodsText[item])
          .sort((a, b) => a.sort - b.sort)
          .map((item) => item.t)
          .join(' / '),
      }),
    [config.passwordLoginMethods, loginMethodsText, t]
  )

  const identityRules = useMemo(() => {
    const rules: Rule[] = getRequiredRules(t('common.accNotNull'))

    const loginMethods = config.passwordLoginMethods

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
  }, [config, t])

  const login = async (values: any) => {
    const identity = values.identity && values.identity.trim()
    const password = values.password && values.password.trim()
    const captchaCode = values.captchaCode && values.captchaCode.trim()

    const encrypt = authClient.options.encryptFunction

    const { publicKey, autoRegister } = getValue('config')
    const { code, data, message } = await requestClient.post<User>(
      '/api/v2/login/account',
      {
        account: identity,
        password: await encrypt!(password, publicKey),
        captchaCode,
        customData: getUserRegisterParams(),
        autoRegister: autoRegister,
      },
      {
        headers: {
          'x-authing-userpool-id': userPoolId,
          'x-authing-app-id': appId,
        },
      }
    )

    if (code === 200) {
      return data
    } else {
      Message.error(message)
      // eslint-disable-next-line no-throw-literal
      throw {
        code,
        message,
        data,
      }
    }
  }

  const onFinish = async (values: any) => {
    if (guardEvents.onBeforeLogin) {
      try {
        const canLogin = await guardEvents.onBeforeLogin(
          {
            type: LoginMethods.Password,
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
      let user: User | undefined
      user = await login(values)
      user && onSuccess && onSuccess(user)
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
