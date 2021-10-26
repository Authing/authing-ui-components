import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Form, Input, Select } from 'antd'
import { StoreValue } from 'antd/lib/form/interface'

import { UserOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons'
import { SendCode } from 'src/components/SendCode'

import { useAuthClient } from '../../Guard/authClient'
import { getPasswordValidate, validate } from 'src/utils'
import SubmitButton from 'src/components/SubmitButton'

interface describeQuestionsProps {}

export const DescribeQuestions = (props: describeQuestionsProps) => {
  const { t } = useTranslation()
  let [form] = Form.useForm()
  let [identify, setIdentify] = useState('')
  let [codeMethod, setCodeMethod] = useState<'phone' | 'email'>('phone')
  let client = useAuthClient()
  let submitButtonRef = useRef<any>(null)

  // const onFinish = async (values: any) => {
  //   let identify = values.identify
  //   let code = values.code
  //   let newPassword = values.password
  //   let context = new Promise(() => {})

  //   if (codeMethod === 'email') {
  //     // let r = await
  //     context = client.resetPasswordByEmailCode(identify, code, newPassword)
  //   }
  //   if (codeMethod === 'phone') {
  //     context = client.resetPasswordByPhoneCode(identify, code, newPassword)
  //   }

  //   context
  //     .then((r) => {
  //       props.onReset(r)
  //     })
  //     .catch((e) => {
  //       props.onReset(e)
  //     })
  // }

  return (
    <div className="authing-g2-describe-questions">
      <Form
        name="resetPassword"
        layout="vertical"
        form={form}
        // onFinish={onFinish}
        // onFinishFailed={() => {
        //   submitButtonRef?.current?.onError()
        // }}
        autoComplete="off"
      >
        <Form.Item
          className="authing-g2-input-form"
          name="identify"
          label="联系方式"
          rules={[{ required: true, message: '请输入联系方式' }]}
        >
          <Input
            className="authing-g2-input"
            autoComplete="tel"
            size="large"
            placeholder={t('login.inputPhoneOrEmail')}
            prefix={<UserOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <Form.Item
          className="authing-g2-input-form"
          label="相关问题"
          name="questionPicker"
        >
          <Select className="authing-g2-select">
            <Select.Option value="1">问题1</Select.Option>
            <Select.Option value="2">问题2</Select.Option>
            <Select.Option value="3">问题3</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item className="authing-g2-input-form submit-form">
          <SubmitButton
            className="forget-password"
            text="提交"
            ref={submitButtonRef}
          />
        </Form.Item>
      </Form>
    </div>
  )
}
