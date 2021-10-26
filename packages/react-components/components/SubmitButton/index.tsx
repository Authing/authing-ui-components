import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  useEffect,
} from 'react'
import { Button } from 'antd'

interface SubmitButtonProps {
  text?: string
  className?: string
}
const SubmitButton = (props: SubmitButtonProps, ref: any) => {
  let [shaking, setShaking] = useState(false)

  useEffect(() => {
    if (shaking === true) {
      setTimeout(() => {
        setShaking(false)
      }, 1000)
    }
  }, [shaking])

  useImperativeHandle(ref, () => ({
    onError: (text?: string) => {
      setShaking(true)
    },
  }))

  let propsCls = props.className ? props.className : ''
  let shakingCls = shaking ? 'shaking' : ''
  return (
    <Button
      size="large"
      type="primary"
      htmlType="submit"
      className={`authing-g2-submit-button ${propsCls} ${shakingCls}`}
    >
      {props.text}
    </Button>
  )
}
export default forwardRef(SubmitButton)
