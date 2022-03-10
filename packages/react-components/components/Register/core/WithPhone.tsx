import { Form } from 'antd'
import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Agreement, ApplicationConfig } from '../../AuthingGuard/api'
import { useGuardAuthClient } from '../../Guard/authClient'
import { fieldRequiredRule, getDeviceName } from '../../_utils'
import { Agreements } from '../components/Agreements'
import SubmitButton from '../../SubmitButton'
import { InputNumber } from '../../InputNumber'
import CustomFormItem, { ICheckProps } from '../../ValidatorRules'
import { IconFont } from '../../IconFont'
import { SceneType } from 'authing-js-sdk'
import { SendCodeByPhone } from '../../SendCode/SendCodeByPhone'
import { InputInternationPhone } from '../../Login/core/withVerifyCode/InputInternationPhone'
import { defaultAreaCode, parsePhone } from '../../_utils/hooks'

export interface RegisterWithPhoneProps {
  onRegister: Function
  agreements: Agreement[]
  publicConfig?: ApplicationConfig
  registeContext?: any
}

export const RegisterWithPhone: React.FC<RegisterWithPhoneProps> = ({
  onRegister,
  agreements,
  publicConfig,
  registeContext,
}) => {
  const { t } = useTranslation()
  const submitButtonRef = useRef<any>(null)
  const authClient = useGuardAuthClient()
  const [form] = Form.useForm()
  const [acceptedAgreements, setAcceptedAgreements] = useState(false)
  const [validated, setValidated] = useState(false)
  // 区号 默认
  const [areaCode, setAreaCode] = useState(defaultAreaCode)
  const ref = useRef<ICheckProps>(null)

  const verifyCodeLength = publicConfig?.verifyCodeLength ?? 4
  const isInternationSms =
    publicConfig?.internationalSmsConfig?.enabled || false
  const onFinish = useCallback(
    async (values: any) => {
      try {
        submitButtonRef.current.onSpin(true)
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
        const user = await authClient.registerByPhoneCode(
          phoneNumber,
          code,
          password,
          {
            browser:
              typeof navigator !== 'undefined' ? navigator.userAgent : null,
            device: getDeviceName(),
          },
          {
            context,
            generateToken: true,
            phoneCountryCode: phoneCountryCode,
            // params: getUserRegisterParams(),
          }
        )
        submitButtonRef.current.onSpin(false)
        onRegister(200, user)
      } catch (error: any) {
        const { code, message, data } = error
        submitButtonRef.current.onError()
        onRegister(code, data, message)
      } finally {
        submitButtonRef.current.onSpin(false)
      }
    },
    [form, acceptedAgreements]
  )

  const PhoenAccount = useCallback(
    (props) => {
      if (publicConfig && publicConfig.internationalSmsConfig?.enabled) {
        return (
          <InputInternationPhone
            {...props}
            className="authing-g2-input"
            size="large"
            areaCode={areaCode}
            onAreaCodeChange={(value: string) => {
              setAreaCode(value)
              form.getFieldValue(['phone']) && form.validateFields(['phone'])
            }}
          />
        )
      } else {
        return (
          <InputNumber
            {...props}
            className="authing-g2-input"
            size="large"
            placeholder={t('login.inputPhone')}
            prefix={
              <IconFont
                type="authing-a-user-line1"
                style={{ color: '#878A95' }}
              />
            }
            maxLength={11}
          />
        )
      }
    },
    [areaCode, form, publicConfig, t]
  )

  const SendCode = useCallback(
    (props) => {
      if (publicConfig && publicConfig.internationalSmsConfig?.enabled) {
        return (
          <SendCodeByPhone
            {...props}
            form={form}
            fieldName="phone"
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
            onSendCodeBefore={async () => {
              await form.validateFields(['phone'])
            }}
          />
        )
      } else {
        return (
          <SendCodeByPhone
            {...props}
            form={form}
            fieldName="phone"
            className="authing-g2-input g2-send-code-input"
            autoComplete="off"
            size="large"
            placeholder={t('common.inputFourVerifyCode', {
              length: verifyCodeLength,
            })}
            maxLength={verifyCodeLength}
            scene={SceneType.SCENE_TYPE_REGISTER}
            prefix={
              <IconFont
                type="authing-a-shield-check-line1"
                style={{ color: '#878A95' }}
              />
            }
            onSendCodeBefore={async () => {
              await form.validateFields(['phone'])
            }}
          />
        )
      }
    },
    [areaCode, form, publicConfig, t, verifyCodeLength]
  )

  return (
    <div className="authing-g2-register-email">
      <Form
        form={form}
        name="emailRegister"
        autoComplete="off"
        onFinish={onFinish}
        onFinishFailed={() => submitButtonRef.current.onError()}
        onValuesChange={(values) => {
          ref.current?.check(values)
        }}
      >
        <CustomFormItem.Phone
          ref={ref}
          key="phone"
          name="phone"
          className={
            publicConfig?.internationalSmsConfig?.enabled
              ? 'authing-g2-input-form remove-padding'
              : 'authing-g2-input-form'
          }
          validateFirst={true}
          form={form}
          checkRepeat={true}
          required={true}
          areaCode={areaCode}
        >
          <PhoenAccount />
        </CustomFormItem.Phone>
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
          <SubmitButton text={t('common.register')} ref={submitButtonRef} />
        </Form.Item>
      </Form>
    </div>
  )
}
