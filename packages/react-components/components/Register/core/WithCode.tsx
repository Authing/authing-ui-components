import { Form, message } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Agreement, ApplicationConfig } from '../../AuthingGuard/api'
import {
  fieldRequiredRule,
  getDeviceName,
  getUserRegisterParams,
  validate,
} from '../../_utils'
import { Agreements } from '../components/Agreements'
import SubmitButton from '../../SubmitButton'

import { IconFont } from '../../IconFont'
import { SceneType } from 'authing-js-sdk'
import { SendCodeByPhone } from '../../SendCode/SendCodeByPhone'
import { InputInternationPhone } from '../../Login/core/withVerifyCode/InputInternationPhone'
import { parsePhone, useMediaSize } from '../../_utils/hooks'
import { useIsChangeComplete } from '../utils'
import { useGuardFinallyConfig, useGuardModule } from '../../_utils/context'
import { GuardModuleType } from '../../Guard'
import { useGuardHttp } from '../../_utils/guardHttp'
import { useGuardAuthClient } from '../../Guard/authClient'
import { FormItemIdentify } from '../../Login/core/withVerifyCode/FormItemIdentify'
import { InputIdentify } from '../../Login/core/withVerifyCode/inputIdentify'
import { EmailScene, InputMethod, RegisterMethods } from '../..'
import { SendCodeByEmail } from '../../SendCode/SendCodeByEmail'

export interface RegisterWithCodeProps {
  // onRegister: Function
  onRegisterSuccess: Function
  onRegisterFailed: Function
  onBeforeRegister?: Function
  agreements: Agreement[]
  publicConfig?: ApplicationConfig
  registeContext?: any
  methods: any[]
}

