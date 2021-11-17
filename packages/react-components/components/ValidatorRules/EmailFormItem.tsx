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
import { ICheckProps, ValidatorFormItemProps } from '.'
import { Rule } from 'antd/lib/form'
import { useDebounce } from '../_utils/hooks'

const checkError = (message: string) => Promise.reject(new Error(message))

const checkSuccess = (message?: string) => Promise.resolve(message ?? '')

export const EmailFormItem = forwardRef<ICheckProps, ValidatorFormItemProps>(
  (props, ref) => {
    const { userPoolId, form, checkRepeat = false, ...formItemProps } = props
    const { get } = useGuardHttp()
    const { t } = useTranslation()
    const [checked, setChecked] = useState(false)

    const [isReady, setIsReady] = useState(false)

    const checkEmail = useDebounce(async () => {
      const email = form?.getFieldValue('email')
      if (!(email && VALIDATE_PATTERN.email.test(email))) {
        return
      }
      let { data } = await get<boolean>(`/api/v2/users/find`, {
        userPoolId: userPoolId,
        key: email,
        type: 'email',
      })
      setChecked(Boolean(data))
      setIsReady(true)
      form?.validateFields(['email'])
    }, 500)

    useImperativeHandle(ref, () => ({
      check: () => {
        setChecked(false)
        setIsReady(false)
        checkEmail()
      },
    }))

    const checkReady = useCallback(async (): Promise<boolean> => {
      if (isReady) return true

      await sleep(100)

      return await checkReady()
    }, [isReady])

    const validator = useCallback(async () => {
      if ((await checkReady()) && checked)
        return checkError(t('common.checkEmail'))
      else return checkSuccess()
    }, [checkReady, checked, t])

    const rules = useMemo<Rule[]>(() => {
      const rules = [
        ...fieldRequiredRule(t('common.emailLabel')),
        {
          validator: (_: any, value: any) => {
            if (!VALIDATE_PATTERN.email.test(value))
              return checkError(t('common.emailFormatError'))

            return checkSuccess()
          },
        },
      ]
      checkRepeat &&
        rules.push({
          validator,
        })

      return rules
    }, [checkRepeat, t, validator])

    return (
      <Form.Item
        validateFirst={true}
        name="email"
        rules={[...rules, ...(formItemProps?.rules ?? [])]}
        {...formItemProps}
      />
    )
  }
)
