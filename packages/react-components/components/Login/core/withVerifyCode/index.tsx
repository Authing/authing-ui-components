import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Form } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  fieldRequiredRule,
  getUserRegisterParams,
  validate,
} from '../../../_utils'
import SubmitButton from '../../../SubmitButton'
import { IconFont } from '../../../IconFont'
import { Agreements } from '../../../Register/components/Agreements'
import { EmailScene, SceneType } from 'authing-js-sdk'
import { SendCodeByPhone } from '../../../SendCode/SendCodeByPhone'
import {
  useGuardHttpClient,
  useGuardPublicConfig,
} from '../../../_utils/context'
import { SendCodeByEmail } from '../../../SendCode/SendCodeByEmail'
import { FormItemIdentify } from './FormItemIdentify'
import { InputIdentify } from './inputIdentify'
import './styles.less'
import { InputInternationPhone } from './InputInternationPhone'
import { defaultAreaCode, parsePhone } from '../../../_utils/hooks'
import { InputMethod } from '../../../Type'
import { CodeAction } from '../../../_utils/responseManagement/interface'

export const LoginWithVerifyCode = (props: any) => {
  const config = useGuardPublicConfig()

  const {
    agreements,
    methods,
    submitButText,
    onLoginFailed,
    onLoginSuccess,
  } = props

  const verifyCodeLength = config?.verifyCodeLength ?? 4

  const { post } = useGuardHttpClient()

  // 是否开启了国际化短信功能
  const isInternationSms = config?.internationalSmsConfig?.enabled || false

  const [acceptedAgreements, setAcceptedAgreements] = useState(false)

  const [validated, setValidated] = useState(false)

  const [identify, setIdentify] = useState('')
  const [currentMethod, setCurrentMethod] = useState<InputMethod>(methods[0])
  // 是否仅开启国际化短信
  const [isOnlyInternationSms, setInternationSms] = useState(false)
  // 区号 默认
  const [areaCode, setAreaCode] = useState(defaultAreaCode)

  let [form] = Form.useForm()

  let submitButtonRef = useRef<any>(null)
  const { t } = useTranslation()

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
      isOnlyInternationSms,
      t,
      verifyCodeLength,
    ]
  )

  useEffect(() => {
    // 开启国际化配置且登录方式为手机号码时
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
    const reqContent: any = {
      phone: values.phoneNumber,
      code: values.code,
      customData: getUserRegisterParams(),
      autoRegister: props.autoRegister,
      withCustomData: true,
    }

    if (config && config.internationalSmsConfig?.enabled)
      reqContent.phoneCountryCode = values.phoneCountryCode

    const { code, data, onGuardHandling } = await post(
      '/api/v2/login/phone-code',
      reqContent
    )

    submitButtonRef.current.onSpin(false)

    if (code === 200) {
      // props.onLogin(200, data)
      onLoginSuccess(data)
    } else {
      const handMode = onGuardHandling?.()
      // 向上层抛出错误
      handMode === CodeAction.RENDER_MESSAGE && onLoginFailed(code, data)
    }
  }

  const loginByEmailCode = async (values: any) => {
    const reqContent = {
      email: values.identify,
      code: values.code,
      customData: getUserRegisterParams(),
      autoRegister: props.autoRegister,
      withCustomData: true,
    }
    const { code, data, onGuardHandling } = await post(
      '/api/v2/login/email-code',
      reqContent
    )

    submitButtonRef.current.onSpin(false)

    if (code === 200) {
      // props.onLogin(200, data)
      onLoginSuccess(data)
    } else {
      const handMode = onGuardHandling?.()
      // 向上层抛出错误
      handMode === CodeAction.RENDER_MESSAGE && onLoginFailed(code, data)
    }
  }

  const onFinish = async (values: any) => {
    setValidated(true)
    if (agreements?.length && !acceptedAgreements) {
      // message.error(t('common.loginProtocolTips'))
      submitButtonRef.current.onError()
      return
    }
    // 解析手机号码 ==> 输出 phoenNumber 和 phoneCountryCode
    const { phoneNumber, countryCode: phoneCountryCode } = parsePhone(
      isInternationSms,
      values.identify,
      areaCode
    )
    // onBeforeLogin
    submitButtonRef.current.onSpin(true)

    let loginInfo = {
      type: currentMethod,
      data: {
        identity: phoneNumber,
        code: values.code,
        phoneCountryCode,
      },
    }

    let context = await props.onBeforeLogin?.(loginInfo)

    if (!context && !!props.onBeforeLogin) {
      submitButtonRef.current.onSpin(false)
      return
    }
    // 身份源绑定
    if (!!props.onLoginRequest) {
      const res = await props.onLoginRequest?.(loginInfo)
      const { code, data, onGuardHandling } = res

      submitButtonRef?.current.onSpin(false)

      const handMode = onGuardHandling?.()
      // 向上层抛出错误 执行绑定失败钩子
      handMode === CodeAction.RENDER_MESSAGE && onLoginFailed(code, data)

      return
    }

    if (currentMethod === 'phone-code') {
      await loginByPhoneCode({ ...values, phoneNumber, phoneCountryCode })
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
            isOnlyInternationSms
              ? 'authing-g2-input-form remove-padding'
              : 'authing-g2-input-form'
          }
          methods={methods}
          currentMethod={currentMethod}
          areaCode={areaCode}
        >
          {isOnlyInternationSms ? (
            <AreaCodePhoneAccount />
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
