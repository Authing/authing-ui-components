import { Divider, Input } from 'antd'
import React, {
  FC,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import './style.less'

interface VerifyCodeInputProps extends React.HTMLAttributes<HTMLDivElement> {
  length?: number
  size?: string
  gutter?: string
  onEenter?: Function
  showDivider?: boolean
  onChange?: any
  value?: Array<number | string>
}

export const VerifyCodeInput: FC<VerifyCodeInputProps> = ({
  size = '46px',
  gutter = '24px',
  className,
  length = 6,
  onEenter,
  showDivider,
  onChange,
  value,
  ...rest
}) => {
  const inputRef = useRef<any[]>([])

  const codeInputRef = useRef<HTMLDivElement>(null)

  const [verifyCode, setVerifyCode] = useState(value ?? [])

  const handleChange = useCallback(
    (val: string | undefined = '', index: number) => {
      const num = parseInt(val)
      if (isNaN(num)) {
        val = ''
      } else {
        val = String(num)
      }
      const codes = [...verifyCode]
      codes[index] = val.split('').slice(-1)[0] || ''
      setVerifyCode(codes)
      onChange?.(codes)

      if (val && inputRef.current[index + 1]) {
        inputRef.current[index + 1].focus()
      }
    },
    [verifyCode, onChange]
  )

  const handleKeyDown = (evt: any, index: number) => {
    const currentVal = verifyCode[index]

    switch (evt.keyCode) {
      case 8:
        if (!currentVal && inputRef.current[index - 1]) {
          handleChange('', index - 1)
          inputRef.current[index - 1].focus()
        }
        break

      case 13:
        onEenter?.()
        break
      default:
        break
    }
  }

  useEffect(() => {
    const el = codeInputRef.current

    const pasteEvent = (e: ClipboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      let paste = e.clipboardData?.getData('text')

      if (paste && !isNaN(parseInt(paste))) {
        if (paste.length < length) {
          const data = verifyCode.map((_i, index) => paste?.[index] ?? '')
          setVerifyCode(data)
          onChange?.(data)
          inputRef.current[paste.length].focus()
        } else {
          const data = paste.slice(0, length).split('')
          setVerifyCode(data)
          onChange?.(data)
          inputRef.current[length - 1].focus()
        }
      }
    }
    el?.addEventListener('paste', pasteEvent)

    return () => {
      el?.removeEventListener('paste', pasteEvent)
    }
  }, [length, onChange, setVerifyCode, verifyCode])

  return (
    <div ref={codeInputRef} className="g2-code-input" {...rest}>
      {new Array(length).fill(0).map((_, index) => (
        <Fragment key={index}>
          <Input
            ref={(el) => (inputRef.current[index] = el)}
            style={{
              width: size,
              minWidth: size,
              minHeight: size,
              height: size,
              lineHeight: size,
              marginLeft: index === 0 ? 0 : gutter,
            }}
            className="g2-code-input-item"
            size="large"
            autoFocus={index === 0}
            onKeyDown={(evt) => handleKeyDown(evt, index)}
            value={verifyCode[index]}
            onChange={(evt) => {
              evt.persist()
              // @ts-ignore
              if (evt.nativeEvent.isComposing) {
                return
              }
              handleChange(evt.target.value, index)
            }}
            pattern="[0-9]*"
            type="tel"
          />
          {showDivider && index === Math.floor(length / 2 - 1) && (
            <Divider className="g2-code-input-divider" />
          )}
        </Fragment>
      ))}
    </div>
  )
}
