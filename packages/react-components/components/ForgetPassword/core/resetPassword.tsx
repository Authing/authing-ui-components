import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form } from 'antd'
import { useGuardAuthClient } from '../../Guard/authClient'
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
import { usePasswordErrorText } from '../../_utils/useErrorText'
import { getGuardHttp } from '../../_utils/guardHttp'
import { ApiCode } from '../../_utils/responseManagement/interface'
import { useGuardPublicConfig } from '../../_utils/context'
export enum InputMethodMap {
  email = 'email-code',
  phone = 'phone-code',
}
interface ResetPasswordProps {
  onReset: any
  publicConfig: any
  // onSend: (type: 'email' | 'phone') => void
  // onSendError: (type: 'email' | 'phone', error: any) => void
}
export const ResetPassword = (props: ResetPasswordProps) => {
  const { t } = useTranslation()
  let [form] = Form.useForm()
  let [identify, setIdentify] = useState('')
  let [codeMethod, setCodeMethod] = useState<'phone' | 'email'>('phone')
  let submitButtonRef = useRef<any>(null)
  const { isPhoneMedia } = useMediaSize()
  const { post } = getGuardHttp()
  let authClient = useGuardAuthClient()
  const { publicKey } = useGuardPublicConfig()
  const verifyCodeLength = props.publicConfig.verifyCodeLength ?? 4
  // 是否开启了国际化短信功能
  const isInternationSms =
    props.publicConfig.internationalSmsConfig?.enabled || false
  const {
    getPassWordUnsafeText,
    setPasswordErrorTextShow,
  } = usePasswordErrorText()
  const onFinish = async (values: any) => {
    let identify = values.identify
    let code = values.code
    let tempPassword = values.password
    let context = new Promise(() => {})
    const newPassword = await authClient.options?.encryptFunction?.(
      tempPassword,
      publicKey
    )
    if (codeMethod === 'email') {
      context = post('/api/v2/users/password/reset', {
        email: identify,
        code,
        newPassword,
      })
      // context = client.resetPasswordByEmailCode(identify, code, newPassword)
    }
    if (codeMethod === 'phone') {
      const { phoneNumber: phone, countryCode: phoneCountryCode } = parsePhone(
        isInternationSms,
        identify
      )
      context = post('/api/v2/users/password/reset', {
        phone,
        code,
        newPassword,
        phoneCountryCode,
      })
      // context = client.resetPasswordByPhoneCode(
      //   phoneNumber,
      //   code,
      //   newPassword,
      //   countryCode
      // )
    }

    context
      .then((r: any) => {
        const { code } = r
        if (code === ApiCode.UNSAFE_PASSWORD_TIP) {
          setPasswordErrorTextShow(true)
        }
        // props.onSend(codeMethod)
        props.onReset(r)
      })
      .catch((e) => {
        submitButtonRef.current.onError()
        // props.onSendError(codeMethod, e)
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
          checkExist={true}
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
              } else {
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
            placeholder={t('user.inputNewPwd')}
            prefix={
              <IconFont
                type="authing-a-lock-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </CustomFormItem.Password>
        {getPassWordUnsafeText()}
        <Form.Item className="authing-g2-sumbit-form submit-form">
          <SubmitButton
            className="forget-password"
            text={t('common.confirm')}
            ref={submitButtonRef}
          />
        </Form.Item>
      </Form>
    </div>
  )
}
