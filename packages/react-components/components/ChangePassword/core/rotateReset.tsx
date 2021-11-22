import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, message } from 'antd'

import { LockOutlined } from '@ant-design/icons'

import { getPasswordValidate } from '../../_utils'
import SubmitButton from '../../SubmitButton'
import { useAuthClient } from '../../Guard/authClient'

interface RotateResetProps {
  onReset: any
  publicConfig: any
  initData: any
}

export const RotateReset = (props: RotateResetProps) => {
  const { t } = useTranslation()
  let [form] = Form.useForm()
  let authClient = useAuthClient()
  let submitButtonRef = useRef<any>(null)

  const onFinish = async (values: any) => {
    let { password, oldPassword } = values
    submitButtonRef?.current?.onSpin(true)

    try {
      let res = await authClient.resetPasswordByForceResetToken({
        token: props.initData.token,
        newPassword: password,
        oldPassword: oldPassword,
      })
      props.onReset(res)
    } catch (error) {
      message.error(error.message)
      submitButtonRef?.current?.onError()
    } finally {
      submitButtonRef?.current?.onSpin(false)
    }
  }

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
        <Form.Item
          className="authing-g2-input-form"
          name="oldPassword"
          rules={[{ required: true }]}
        >
          <Input.Password
            className="authing-g2-input"
            size="large"
            placeholder={t('user.inputCurrPwd')}
            prefix={<LockOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <Form.Item
          className="authing-g2-input-form"
          name="password"
          rules={[
            {
              validator(_, value) {
                if (value && value.indexOf(' ') !== -1) {
                  return Promise.reject(t('common.checkPasswordHasSpace'))
                }
                return Promise.resolve()
              },
            },
            ...getPasswordValidate(
              props.publicConfig?.passwordStrength,
              props.publicConfig?.customPasswordStrength
            ),
          ]}
        >
          <Input.Password
            className="authing-g2-input"
            size="large"
            placeholder={t('login.inputPwd')}
            prefix={<LockOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <Form.Item
          className="authing-g2-input-form"
          name="password2"
          rules={[
            {
              validator(_, value) {
                let pwd = form.getFieldValue('password')
                if (!value) {
                  return Promise.reject(t('login.inputPwd'))
                }
                if (value !== pwd) {
                  return Promise.reject(t('common.repeatPasswordDoc'))
                }
                return Promise.resolve()
              },
            },
          ]}
        >
          <Input.Password
            className="authing-g2-input"
            size="large"
            placeholder={t('login.inputPwdAgain')}
            prefix={<LockOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <Form.Item className="authing-g2-input-form submit-form">
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
