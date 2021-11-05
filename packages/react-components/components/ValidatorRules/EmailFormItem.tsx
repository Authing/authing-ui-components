import { Form } from 'antd'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { fieldRequiredRule, VALIDATE_PATTERN } from '../_utils'
import { useGuardHttp } from '../_utils/guradHttp'
import { useDebounce } from '../_utils/hooks'
import { useTranslation } from 'react-i18next'
import { ICheckProps, ValidatorFormItemProps } from '.'

const checkError = (message: string) => Promise.reject(new Error(message))

const checkSuccess = (message?: string) => Promise.resolve(message)

export const EmailFormItem = forwardRef<ICheckProps, ValidatorFormItemProps>(
  (props, ref) => {
    const { userPoolId, form, ...formItemProps } = props
    const { get } = useGuardHttp()
    const { t } = useTranslation()
    const [checked, setChecked] = useState(false)

    const checkEmail = useDebounce(async () => {
      const email = form.getFieldValue('email')
      if (!(email && VALIDATE_PATTERN.email.test(email))) {
        return
      }
      let { data } = await get<boolean>(`/api/v2/users/find`, {
        userPoolId: userPoolId,
        key: email,
        type: 'email',
      })
      setChecked(Boolean(data))
      form.validateFields(['email'])
    }, 1000)

    useImperativeHandle(ref, () => ({
      check: () => {
        setChecked(false)
        checkEmail()
      },
    }))

    const validator = (_: any, value: any) => {
      if (!VALIDATE_PATTERN.email.test(value))
        return checkError(t('common.emailFormatError'))

      if (checked) return checkError(t('common.checkEmail'))
      else return checkSuccess()
    }

    return (
      <Form.Item
        name="email"
        rules={[
          ...fieldRequiredRule(t('common.emailLabel')),
          {
            validator,
            validateTrigger: 'onChange',
          },
        ]}
        {...formItemProps}
      />
    )
  }
)
