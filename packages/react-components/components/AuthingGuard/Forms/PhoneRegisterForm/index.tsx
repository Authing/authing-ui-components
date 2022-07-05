import { Input, Form, message } from 'antd'
import { FormInstance } from 'antd/lib/form'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'

import { useGuardContext } from '../../../context/global/context'
import {
  PhoneRegisterFormProps,
  RegisterMethods,
} from '../../../../components/AuthingGuard/types'
import {
  getDeviceName,
  getRequiredRules,
  getUserRegisterParams,
  VALIDATE_PATTERN,
} from '../../../_utils'
import { SendPhoneCode } from '../../../../components/AuthingGuard/Forms/SendPhoneCode'
import { RegisterFormFooter } from '../../../../components/AuthingGuard/Forms/RegisterFormFooter'
import { useTranslation } from 'react-i18next'
import { Agreements } from '../Agreements'

export const PhoneRegisterForm = forwardRef<
  FormInstance,
  PhoneRegisterFormProps
>(({ onSuccess, onFail, onValidateFail }, ref) => {
  const {
    state: { authClient, config, guardEvents },
  } = useGuardContext()
  const { t } = useTranslation()

  const [rawForm] = Form.useForm()

  const { agreements, agreementEnabled } = config

  /** 表单是否被提交校验过 */
  const [validated, setValidated] = useState(false)

  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const onFinishFailed = (errorInfo: any) => {
    setLoading(false)
    onValidateFail && onValidateFail(errorInfo)
  }

  const [acceptedAgreements, setAcceptedAgreements] = useState(false)

  const onFinish = async (values: any) => {
    if (guardEvents.onBeforeRegister) {
      try {
        const canRegister = await guardEvents.onBeforeRegister(
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
          setLoading(false)
          return
        }
      } catch (e: any) {
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
      await rawForm.validateFields()

      setValidated(true)

      if (agreementEnabled && agreements?.length && !acceptedAgreements) {
        return
      }

      const { phone, code, password } = values
      const user = await authClient.registerByPhoneCode(
        phone,
        code,
        password,
        {
          browser:
            typeof navigator !== 'undefined' ? navigator.userAgent : null,
          device: getDeviceName(),
        },
        {
          generateToken: true,
          params: getUserRegisterParams(),
        }
      )
      onSuccess && onSuccess(user)
    } catch (error) {
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
          autoComplete="off"
          onChange={(e) => {
            setPhone(e.target.value)
          }}
          size="large"
          placeholder={t('login.inputPhone')}
          prefix={<UserOutlined style={{ color: '#ddd' }} />}
        />
      ),
      name: 'phone',
      rules: getRequiredRules(t('common.phoneNotNull')).concat({
        pattern: VALIDATE_PATTERN.phone,
        message: t('login.phoneError'),
      }),
    },
    {
      component: (
        <Input.Password
          autoComplete="off"
          size="large"
          placeholder={t('common.setPassword')}
          prefix={<LockOutlined style={{ color: '#ddd' }} />}
        />
      ),
      name: 'password',
      rules: getRequiredRules(t('common.passwordNotNull')),
    },
    {
      component: (
        <Input.Password
          autoComplete="off"
          size="large"
          placeholder={t('login.inputPwdAgain')}
          prefix={<LockOutlined style={{ color: '#ddd' }} />}
        />
      ),
      name: 'new-password',
      rules: getRequiredRules(t('common.repeatPassword')).concat({
        validator: (rule, value) => {
          if (value !== rawForm.getFieldValue('password')) {
            return Promise.reject(t('common.repeatPasswordDoc'))
          } else {
            return Promise.resolve()
          }
        },
      }),
    },
    {
      component: (
        <Input
          autoComplete="off"
          size="large"
          placeholder={t('common.inputFourVerifyCode', {
            length: 4,
          })}
          prefix={<SafetyOutlined style={{ color: '#ddd' }} />}
          addonAfter={<SendPhoneCode phone={phone} />}
        />
      ),
      name: 'code',
      rules: getRequiredRules(t('common.captchaCodeNotNull')),
    },
  ]

  return (
    <Form
      form={rawForm}
      onSubmitCapture={() => setLoading(true)}
      onFinishFailed={onFinishFailed}
      onFinish={onFinish}
    >
      {formItems.map((item) => (
        <Form.Item name={item.name} key={item.name} rules={item.rules}>
          {item.component}
        </Form.Item>
      ))}

      {config.agreementEnabled && Boolean(agreements?.length) && (
        <Agreements
          onChange={setAcceptedAgreements}
          agreements={agreements}
          showError={validated}
        />
      )}

      <RegisterFormFooter loading={loading} />
    </Form>
  )
})
