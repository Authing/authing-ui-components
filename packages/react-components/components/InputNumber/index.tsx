import Input, { InputProps } from 'antd/lib/input'
import React, { useState } from 'react'

export interface InputNumberProps extends InputProps {}

export const InputNumber: React.FC<InputNumberProps> = (props) => {
  const { onChange, value: propsValue, ...inputProps } = props
  const [value, setValue] = useState<InputNumberProps['value']>(
    /^[0-9]*$/.test(String(propsValue)) ? propsValue : ''
  )

  const valueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    onChange?.(e)
  }

  return (
    <Input
      {...inputProps}
      value={value}
      type="tel"
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
