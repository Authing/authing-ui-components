import { Form, Input, message } from 'antd'
import { RegisterMethods } from 'authing-js-sdk'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { useGuardAuthClient } from '../../Guard/authClient'
import { getDeviceName, getUserRegisterParams } from '../../_utils'
import { Agreements } from '../components/Agreements'
import SubmitButton from '../../SubmitButton'
import CustomFormItem from '../../ValidatorRules'
import { IconFont } from '../../IconFont'
import { InputPassword } from '../../InputPassword'
import { useIsChangeComplete } from '../utils'
import { useGuardFinallyConfig, useGuardModule } from '../../_utils/context'
import { GuardModuleType } from '../../Guard'
import { useMediaSize } from '../../_utils/hooks'
import { ApiCode } from '../../_utils/responseManagement/interface'
import { usePasswordErrorText } from '../../_utils/useErrorText'
import { Agreement, ApplicationConfig } from '../../Type/application'

export interface RegisterWithEmailProps {
  // onRegister: Function
  onRegisterSuccess: Function
  onRegisterFailed: Function
  onBeforeRegister?: Function
  publicConfig?: ApplicationConfig
  agreements: Agreement[]
  registeContext?: any
}

export const RegisterWithEmail: React.FC<RegisterWithEmailProps> = ({
  onRegisterSuccess,
  onRegisterFailed,
  onBeforeRegister,
  agreements,
  registeContext,
}) => {
  const { t } = useTranslation()
  const submitButtonRef = useRef<any>(null)
  const { isPhoneMedia } = useMediaSize()
  const authClient = useGuardAuthClient()
  const [form] = Form.useForm()
  const config = useGuardFinallyConfig()
  const isChangeComplete = useIsChangeComplete('email')
  const { changeModule } = useGuardModule()

  const [acceptedAgreements, setAcceptedAgreements] = useState(false)
  const [validated, setValidated] = useState(false)
  const {
    getPassWordUnsafeText,
    setPasswordErrorTextShow,
  } = usePasswordErrorText()
  const [, onFinish] = useAsyncFn(
    async (values: any) => {
      submitButtonRef.current?.onSpin(true)

      if (onBeforeRegister) {
        try {
          const canRegister = await onBeforeRegister(
            {
              type: RegisterMethods.Phone,
              data: {
                phone: values.phone,
                password: values.password,
                code: values.code,
              },
            },
            authClient
          )
          if (!canRegister) {
            submitButtonRef.current?.onSpin(false)
            return
          }
        } catch (e: any) {
          if (typeof e === 'string') {
            message.error(e)
          } else {
            message.error(e?.message)
          }
          submitButtonRef.current?.onSpin(false)
          return
        }
      }

      try {
        await form.validateFields()
        setValidated(true)

        if (agreements?.length && !acceptedAgreements) {
          submitButtonRef.current.onError()
          return
        }
        const { email, password } = values

        const context = registeContext ?? {}

        // 注册使用的详情信息
        const registerContent = {
          email,
          password,
          profile: {
            browser:
              typeof navigator !== 'undefined' ? navigator.userAgent : null,
            device: getDeviceName(),
          },
          options: {
            context,
            generateToken: true,
            // 托管模式下注册携带query上自定义参数login_page_context
            params: config?.isHost
              ? getUserRegisterParams(['login_page_context'])
              : undefined,
          },
        }

        // onRegisterSuccess 注册成功后需要回到对应的登录页面
        const onRegisterSuccessIntercept = (user: any) => {
          onRegisterSuccess(user, {
            registerFrom: RegisterMethods.Email,
            account: email,
          })
        }
        // 看看是否要跳转到 信息补全
        if (isChangeComplete) {
          changeModule?.(GuardModuleType.REGISTER_COMPLETE_INFO, {
            businessRequestName: 'registerByEmail',
            content: registerContent,
            onRegisterSuccess: onRegisterSuccessIntercept,
            onRegisterFailed,
          })

          return
        }

        // 注册
        const user = await authClient.registerByEmail(
          registerContent.email,
          registerContent.password,
          registerContent.profile,
          registerContent.options
        )

        submitButtonRef.current?.onSpin(false)
        onRegisterSuccessIntercept(user)
      } catch (error: any) {
        const { message: errorMessage, code, data } = error
        if (code === ApiCode.UNSAFE_PASSWORD_TIP) {
          setPasswordErrorTextShow(true)
        }
        submitButtonRef.current.onError()
        message.error(errorMessage)
        onRegisterFailed(code, data, errorMessage)
      } finally {
        submitButtonRef.current?.onSpin(false)
      }
    },
    [form, acceptedAgreements],
    { loading: false }
  )

  return (
    <div className="authing-g2-register-email">
      <Form
        form={form}
        name="emailRegister"
        autoComplete="off"
        onSubmitCapture={() => submitButtonRef.current.onSpin(true)}
        onFinish={(values: any) => {
          onFinish(values)
        }}
        onFinishFailed={() => submitButtonRef.current.onError()}
        onValuesChange={(_, values) => {
          if (values['password'] && values['new-password']) {
            // password changed verify new password
            form.validateFields(['new-password'])
          }
        }}
      >
        <CustomFormItem.Email
          key="email"
          name="email"
          className="authing-g2-input-form"
          validateFirst={true}
          form={form}
          checkRepeat={true}
          required={true}
        >
          <Input
            autoFocus={!isPhoneMedia}
            className="authing-g2-input"
            autoComplete="off"
            size="large"
            placeholder={t('login.inputEmail')}
            // prefix={<UserOutlined style={{ color: '#878A95' }} />}
            prefix={
              <IconFont
                type="authing-a-user-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </CustomFormItem.Email>
        <CustomFormItem.Password
          key="password"
          name="password"
          className="authing-g2-input-form"
          validateFirst={true}
        >
          <InputPassword
            className="authing-g2-input"
            size="large"
            placeholder={t('login.inputPwd')}
            prefix={
              <IconFont
                type="authing-a-lock-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </CustomFormItem.Password>
        <CustomFormItem.Password
          key="new-password"
          name="new-password"
          fieldRequiredRuleMessage={t('common.repeatPasswordDoc')}
          rules={[
            {
              validateTrigger: 'onBlur',
              validator: (_, value) => {
                if (value !== form.getFieldValue('password') && value) {
                  return Promise.reject(t('common.repeatPasswordDoc'))
                } else {
                  return Promise.resolve()
                }
              },
            },
          ]}
          className="authing-g2-input-form"
          validateFirst={true}
        >
          <InputPassword
            className="authing-g2-input"
            size="large"
            placeholder={t('common.passwordAgain')}
            // prefix={<LockOutlined style={{ color: '#878A95' }} />}
            prefix={
              <IconFont
                type="authing-a-lock-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </CustomFormItem.Password>
        {Boolean(agreements?.length) && (
          <Agreements
            onChange={setAcceptedAgreements}
            agreements={agreements}
            showError={validated}
          />
        )}
        {getPassWordUnsafeText()}
        <Form.Item>
          <SubmitButton
            // disabled={
            //   !!agreements.find((item) => item.required && !acceptedAgreements)
            // }
            text={t('common.register')}
            ref={submitButtonRef}
          />
        </Form.Item>
      </Form>
    </div>
  )
}
