import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'antd'
import { fieldRequiredRule, validate } from '../../_utils'
import SubmitButton from '../../SubmitButton'
import CustomFormItem from '../../ValidatorRules'
import { IconFont } from '../../IconFont'
import { InputPassword } from '../../InputPassword'
import { SceneType } from 'authing-js-sdk'
import { SendCodeByEmail } from '../../SendCode/SendCodeByEmail'
import { SendCodeByPhone } from '../../SendCode/SendCodeByPhone'
import { FormItemIdentify } from '../../Login/core/withVerifyCode/FormItemIdentify'
import { InputIdentify } from '../../Login/core/withVerifyCode/inputIdentify'
import { parsePhone, useMediaSize } from '../../_utils/hooks'
import { EmailScene } from '../../Type'
import { getGuardHttp } from '../../_utils/guardHttp'
import { useGuardAuthClient } from '../../Guard/authClient'

export enum InputMethodMap {
  email = 'email-code',
  phone = 'phone-code',
}
interface ResetPasswordProps {
  onReset: any
  publicConfig: any
  onSend: (type: 'email' | 'phone') => void
  onSendError: (type: 'email' | 'phone', error: any) => void
}
export const SelfUnlock = (props: ResetPasswordProps) => {
  const { t } = useTranslation()
  let [form] = Form.useForm()
  let [identify, setIdentify] = useState('')
  let [codeMethod, setCodeMethod] = useState<'phone' | 'email'>('phone')
  let submitButtonRef = useRef<any>(null)
  const { isPhoneMedia } = useMediaSize()
  let authClient = useGuardAuthClient()
  const verifyCodeLength = props.publicConfig.verifyCodeLength ?? 4
  // 是否开启了国际化短信功能
  const isInternationSms =
    props.publicConfig.internationalSmsConfig?.enabled || false

  const onFinish = async (values: any) => {
    let identify = values.identify
    let code = values.code
    let password = values.password
    let context = new Promise(() => {})
    const { authFlow } = getGuardHttp()
    // @ts-ignore
    const newPassWord = await authClient.options.encryptFunction(
      password,
      // @ts-ignore
      await authClient.publicKeyManager.getPublicKey()
    )
    if (codeMethod === 'email') {
      context = authFlow('unlock-account-by-email', {
        email: identify, // 用户输入的邮箱
        code, // 验证码
        password: newPassWord, // 密码，经过加密后的
      })
    }
    if (codeMethod === 'phone') {
      const { phoneNumber } = parsePhone(isInternationSms, identify)
      context = authFlow('unlock-account-by-phone', {
        phone: phoneNumber, // 用户输入的邮箱
        code, // 验证码
        password: newPassWord, // 密码，经过加密后的
      })
    }

    context
      .then((r) => {
        props.onSend(codeMethod)
        props.onReset(r)
      })
      .catch((e) => {
        submitButtonRef.current.onError()
        props.onSendError(codeMethod, e)
        props.onReset(e)
      })
  }

  const SendCode = useCallback(
    (props: any) => {
      return (
        <>
          {codeMethod === 'phone' && (
            <SendCodeByPhone
              {...props}
              isInternationSms={isInternationSms}
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
              scene={SceneType.SCENE_TYPE_RESET}
              maxLength={verifyCodeLength}
              data={identify}
              onSendCodeBefore={async () => {
                await form.validateFields(['identify'])
              }}
            />
          )}
          {codeMethod === 'email' && (
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
              scene={EmailScene.RESET_PASSWORD_VERIFY_CODE}
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
    [codeMethod, form, identify, isInternationSms, t, verifyCodeLength]
  )

  return (
    <div className="authing-g2-login-phone-code">
      <Form
        name="resetPassword"
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => {
          submitButtonRef?.current?.onError()
        }}
        autoComplete="off"
      >
        <FormItemIdentify
          name="identify"
          className="authing-g2-input-form"
          methods={['email-code', 'phone-code']}
          currentMethod={InputMethodMap[codeMethod]}
        >
          <InputIdentify
            methods={['email-code', 'phone-code']}
            className="authing-g2-input"
            autoComplete="off"
            autoFocus={!isPhoneMedia}
            size="large"
            value={identify}
            onChange={(e) => {
              let v = e.target.value
              setIdentify(v)
              if (validate('email', v)) {
                setCodeMethod('email')
              }
              if (validate('phone', v)) {
                setCodeMethod('phone')
              }
            }}
            prefix={
              <IconFont
                type="authing-a-user-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </FormItemIdentify>

        <Form.Item
          validateTrigger={['onBlur', 'onChange']}
          className="authing-g2-input-form"
          name="code"
          rules={[...fieldRequiredRule(t('common.captchaCode'))]}
        >
          <SendCode />
        </Form.Item>
        <CustomFormItem.Password
          className="authing-g2-input-form"
          name="password"
        >
          <InputPassword
            className="authing-g2-input"
            size="large"
            placeholder={t('user.inputOldPwd')}
            prefix={
              <IconFont
                type="authing-a-lock-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </CustomFormItem.Password>
        <Form.Item className="authing-g2-input-form submit-form">
          <SubmitButton
            className="forget-password"
            text={t('common.unlock')}
            ref={submitButtonRef}
          />
        </Form.Item>
      </Form>
    </div>
  )
}
