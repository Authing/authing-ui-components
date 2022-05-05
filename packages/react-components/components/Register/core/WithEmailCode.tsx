import { Form, Input, message } from 'antd'
import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Agreement, ApplicationConfig } from '../../AuthingGuard/api'
import { useGuardAuthClient } from '../../Guard/authClient'
import { fieldRequiredRule, getDeviceName } from '../../_utils'
import { Agreements } from '../components/Agreements'
import SubmitButton from '../../SubmitButton'
import CustomFormItem from '../../ValidatorRules'
import { IconFont } from '../../IconFont'
import { EmailScene, RegisterMethods } from 'authing-js-sdk'
import { useIsChangeComplete } from '../utils'
import { useGuardModule } from '../../_utils/context'
import { GuardModuleType } from '../../Guard'
import { SendCodeByEmail } from '../../SendCode/SendCodeByEmail'
import { getGuardHttp } from '../../_utils/guardHttp'

export interface RegisterWithEmailCodeProps {
  // onRegister: Function
  onRegisterSuccess: Function
  onRegisterFailed: Function
  onBeforeRegister?: Function
  agreements: Agreement[]
  publicConfig?: ApplicationConfig
  registeContext?: any
}

export const RegisterWithEmailCode: React.FC<RegisterWithEmailCodeProps> = ({
  onRegisterSuccess,
  onRegisterFailed,
  onBeforeRegister,
  agreements,
  publicConfig,
  registeContext,
}) => {
  const { t } = useTranslation()

  const isChangeComplete = useIsChangeComplete('email')

  const { changeModule } = useGuardModule()

  const submitButtonRef = useRef<any>(null)

  const authClient = useGuardAuthClient()

  const [form] = Form.useForm()

  const [acceptedAgreements, setAcceptedAgreements] = useState(false)

  const [validated, setValidated] = useState(false)

  const verifyCodeLength = publicConfig?.verifyCodeLength ?? 4

  const { post } = getGuardHttp()

  const onFinish = useCallback(
    async (values: any) => {
      submitButtonRef.current.onSpin(true)

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
            context,
            generateToken: true,
            // params: getUserRegisterParams(),
          },
        }

        // 看看是否要跳转到 信息补全
        if (isChangeComplete) {
          changeModule?.(GuardModuleType.REGISTER_COMPLETE_INFO, {
            businessRequestName: 'registerByEmailCode', //用于判断后续使用哪个注册api
            content: registerContent,
          })

          return
        }

        // 注册
        const { code: resCode, data, onGuardHandling, message } = await post(
          '/api/v2/register/email-code',
          {
            email: registerContent.email,
            code: registerContent.code,
            profile: registerContent.profile,
            ...registerContent.options,
          }
        )

        submitButtonRef.current.onSpin(false)
        if (resCode === 200) {
          onRegisterSuccess(data)
        } else {
          onGuardHandling?.()
          onRegisterFailed(code, data, message)
        }
      } catch (error: any) {
        const { code, data, message } = error
        submitButtonRef.current.onError()
        onRegisterFailed(code, data, message)
      } finally {
        submitButtonRef.current?.onSpin(false)
      }
    },
    [
      onBeforeRegister,
      authClient,
      form,
      agreements?.length,
      acceptedAgreements,
      registeContext,
      isChangeComplete,
      post,
      onRegisterSuccess,
      changeModule,
      onRegisterFailed,
    ]
  )

  return (
    <div className="authing-g2-register-email">
      <Form
        form={form}
        name="emailRegister"
        autoComplete="off"
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
      >
        <CustomFormItem.Email
          key="email"
          name="email"
          className={
            publicConfig?.internationalSmsConfig?.enabled
              ? 'authing-g2-input-form remove-padding'
              : 'authing-g2-input-form'
          }
          validateFirst={true}
          form={form}
          checkRepeat={true}
          required={true}
        >
          <Input
            className="authing-g2-input"
            autoComplete="off"
            size="large"
            placeholder={t('login.inputEmail')}
            prefix={
              <IconFont
                type="authing-a-user-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </CustomFormItem.Email>
        <Form.Item
          key="code"
          name="code"
          validateTrigger={['onBlur', 'onChange']}
          rules={fieldRequiredRule(t('common.captchaCode'))}
          className="authing-g2-input-form"
          validateFirst={true}
        >
          <SendCodeByEmail
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
            // 暂无邮箱验证码注册场景 用验证邮箱代替
            scene={EmailScene.VerifyCode}
            maxLength={verifyCodeLength}
            fieldName={'email'}
            form={form}
            onSendCodeBefore={async () => {
              await form.validateFields(['email'])
            }}
          />
        </Form.Item>
        {Boolean(agreements?.length) && (
          <Agreements
            onChange={setAcceptedAgreements}
            agreements={agreements}
            showError={validated}
          />
        )}
        <Form.Item>
          <SubmitButton text={t('common.register')} ref={submitButtonRef} />
        </Form.Item>
      </Form>
    </div>
  )
}
