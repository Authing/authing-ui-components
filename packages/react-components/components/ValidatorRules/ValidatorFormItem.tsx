import { Form } from 'antd'
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { fieldRequiredRule, sleep, VALIDATE_PATTERN } from '../_utils'
import { useGuardHttp } from '../_utils/guradHttp'
import { useTranslation } from 'react-i18next'
import {
  ICheckProps,
  ValidatorFormItemMetaProps,
  ValidatorFormItemProps,
} from '.'
import { Rule } from 'antd/lib/form'
import { useDebounce } from '../_utils/hooks'
import { usePublicConfig } from '../_utils/context'

const checkError = (message: string) => Promise.reject(new Error(message))

const checkSuccess = (message?: string) => Promise.resolve(message ?? '')

const ValidatorFormItem = forwardRef<ICheckProps, ValidatorFormItemMetaProps>(
  (props, ref) => {
    const {
      form,
      checkRepeat = false,
      method,
      name,
      required,
      ...formItemProps
    } = props
    const publicConfig = usePublicConfig()

    const { get } = useGuardHttp()
    const { t } = useTranslation()
    const [checked, setChecked] = useState(false)

    const [isReady, setIsReady] = useState(false)

    const methodContent = useMemo(() => {
      if (method === 'email')
        return {
          field: t('common.emailLabel'),
          checkErrorMessage: t('common.checkEmail'),
          formatErrorMessage: t('common.emailFormatError'),
          pattern: VALIDATE_PATTERN.email,
        }
      else if (method === 'username') {
        return {
          field: t('common.username'),
          checkErrorMessage: t('common.checkUserName'),
          formatErrorMessage: t('common.usernameFormatError'),
          pattern: VALIDATE_PATTERN.username,
        }
      } else
        return {
          field: t('common.phone'),
          checkErrorMessage: t('common.checkPhone'),
          formatErrorMessage: t('common.phoneFormateError'),
          pattern: VALIDATE_PATTERN.phone,
        }
    }, [method, t])
    const checkField = useDebounce(async (value: string) => {
      if (!(value && methodContent.pattern.test(value))) {
        setIsReady(true)
        return
      }

      let { data } = await get<boolean>(`/api/v2/users/find`, {
        userPoolId: publicConfig?.userPoolId,
        key: value,
        type: method,
      })
      setChecked(Boolean(data))
      form?.validateFields([name ?? method])
      setIsReady(true)
    }, 500)

    useImperativeHandle(ref, () => ({
      check: (values: any) => {
        setChecked(false)
        // @ts-ignore
        if (values[name ?? method]) {
          setIsReady(false)
          // @ts-ignore
          checkField(values[name ?? method])
        }
      },
    }))

    const checkReady = useCallback(async (): Promise<boolean> => {
      if (isReady) return true
      do {
        await sleep(100)
      } while (!isReady)

      return true
    }, [isReady])

    const validator = useCallback(async () => {
      if ((await checkReady()) && checked)
        return checkError(methodContent.checkErrorMessage)
      else return checkSuccess()
    }, [checkReady, checked, methodContent.checkErrorMessage])

    const rules = useMemo<Rule[]>(() => {
      if (required === false) return []
      const rules = [...fieldRequiredRule(methodContent.field)]
      rules.push({
        validateTrigger: 'onBlur',
        pattern: methodContent.pattern,
        message: methodContent.formatErrorMessage,
      })
      checkRepeat &&
        Boolean(publicConfig) &&
        rules.push({
          validator,
        })
      return rules
    }, [required, methodContent, checkRepeat, publicConfig, validator])

    return (
      <Form.Item
        validateFirst={true}
        validateTrigger={['onBlur', 'onChange']}
        rules={[...rules, ...(formItemProps?.rules ?? [])]}
        name={name ?? method}
        {...formItemProps}
      />
    )
  }
)

export const EmailFormItem = forwardRef<ICheckProps, ValidatorFormItemProps>(
  (props, ref) => (
    <ValidatorFormItem ref={ref} required method="email" {...props} />
  )
)

export const PhoneFormItem = forwardRef<ICheckProps, ValidatorFormItemProps>(
  (props, ref) => (
    <ValidatorFormItem ref={ref} required method="phone" {...props} />
  )
)

export const UserNameFormItem = forwardRef<ICheckProps, ValidatorFormItemProps>(
  (props, ref) => (
    <ValidatorFormItem ref={ref} required method="username" {...props} />
  )
)
