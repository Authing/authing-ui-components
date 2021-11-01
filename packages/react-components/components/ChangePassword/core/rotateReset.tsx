import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input } from 'antd'

import { LockOutlined } from '@ant-design/icons'

import { getPasswordValidate } from '../../_utils'
import SubmitButton from '../../SubmitButton'

interface RotateResetProps {
  onReset: any
  publicConfig: any
  initData: any
}

export const RotateReset = (props: RotateResetProps) => {
  const { t } = useTranslation()
  let [form] = Form.useForm()
  // let client = useAuthClient()
  let submitButtonRef = useRef<any>(null)

  const onFinish = async (values: any) => {
    // let newPassword = values.password
    // let res = await client.resetPasswordByFirstLoginToken({
    //   token: props.initData.token,
    //   password: newPassword,
    // })
    // props.onReset(res)
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
            placeholder={'请输入当前密码'}
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
                  return Promise.reject('两次密码需要一致')
                }
                return Promise.resolve()
              },
            },
          ]}
        >
          <Input.Password
            className="authing-g2-input"
            size="large"
            placeholder={'再输入一次密码'}
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