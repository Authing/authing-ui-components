import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input } from 'antd'
import { StoreValue } from 'antd/lib/form/interface'

import { UserOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons'
import { SendCode } from '../../SendCode'

import { useAuthClient } from '../../Guard/authClient'
import { getPasswordValidate, validate } from '../../_utils'
import SubmitButton from '../../SubmitButton'

interface FirstLoginResetProps {
  onReset: any
  publicConfig: any
}
export const FirstLoginReset = (props: FirstLoginResetProps) => {
  const { t } = useTranslation()
  let [form] = Form.useForm()
  let client = useAuthClient()
  let submitButtonRef = useRef<any>(null)

  const onFinish = async (values: any) => {
    let newPassword = values.password
    let newPassword2 = values.password2

    // let context = new Promise(() => {})
    // context
    //   .then((r) => {
    //     props.onReset(r)
    //   })
    //   .catch((e) => {
    //     props.onReset(e)
    //   })
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
          name="password"
          rules={[
            {
              validator(_, value) {
                if (value.indexOf(' ') !== -1) {
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
            placeholder={'请输入新密码'}
            prefix={<LockOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <Form.Item className="authing-g2-input-form" name="password2">
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
