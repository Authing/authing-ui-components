import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Form } from 'antd'
import { useTranslation } from 'react-i18next'
import { useGuardAuthClient } from '../../../Guard/authClient'
import { fieldRequiredRule, validate } from '../../../_utils'
import SubmitButton from '../../../SubmitButton'
import { IconFont } from '../../../IconFont'
import { Agreements } from '../../../Register/components/Agreements'
import { EmailScene, SceneType } from 'authing-js-sdk'
import { SendCodeByPhone } from '../../../SendCode/SendCodeByPhone'
import { usePublicConfig } from '../../../_utils/context'
import { SendCodeByEmail } from '../../../SendCode/SendCodeByEmail'
import { FormItemIdentify } from './FormItemIdentify'
import { InputIdentify } from './inputIdentify'
import './styles.less'
import { InputInternationPhone } from './InputInternationPhone'

export const LanguageMap: any = {
  'zh-CN': 'CN',
  en: 'GB',
  'en-US': 'US',
  ja: 'JP',
  'de-DE': 'DE',
}

export enum InputMethod {
  EmailCode = 'email-code',
  PhoneCode = 'phone-code',
}
export const LoginWithVerifyCode = (props: any) => {
  const config = usePublicConfig()

  const { agreements, methods, submitButText } = props

  const verifyCodeLength = config?.verifyCodeLength ?? 4

  const [acceptedAgreements, setAcceptedAgreements] = useState(false)

  const [validated, setValidated] = useState(false)

  const [identify, setIdentify] = useState('')

  const [currentMethod, setCurrentMethod] = useState<InputMethod>(methods[0])
  // 是否为国际化短信
  const [isInternationSms, setInternationSms] = useState(false)
  // 区号 默认
  const [areaCode, setAreaCode] = useState(
    LanguageMap[navigator.language] ? LanguageMap[navigator.language] : 'CN'
  )

  let [form] = Form.useForm()

  let submitButtonRef = useRef<any>(null)
  const { t } = useTranslation()

  let client = useGuardAuthClient()

  const SendCode = useCallback(
    (props: any) => {
      if (isInternationSms) {
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
            scene={SceneType.SCENE_TYPE_LOGIN}
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
              scene={SceneType.SCENE_TYPE_LOGIN}
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
              scene={EmailScene.VerifyCode}
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
      t,
      verifyCodeLength,
    ]
  )

  useEffect(() => {
    // TODO 开启国际化配置并登录方式为手机号码时
    if (
      methods.length === 1 &&
      methods[0] === 'phone-code' &&
      config &&
      config.internationalSmsConfig?.enabled
    ) {
      setInternationSms(true)
    }
  }, [config, methods])

  const loginByPhoneCode = async (values: any) => {
    try {
      const user = await client.loginByPhoneCode(values.identify, values.code)
      submitButtonRef.current.onSpin(false)
      props.onLogin(200, user)
    } catch (e: any) {
      submitButtonRef.current.onError()
      props.onLogin(e.code, e.data, e.message)
    } finally {
      submitButtonRef.current?.onSpin(false)
    }
  }

  const loginByEmailCode = async (values: any) => {
    try {
      const user = await client.loginByEmailCode(values.identify, values.code)
      submitButtonRef.current.onSpin(false)
      props.onLogin(200, user)
    } catch (e: any) {
      const error = JSON.parse(e.message)
      submitButtonRef.current.onError()
      props.onLogin(error.code, error.data, error.message)
    } finally {
      submitButtonRef.current?.onSpin(false)
    }
  }

  const onFinish = async (values: any) => {
    setValidated(true)
    if (agreements?.length && !acceptedAgreements) {
      // message.error(t('common.loginProtocolTips'))
      submitButtonRef.current.onError()
      return
    }
    // onBeforeLogin
    submitButtonRef.current.onSpin(true)

    let loginInfo = {
      type: currentMethod,
      data: {
        identity: values.identify,
        code: values.code,
      },
    }
    let context = await props.onBeforeLogin?.(loginInfo)
    if (!context) {
      submitButtonRef.current.onSpin(false)
      return
    }

    if (!!props.onLoginRequest) {
      const res = await props.onLoginRequest?.(loginInfo)
      const { code, message, data } = res
      props.onLogin(code, data, message)
      return
    }

    if (currentMethod === 'phone-code') {
      await loginByPhoneCode(values)
    } else {
      await loginByEmailCode(values)
    }
  }

  const submitText = useMemo(() => {
    if (submitButText) return submitButText

    return props.autoRegister
      ? `${t('common.login')} / ${t('common.register')}`
      : t('common.login')
  }, [props.autoRegister, submitButText, t])

  return (
    <div className="authing-g2-login-phone-code">
      <Form
        name="phoneCode"
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
        autoComplete="off"
      >
        <FormItemIdentify
          name="identify"
          className={
            isInternationSms
              ? 'authing-g2-input-form remove-padding'
              : 'authing-g2-input-form'
          }
          methods={methods}
          currentMethod={currentMethod}
          areaCode={areaCode}
        >
          {isInternationSms ? (
            <InputInternationPhone
              className="authing-g2-input"
              size="large"
              areaCode={areaCode}
              methods={methods}
              onAreaCodeChange={(value: string) => {
                setAreaCode(value)
              }}
            />
          ) : (
            <InputIdentify
              className="authing-g2-input"
              size="large"
              value={identify}
              methods={methods}
              onChange={(e) => {
                let v = e.target.value
                setIdentify(v)
                if (validate('email', v)) {
                  setCurrentMethod(InputMethod.EmailCode)
                }
                if (validate('phone', v)) {
                  setCurrentMethod(InputMethod.PhoneCode)
                }
              }}
            />
          )}
        </FormItemIdentify>

        <Form.Item
          validateTrigger={['onBlur', 'onChange']}
          className="authing-g2-input-form"
          name="code"
          rules={[...fieldRequiredRule(t('common.captchaCode'))]}
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
            text={submitText}
            className="password"
            ref={submitButtonRef}
          />
        </Form.Item>
      </Form>
    </div>
  )
}
