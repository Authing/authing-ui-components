import Input, { InputProps } from 'antd/lib/input'
import React, { useEffect, useState } from 'react'

export interface InputNumberProps extends InputProps {}

const isPhone = (propsValue?: string | number | readonly string[]) =>
  /^[0-9]*$/.test(String(propsValue))

export const InputNumber = React.forwardRef<any, InputNumberProps>(
  (props, ref) => {
    const { onChange, value: propsValue, ...inputProps } = props
    const [value, setValue] = useState<InputNumberProps['value']>(
      isPhone(propsValue) ? propsValue : ''
    )

    const valueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
      onChange?.(e)
    }

    useEffect(() => {
      setValue(isPhone(propsValue) ? propsValue : '')
    }, [propsValue])

    return (
      <Input
        {...inputProps}
        ref={ref}
        value={value}
        type="tel"
        pattern="[0-9]*"
        onChange={(e) => {
          let v = e.target.value
          if (!/^[0-9]*$/.test(v)) {
            return
          }

          valueChange(e)
        }}
      />
    )
  }
)
