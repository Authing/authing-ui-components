import { Input } from 'antd'
import { PasswordProps } from 'antd/lib/input'
import React, { FC } from 'react'
import { IconFont } from '../../../AuthingGuard/IconFont'
export const InputPassword: FC<PasswordProps> = (props) => {
  return (
    <Input.Password
      {...props}
      iconRender={(visible) => (
        <span>
          {visible ? (
            <IconFont type="authing-a-eye-line1" />
          ) : (
            <IconFont type="authing-a-eye-close-line1" />
          )}
        </span>
      )}
    />
  )
}
