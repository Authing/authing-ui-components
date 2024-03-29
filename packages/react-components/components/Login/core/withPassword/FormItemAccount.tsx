import { FormItemProps } from 'antd/lib/form'
import FormItem from 'antd/lib/form/FormItem'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PasswordLoginMethods } from '../../../Type/application'
import CustomFormItem from '../../../ValidatorRules'
import { fieldRequiredRule } from '../../../_utils'

export interface FormItemAccountProps extends FormItemProps {
  passwordLoginMethods: PasswordLoginMethods[]
}

export const FormItemAccount: React.FC<FormItemAccountProps> = (props) => {
  const { passwordLoginMethods: methods, ...formItemPtops } = props
  const { t } = useTranslation()
  const runderTemplate = useMemo(() => {
    if (methods.length !== 1)
      return (
        <FormItem
          validateTrigger={['onBlur', 'onChange']}
          rules={fieldRequiredRule(t('common.account'))}
          {...formItemPtops}
        />
      )

    switch (methods[0]) {
      case 'phone-password':
        return (
          <CustomFormItem.Phone {...formItemPtops} isCheckPattern={false} />
        )
      case 'email-password':
        return <CustomFormItem.Email {...formItemPtops} />
      case 'username-password':
        return <CustomFormItem.UserName {...formItemPtops} />
    }
  }, [formItemPtops, methods, t])

  return <>{runderTemplate}</>
}
