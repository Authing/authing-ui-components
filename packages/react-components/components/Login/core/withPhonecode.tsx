import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Form, Input } from 'antd'
import { useTranslation } from 'react-i18next'
import { useGuardAuthClient } from '../../Guard/authClient'
import { fieldRequiredRule, validate } from '../../_utils'
import SubmitButton from '../../SubmitButton'
import { IconFont } from '../../IconFont'
import { Agreements } from '../../Register/components/Agreements'
import { EmailScene, SceneType } from 'authing-js-sdk'
import { SendCodeByPhone } from '../../SendCode/SendCodeByPhone'
import { usePublicConfig } from '../../_utils/context'
import { VerifyLoginMethods } from '../../AuthingGuard/api'
import { StoreValue } from 'antd/lib/form/interface'
import { SendCodeByEmail } from '../../SendCode/SendCodeByEmail'

export const LoginWithPhoneCode = (props: any) => {
  const config = usePublicConfig()

  const { agreements } = props

  const methods = useMemo<VerifyLoginMethods[]>(
    () => config?.verifyCodeTabConfig?.enabledLoginMethods ?? ['phone-code'],
    [config?.verifyCodeTabConfig]
  )

  const verifyCodeLength = config?.verifyCodeLength ?? 4

  const [acceptedAgreements, setAcceptedAgreements] = useState(false)

  const [validated, setValidated] = useState(false)

  const [identify, setIdentify] = useState('')

  const [currentMethod, setCurrentMethod] = useState(methods[0])

  let [form] = Form.useForm()
  let submitButtonRef = useRef<any>(null)
  const { t } = useTranslation()

  let client = useGuardAuthClient()

  const SendCode = useCallback(
    (props: any) => {
      return (
        <>
          {currentMethod === 'phone-code' && (
            <SendCodeByPhone
              {...props}
              className="authing-g2-input"
              autoComplete="one-time-code"
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
          {currentMethod === 'email-code' && (
            <SendCodeByEmail
              {...props}
              className="authing-g2-input"
              autoComplete="one-time-code"
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
              scene={EmailScene.ResetPassword}
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
    [currentMethod, form, identify, t, verifyCodeLength]
  )

  const verifyMethodsText = useMemo<
    Record<
      VerifyLoginMethods,
      {
        t: string
        sort: number
      }
    >
  >(
    () => ({
      'email-code': {
        t: t('common.email'),
        sort: 2,
      },
      'phone-code': {
        t: t('common.phoneNumber'),
        sort: 1,
      },
    }),
    [t]
  )

  const inputPlaceholder = useMemo(
    () =>
      t('login.inputAccount', {
        text: methods
          ?.map((item) => verifyMethodsText[item])
          .sort((a, b) => a.sort - b.sort)
          .map((item) => item.t)
          .join(' / '),
      }),
    [methods, t, verifyMethodsText]
  )

  const loginByPhoneCode = async (values: any) => {
    try {
      const user = await client.loginByPhoneCode(values.identify, values.code)
      submitButtonRef.current.onSpin(false)
      props.onLogin(200, user)
    } catch (e) {
      console.log(e)
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
    } catch (e) {
      const error = JSON.parse(e.message)
      submitButtonRef.current.onError()
      props.onLogin(error.code, {}, error.message)
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
        phone: values.phone,
        code: values.code,
      },
    }
    let context = await props.onBeforeLogin(loginInfo)
    if (!context) {
      submitButtonRef.current.onSpin(false)
      return
    }

    if (currentMethod === 'phone-code') {
      await loginByPhoneCode(values)
    } else {
      await loginByEmailCode(values)
    }
  }

  return (
    <div className="authing-g2-login-phone-code">
      <Form
        name="phoneCode"
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
        autoComplete="off"
      >
        <Form.Item
          validateTrigger={['onBlur', 'onChange']}
          className="authing-g2-input-form"
          name="identify"
          validateFirst={true}
          rules={[
            ...fieldRequiredRule(t('common.account')),
            {
              validator: async (_, value: StoreValue) => {
                if (!value) {
                  return
                }

                if (methods.length === 1) {
                  if (
                    methods[0] === 'phone-code' &&
                    !validate('phone', value)
                  ) {
                    throw new Error(t('common.phoneFormateError'))
                  }

                  if (
                    methods[0] === 'email-code' &&
                    !validate('email', value)
                  ) {
                    throw new Error(t('common.emailFormatError'))
                  }
                } else if (
                  validate('email', value) ||
                  validate('phone', value)
                ) {
                  return
                } else {
                  throw new Error(t('login.inputCorrectPhone'))
                }
              },
            },
          ]}
        >
          <Input
            className="authing-g2-input"
            autoComplete="tel"
            size="large"
            placeholder={inputPlaceholder}
            value={identify}
            onChange={(e) => {
              let v = e.target.value
              setIdentify(v)
              if (validate('email', v)) {
                setCurrentMethod('email-code')
              }
              if (validate('phone', v)) {
                setCurrentMethod('phone-code')
              }
            }}
            prefix={
              <IconFont
                type="authing-a-user-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </Form.Item>
        <Form.Item
          validateTrigger={['onBlur', 'onChange']}
          className="authing-g2-input-form"
          name="code"
          rules={[...fieldRequiredRule(t('common.captchaCode'))]}
        >
          <SendCode />
        </Form.Item>
        {/* <CustomFormItem.Phone
          className="authing-g2-input-form"
          name="phone"
          required={true}
        >
          <InputNumber
            className="authing-g2-input"
            autoComplete="tel"
            type="tel"
            size="large"
            // 只有 InputNumber formatter、controls API
            maxLength={11}
            // formatter={formatPhone}
            // parser={(value) => (value ? value.replaceAll('-', '') : '')}
            placeholder={inputPlaceholder}
            prefix={
              <IconFont
                type="authing-a-user-line1"
                style={{ color: '#878A95' }}
              />
            }
          />
        </CustomFormItem.Phone>
        <Form.Item
          validateTrigger={['onBlur', 'onChange']}
          className="authing-g2-input-form"
          name="code"
          rules={fieldRequiredRule(t('common.captchaCode'))}
        >
          <SendCodeByPhone
            className="authing-g2-input"
            autoComplete="one-time-code"
            size="large"
            placeholder={t('common.inputFourVerifyCode', {
              length: verifyCodeLength,
            })}
            scene={SceneType.SCENE_TYPE_LOGIN}
            maxLength={verifyCodeLength}
            // autoSubmit={!Boolean(agreements?.length)}
            prefix={
              <IconFont
                type="authing-a-shield-check-line1"
                style={{ color: '#878A95' }}
              />
            }
            data={''}
            form={form}
            onSendCodeBefore={() => form.validateFields(['phone'])}
          />
        </Form.Item> */}
        {Boolean(agreements?.length) && (
          <Agreements
            onChange={setAcceptedAgreements}
            agreements={agreements}
            showError={validated}
          />
        )}
        <Form.Item>
          <SubmitButton
            text={
              props.autoRegister
                ? `${t('common.login')} / ${t('common.register')}`
                : t('common.login')
            }
            className="password"
            ref={submitButtonRef}
          />
        </Form.Item>
      </Form>
    </div>
  )
}
