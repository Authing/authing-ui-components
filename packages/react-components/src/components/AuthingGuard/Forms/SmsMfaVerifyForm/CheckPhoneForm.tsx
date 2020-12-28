import React, { FC, useState } from 'react'
import { Button, Form, Input, message } from 'antd'

import { useGuardContext } from '../../../../context/global/context'
import { MFACheckPhoneFormProps } from '../../types'

import './style.less'
import { VALIDATE_PATTERN } from '../../../../utils'

export const CheckPhoneForm: FC<MFACheckPhoneFormProps> = ({
  onSuccess,
  mfaToken,
}) => {
  const {
    state: { authClient },
  } = useGuardContext()

  const [rawForm] = Form.useForm()

  const [loading, setLoading] = useState(false)

  const onFinish = async ({ phone }: any) => {
    try {
      const bindable = await authClient.mfa.phoneOrEmailBindable({
        mfaToken,
        phone,
      })
      if (!bindable) {
        message.error(`${phone} 已被其他账号绑定`)
        return
      }
      onSuccess(phone!)
    } catch (e) {
      // do nothing
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h3 className="authing-guard-mfa-title">绑定手机号</h3>
      <p className="authing-guard-mfa-tips">
        您暂未绑定手机号，请输入手机号进行绑定
      </p>
      <Form
        className="authing-mfa-check-phone-from"
        form={rawForm}
        onSubmitCapture={() => setLoading(true)}
        onFinish={onFinish}
        onFinishFailed={() => setLoading(false)}
      >
        <Form.Item
          name="phone"
          rules={[
            {
              required: true,
              message: '请输入手机号',
            },
            {
              pattern: VALIDATE_PATTERN.phone,
              message: '手机号格式错误',
            },
          ]}
        >
          <Input size="large" placeholder="请输入手机号"></Input>
        </Form.Item>

        <Button
          className="authing-guard-mfa-confirm-btn"
          loading={loading}
          block
          htmlType="submit"
          type="primary"
          size="large"
        >
          确定
        </Button>
      </Form>
    </>
  )
}
