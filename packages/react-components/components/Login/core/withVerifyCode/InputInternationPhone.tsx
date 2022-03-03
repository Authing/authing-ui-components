import { InputProps } from 'antd/lib/input'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { VerifyLoginMethods } from '../../../AuthingGuard/api'

import { InputNumber } from '../../../InputNumber'
import { VirtualDropdown } from './VirtualDropdown'
export interface InputInternationPhoneProps extends InputProps {
  methods: VerifyLoginMethods[]
  areaCode: string
  onAreaCodeChange: (areaCode: string) => void
}
export const InputInternationPhone: React.FC<InputInternationPhoneProps> = (
  props
) => {
  const { methods, areaCode, onAreaCodeChange, ...inputProps } = props
  const { t } = useTranslation()

  const verifyCodeMethodsText = useMemo<
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
  const placeholder = useMemo(
    () =>
      t('login.inputAccount', {
        text: methods
          ?.map((item) => verifyCodeMethodsText[item])
          .sort((a, b) => a.sort - b.sort)
          .map((item) => item.t)
          .join(' / '),
      }),
    [methods, t, verifyCodeMethodsText]
  )

  return (
    <div>
      <InputNumber
        maxLength={11}
        placeholder={placeholder}
        {...inputProps}
        prefix={
          <VirtualDropdown value={areaCode} onChange={onAreaCodeChange} />
        }
      />
    </div>
  )
}