export const RegisterWithCode: React.FC<RegisterWithCodeProps> = ({
  onRegisterSuccess,
  onRegisterFailed,
  onBeforeRegister,
  agreements,
  publicConfig,
  registeContext,
  methods = [],
}) => {
  const { t } = useTranslation()

  const isPhoneChangeComplete = useIsChangeComplete('phone')

  const isEmailChangeComplete = useIsChangeComplete('email')

  const config = useGuardFinallyConfig()

  const { isPhoneMedia } = useMediaSize()

  const authClient = useGuardAuthClient()

  const { changeModule } = useGuardModule()

  const { post } = useGuardHttp()

  const submitButtonRef = useRef<any>(null)

  const [form] = Form.useForm()

  const [acceptedAgreements, setAcceptedAgreements] = useState(false)

  const [validated, setValidated] = useState(false)

  // 区号 默认
  const [areaCode, setAreaCode] = useState(
    publicConfig?.internationalSmsConfig?.defaultISOType || 'CN'
  )

  const verifyCodeLength = publicConfig?.verifyCodeLength ?? 4

  const [currentMethod, setCurrentMethod] = useState(methods[0])

  const [identify, setIdentify] = useState('')
  // 是否仅开启国际化短信
  const [isOnlyInternationSms, setInternationSms] = useState(false)
  // 是否开启了国际化短信功能
  const isInternationSms =
    publicConfig?.internationalSmsConfig?.enabled || false

  useEffect(() => {
    // 开启国际化配置且登录方式为手机号码时
    if (
      methods.length === 1 &&
      methods[0] === 'phone-code' &&
      publicConfig &&
      publicConfig.internationalSmsConfig?.enabled
    ) {
      setInternationSms(true)
    }
  }, [methods, publicConfig])

  const registerByPhoneCode = useCallback(
    async (values: any) => {
      const needPassword = config.passwordLoginMethods?.includes(
        'phone-password'
      )

      submitButtonRef.current?.onSpin(true)

      values.phone = values.identify
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
            submitButtonRef.current.onSpin(false)
            return
          }
        } catch (e: any) {
          if (typeof e === 'string') {
            message.error(e)
          } else {
            message.error(e?.message)
          }
          submitButtonRef.current.onSpin(false)
          return
        }
      }
      try {
        await form.validateFields()

        setValidated(true)

        if (agreements?.length && !acceptedAgreements) {
          // message.error(t('common.registerProtocolTips'))
          submitButtonRef.current.onError()
          // submitButtonRef.current.onSpin(false)
          return
        }

        const { phone, password = '', code } = values

        const context = registeContext ?? {}

        const { phoneNumber, countryCode: phoneCountryCode } = parsePhone(
          isInternationSms,
          phone,
          areaCode
        )

        // 注册
        const options: any = {
          context,
          generateToken: true,
          // 托管模式下注册携带query上自定义参数login_page_context
          params: config?.isHost
            ? getUserRegisterParams(['login_page_context'])
            : undefined,
        }

        if (isInternationSms) {
          options.phoneCountryCode = phoneCountryCode
        }

        const registerContent = {
          phone: phoneNumber,
          code,
          password,
          profile: {
            browser:
              typeof navigator !== 'undefined' ? navigator.userAgent : null,
            device: getDeviceName(),
          },
          options,
        }
        // onRegisterSuccess 注册成功后需要回到对应的登录页面
        const onRegisterSuccessIntercept = (user: any) => {
          onRegisterSuccess(user, {
            registerFrom: RegisterMethods.Phone,
            account: isInternationSms ? '' : phoneNumber,
          })
        }

        if (needPassword) {
          // 判断验证码是否正确
          const {
            statusCode: checkCode,
            data: { valid, message: checkMessage },
          } = await post('/api/v2/sms/preCheckCode', {
            phone: phoneNumber,
            phoneCode: code,
            phoneCountryCode,
          })
          // 验证码校验通过 进入密码补全流程
          if (checkCode === 200 && valid) {
            changeModule?.(GuardModuleType.REGISTER_PASSWORD, {
              businessRequestName: 'registerByPhoneCode',
              content: registerContent,
              isChangeComplete: isPhoneChangeComplete,
              onRegisterSuccess: onRegisterSuccessIntercept,
              onRegisterFailed,
            })
            return
          } else {
            submitButtonRef.current.onError()
            message.error(checkMessage)
            return
          }
        } else {
          // 看看是否要跳转到 信息补全
          if (isPhoneChangeComplete) {
            // 判断验证码是否正确
            const {
              statusCode: checkCode,
              data: { valid, message: checkMessage },
            } = await post('/api/v2/sms/preCheckCode', {
              phone: phoneNumber,
              phoneCode: code,
              phoneCountryCode,
            })

            if (checkCode === 200 && valid) {
              changeModule?.(GuardModuleType.REGISTER_COMPLETE_INFO, {
                businessRequestName: 'registerByPhoneCode',
                content: registerContent,
                onRegisterSuccess: onRegisterSuccessIntercept,
                onRegisterFailed,
              })
              return
            } else {
              submitButtonRef.current.onError()
              message.error(checkMessage)
              return
            }
          }

          const user = await authClient.registerByPhoneCode(
            phoneNumber,
            code,
            password,
            {
              browser:
                typeof navigator !== 'undefined' ? navigator.userAgent : null,
              device: getDeviceName(),
            },
            options
          )

          submitButtonRef.current?.onSpin(false)
          onRegisterSuccessIntercept(user)
        }
      } catch (error: any) {
        const { message: errorMessage, code, data } = error
        submitButtonRef.current.onError()
        message.error(errorMessage)
        !needPassword && onRegisterFailed(code, data, errorMessage)
      } finally {
        submitButtonRef.current?.onSpin(false)
      }
    },
    [
      config?.isHost,
      config.passwordLoginMethods,
      onBeforeRegister,
      authClient,
      form,
      agreements?.length,
      acceptedAgreements,
      registeContext,
      isInternationSms,
      areaCode,
      post,
      changeModule,
      isPhoneChangeComplete,
      onRegisterSuccess,
      onRegisterFailed,
    ]
  )

  const registerByEmailCode = useCallback(
    async (values: any) => {
      const needPassword = config.passwordLoginMethods?.includes(
        'email-password'
      )
      submitButtonRef.current.onSpin(true)
      values.email = values.identify
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
            submitButtonRef.current.onSpin(false)
            return
          }
        } catch (e: any) {
          if (typeof e === 'string') {
            message.error(e)
          } else {
            message.error(e?.message)
          }
          submitButtonRef.current.onSpin(false)
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
        const { email, code } = values

        const context = registeContext ?? {}
        // 注册使用的详情信息
        const registerContent = {
          email,
          code,
          profile: {
            browser:
              typeof navigator !== 'undefined' ? navigator.userAgent : null,
            device: getDeviceName(),
          },
          options: {
            context: JSON.stringify(context),
            generateToken: true,
            // 托管模式下注册携带query上自定义参数login_page_context
            params: config?.isHost
              ? JSON.stringify(getUserRegisterParams(['login_page_context'])) // 特殊处理 resetful api
              : undefined,
          },
        }

        // onRegisterSuccess 注册成功后需要回到对应的登录页面
        const onRegisterSuccessIntercept = (user: any) => {
          onRegisterSuccess(user, {
            registerFrom: RegisterMethods.EmailCode,
            account: email,
          })
        }

        if (needPassword) {
          // 判断验证码是否正确
          const {
            statusCode: checkCode,
            data: { valid, message: checkMessage },
          } = await post('/api/v2/email/preCheckCode', {
            email: email,
            emailCode: code,
          })
          // 验证码校验通过 进入密码补全流程
          if (checkCode === 200 && valid) {
            changeModule?.(GuardModuleType.REGISTER_PASSWORD, {
              businessRequestName: 'registerByEmailCode', //用于判断后续使用哪个注册api
              content: registerContent,
              isChangeComplete: isEmailChangeComplete,
              onRegisterSuccess: onRegisterSuccessIntercept,
              onRegisterFailed,
            })
            return
          } else {
            submitButtonRef.current.onError()
            message.error(checkMessage)
            return
          }
        } else {
          // 看看是否要跳转到 信息补全
          if (isEmailChangeComplete) {
            // 判断验证码是否正确
            const {
              statusCode: checkCode,
              data: { valid, message: checkMessage },
            } = await post('/api/v2/email/preCheckCode', {
              email: email,
              emailCode: code,
            })
            if (checkCode === 200 && valid) {
              changeModule?.(GuardModuleType.REGISTER_COMPLETE_INFO, {
                businessRequestName: 'registerByEmailCode', //用于判断后续使用哪个注册api
                content: registerContent,
                onRegisterSuccess: onRegisterSuccessIntercept,
                onRegisterFailed,
              })
              return
            } else {
              submitButtonRef.current.onError()
              message.error(checkMessage)
              return
            }
          }
          // 注册
          const {
            code: resCode,
            data,
            onGuardHandling,
            message: registerMessage,
          } = await post('/api/v2/register/email-code', {
            email: registerContent.email,
            code: registerContent.code,
            profile: registerContent.profile,
            ...registerContent.options,
          })
          submitButtonRef.current.onSpin(false)
          if (resCode === 200) {
            onRegisterSuccessIntercept(data)
          } else {
            onGuardHandling?.()
            onRegisterFailed(code, data, registerMessage)
          }
        }
      } catch (error: any) {
        const { message: errorMessage, code, data } = error
        submitButtonRef.current.onError()
        message.error(errorMessage)
        !needPassword && onRegisterFailed(code, data, message)
      } finally {
        submitButtonRef.current?.onSpin(false)
      }
    },
    [
      config?.isHost,
      config.passwordLoginMethods,
      onBeforeRegister,
      authClient,
      form,
      agreements?.length,
      acceptedAgreements,
      registeContext,
      post,
      changeModule,
      isEmailChangeComplete,
      onRegisterSuccess,
      onRegisterFailed,
    ]
  )

  const onFinish = useCallback(
    async (values) => {
      if (currentMethod === InputMethod.EmailCode) {
        await registerByEmailCode(values)
      } else if (currentMethod === InputMethod.PhoneCode) {
        await registerByPhoneCode(values)
      }
    },
    [currentMethod, registerByEmailCode, registerByPhoneCode]
  )

  const SendCode = useCallback(
    (props: any) => {
      if (isOnlyInternationSms) {
        return (
          <SendCodeByPhone
            {...props}
            form={form}
            fieldName="identify"
            className="authing-g2-input g2-send-code-input"
            autoComplete="off"
            size="large"
            placeholder={t('common.inputFourVerifyCode', {
              length: verifyCodeLength,
            })}
            areaCode={areaCode}
            prefix={
              <IconFont
                type="authing-a-shield-check-line1"
                style={{ color: '#878A95' }}
              />
            }
            isInternationSms={isInternationSms}
            scene={SceneType.SCENE_TYPE_REGISTER}
            maxLength={verifyCodeLength}
            onSendCodeBefore={async () => {
              await form.validateFields(['identify'])
            }}
          />
        )
      }

      return (
        <>
          {currentMethod === InputMethod.PhoneCode && (
            <SendCodeByPhone
              {...props}
              isInternationSms={isInternationSms}
              className="authing-g2-input g2-send-code-input"
              autoComplete="off"
              size="large"
              placeholder={t('common.inputFourVerifyCode', {
                length: verifyCodeLength,
              })}
              areaCode={areaCode}
              prefix={
                <IconFont
                  type="authing-a-shield-check-line1"
                  style={{ color: '#878A95' }}
                />
              }
              scene={SceneType.SCENE_TYPE_REGISTER}
              maxLength={verifyCodeLength}
              data={identify}
              onSendCodeBefore={async () => {
                await form.validateFields(['identify'])
              }}
            />
          )}
          {currentMethod === InputMethod.EmailCode && (
            <SendCodeByEmail
              {...props}
              className="authing-g2-input g2-send-code-input"
              autoComplete="off"
              size="large"
              placeholder={t('common.inputFourVerifyCode', {
                length: verifyCodeLength,
              })}
              prefix={
                <IconFont
                  type="authing-a-shield-check-line1"
                  style={{ color: '#878A95' }}
                />
              }
              scene={EmailScene.REGISTER_VERIFY_CODE}
              maxLength={verifyCodeLength}
              data={identify}
              onSendCodeBefore={async () => {
                await form.validateFields(['identify'])
              }}
            />
          )}
        </>
      )
    },
    [
      areaCode,
      currentMethod,
      form,
      identify,
      isInternationSms,
      isOnlyInternationSms,
      t,
      verifyCodeLength,
    ]
  )

  // 为了 refresh input
  const AreaCodePhoneAccount = useCallback(
    (props) => {
      return (
        <InputInternationPhone
          {...props}
          className="authing-g2-input"
          size="large"
          areaCode={areaCode}
          onAreaCodeChange={(value: string) => {
            setAreaCode(value)
            form.getFieldValue(['identify']) &&
              form.validateFields(['identify'])
          }}
        />
      )
    },
    [areaCode, form]
  )

  return (
    <div className="authing-g2-register-email">
      <Form
        form={form}
        name="emailRegister"
        autoComplete="off"
        onSubmitCapture={() => submitButtonRef.current.onSpin(true)}
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
      >
        <FormItemIdentify
          name="identify"
          className={
            isOnlyInternationSms
              ? 'authing-g2-input-form remove-padding'
              : 'authing-g2-input-form'
          }
          methods={methods}
          currentMethod={currentMethod}
          areaCode={areaCode}
          checkRepeat={true}
          required={true}
        >
          {isOnlyInternationSms ? (
            <AreaCodePhoneAccount autoFocus={!isPhoneMedia} />
          ) : (
            <InputIdentify
              className="authing-g2-input"
              size="large"
              autoFocus={!isPhoneMedia}
              value={identify}
              methods={methods}
              onChange={(e) => {
                let v = e.target.value
                setIdentify(v)
                if (methods.length === 1) return
                if (validate('email', v)) {
                  setCurrentMethod(InputMethod.EmailCode)
                } else {
                  // 放开手机号校验 方便同时开启邮箱和短信国际化手机号通过
                  setCurrentMethod(InputMethod.PhoneCode)
                }
              }}
              prefix={
                <IconFont
                  type="authing-a-user-line1"
                  style={{ color: '#878A95' }}
                />
              }
            />
          )}
        </FormItemIdentify>

        <Form.Item
          key="code"
          name="code"
          validateTrigger={['onBlur', 'onChange']}
          rules={fieldRequiredRule(t('common.captchaCode'))}
          className="authing-g2-input-form"
          validateFirst={true}
        >
          <SendCode />
        </Form.Item>
        {Boolean(agreements?.length) && (
          <Agreements
            onChange={setAcceptedAgreements}
            agreements={agreements}
            showError={validated}
          />
        )}
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
