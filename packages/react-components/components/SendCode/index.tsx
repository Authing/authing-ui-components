import { Col, Row } from 'antd'
import React, { FC } from 'react'

import { SendCodeBtn } from './SendCodeBtn'

import './style.less'
import { useTranslation } from 'react-i18next'

import { InputProps } from 'antd/lib/input'
import { InputNumber } from '../InputNumber'

export interface SendPhoneCodeProps extends InputProps {
  form?: any
  beforeSend?: any // 点击的时候先做这个
  fieldName?: string
  autoSubmit?: boolean //验证码输入完毕是否自动提交
}

export const SendCode: FC<SendPhoneCodeProps> = ({
  value,
  onChange,
  autoSubmit = false,
  form,
  beforeSend,
  maxLength,
  fieldName,
  ...inputProps
}) => {
  const { t } = useTranslation()

  return (
    <>
      <Row justify="space-between" align="middle">
        <Col span={15} className="g2-send-code-input-col">
          <InputNumber
            value={value}
            onChange={(e) => {
              onChange?.(e)
              if (!autoSubmit) return
              if (maxLength && e.target.value.length >= maxLength) {
                form?.submit()
              }
            }}
            {...inputProps}
            maxLength={maxLength}
          />
        </Col>
        <Col offset={1} span={8}>
          <SendCodeBtn
            beforeSend={beforeSend}
            sendDesc={t('common.sendVerifyCode')}
          />
        </Col>
      </Row>
    </>
  )
}
