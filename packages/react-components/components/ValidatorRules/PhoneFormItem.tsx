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
import { useDebounce } from '../_utils/hooks'
import { useTranslation } from 'react-i18next'
import { ICheckProps, ValidatorFormItemProps } from '.'
import { Rule } from 'antd/lib/form'

const checkError = (message: string) => Promise.reject(new Error(message))

const checkSuccess = (message?: string) => Promise.resolve(message)

export const PhoneFormItem = forwardRef<ICheckProps, ValidatorFormItemProps>(
  (props, ref) => {
    const { userPoolId, form, checkRepeat = false, ...formItemProps } = props

    const { get } = useGuardHttp()
    const { t } = useTranslation()
    const [checked, setChecked] = useState(false)

    const [isReady, setIsReady] = useState(false)

    const checkPhone = useDebounce(async () => {
      const phone = form?.getFieldValue('phone')
      if (!(phone && VALIDATE_PATTERN.phone.test(phone))) {
        return
      }
      let { data } = await get<boolean>(`/api/v2/users/find`, {
        userPoolId: userPoolId,
        key: phone,
        type: 'phone',
      })

      setChecked(Boolean(data))
      setIsReady(true)
      form?.validateFields(['phone'])
    }, 500)

    useImperativeHandle(ref, () => ({
      check: () => {
        setChecked(false)
        setIsReady(false)
        checkPhone()
      },
    }))

    const checkReady = useCallback(async (): Promise<boolean> => {
      if (isReady) return true

      await sleep(100)

      return await checkReady()
    }, [isReady])

    const validator = useCallback(
      async (_: any, value: any) => {
        if ((await checkReady()) && checked)
          return checkError(t('common.checkPhone'))
        else return checkSuccess()
      },
      [checkReady, checked, t]
    )

    const rules = useMemo<Rule[]>(() => {
      const rules = [
        ...fieldRequiredRule(t('common.phone')),
        {
          validator: (_: any, value: any) => {
            if (!VALIDATE_PATTERN.phone.test(value))
              return checkError(t('common.phoneFormateError'))

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
        name="phone"
        rules={[...rules, ...(formItemProps?.rules ?? [])]}
        {...formItemProps}
      />
    )
  }
)
