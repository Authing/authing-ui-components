import { Input } from 'antd'
import { PasswordProps } from 'antd/lib/input'
import React from 'react'
import { IconFont } from '../IconFont'
export const InputPassword = React.forwardRef<
  React.RefObject<Input>,
  PasswordProps
>((props, ref) => {
  return (
    <Input.Password
      ref={ref}
      {...props}
      iconRender={(visible) => (
        <span style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
          {visible ? (
            <IconFont type="authing-a-eye-line1" />
          ) : (
            <IconFont type="authing-a-eye-close-line1" />
          )}
        </span>
      )}
    />
  )
})
