import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  useEffect,
} from 'react'
import { Button } from 'antd'
import { useShaking } from '../_utils/hooks'

interface SubmitButtonProps {
  text?: string
  className?: string
  onClick?: any
}
const SubmitButton = (props: SubmitButtonProps, ref: any) => {
  let [spin, setSpin] = useState(false) // spin 状态需要手动设置关闭
  let [shaking, setShaking] = useState(false) // 抖动状态会自动关闭
  let { MountShaking, UnMountShaking } = useShaking() // 协议和 form input 抖动的挂载和卸载

  useEffect(() => {
    let timeOut: NodeJS.Timeout
    if (shaking === true) {
      timeOut = setTimeout(() => {
        UnMountShaking()
      }, 1000)
    }

    return () => {
      clearTimeout(timeOut)
    }
  }, [UnMountShaking, shaking])

  useImperativeHandle(ref, () => ({
    onError: (text?: string) => {
      setSpin(false)
      MountShaking()
      setShaking(true)
    },
    onSpin: (sp: boolean) => {
      setSpin(sp)
    },
  }))

  let propsCls = props.className ? props.className : ''
  // let shakingCls = shaking ? 'shaking' : ''
  let shakingCls = ''
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
