import React, { FC } from 'react'

import { Button, Checkbox, Form } from 'antd'
import { CopyAbleText } from '../../../../common/CopyAbleText'

export interface MfaResetStep2Props {
  recoverCode: string
  onFinish: () => void
}

export const MfaResetStep2: FC<MfaResetStep2Props> = ({
  recoverCode,
  onFinish,
}) => (
  <Form onFinish={onFinish}>
    <CopyAbleText className="authing-guard-secret-block">
      {recoverCode}
    </CopyAbleText>
    <Form.Item
      valuePropName="checked"
      rules={[
        {
          validateTrigger: [],
          validator(r, v) {
            return new Promise((resolve, reject) => {
              if (!v) {
                reject('请确保您已保存密钥')
              }
              resolve(true)
            })
          },
        },
      ]}
      name="MfaCopyRecoverCode"
    >
      <Checkbox>已经安全地记录了这段密钥</Checkbox>
    </Form.Item>

    <Button
      className="authing-guard-mfa-confirm-btn"
      htmlType="submit"
      block
      type="primary"
      size="large"
    >
      确定
    </Button>
  </Form>
)
