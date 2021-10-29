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
  onClick?: any
}
const SubmitButton = (props: SubmitButtonProps, ref: any) => {
  let [spin, setSpin] = useState(false) // spin 状态需要手动设置关闭
  let [shaking, setShaking] = useState(false) // 抖动状态会自动关闭

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
    onSpin: (sp: boolean) => {
      setSpin(sp)
    },
  }))

  let propsCls = props.className ? props.className : ''
  let shakingCls = shaking ? 'shaking' : ''
  return (
    <Button
      size="large"
      type="primary"
      htmlType="submit"
      loading={spin}
      onClick={props.onClick ? props.onClick : () => {}}
      className={`authing-g2-submit-button ${propsCls} ${shakingCls}`}
    >
      {props.text}
    </Button>
  )
}
export default forwardRef(SubmitButton)
