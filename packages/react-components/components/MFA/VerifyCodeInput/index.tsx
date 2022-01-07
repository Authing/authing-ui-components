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
  onFinish?: any
}

export const VerifyCodeInput: FC<VerifyCodeInputProps> = ({
  length = 4,
  size = '46px',
  gutter = length > 4 ? '14px' : '24px',
  className,
  onEenter,
  showDivider,
  onChange: onChangeProps,
  value,
  onFinish,
  ...rest
}) => {
  const inputRef = useRef<any[]>([])

  const codeInputRef = useRef<HTMLDivElement>(null)

  const [verifyCode, setVerifyCode] = useState(value ?? [])
  const [focusIndex, setFocusIndex] = useState<number>(0)

  // 聚焦控制
  useEffect(() => {
    inputRef.current[focusIndex].focus()
  }, [focusIndex])

  const onChange = useCallback(
    (codes: string[]) => {
      // const filteredCodes = codes.filter((code) => !!code)
      setVerifyCode(codes)
      onChangeProps?.(codes)
    },
    [onChangeProps]
  )

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
      onChange(codes as string[])

      if (Boolean(val) && Boolean(inputRef.current[index + 1])) {
        setFocusIndex(index + 1)
      }

      // 验证码填写完成后 直接触发 onFinish
      if (codes.filter((code) => Boolean(code)).length >= length) {
        onFinish?.(codes)
      }
    },
    [length, onChange, onFinish, verifyCode]
  )

  const handleKeyDown = (evt: any, index: number) => {
    const currentVal = verifyCode[index]
    switch (evt.key) {
      case 'Backspace':
        if (!currentVal && inputRef.current[index - 1]) {
          handleChange('', index - 1)
          inputRef.current[index - 1].focus()
        }
        break

      case 'Enter':
        onEenter?.()
        break

      case 'Left':
      case 'ArrowLeft':
        evt.preventDefault()
        if (inputRef.current[index - 1]) {
          inputRef.current[index - 1].focus()
        }
        break
      case 'Right':
      case 'ArrowRight':
        evt.preventDefault()
        if (inputRef.current[index + 1]) {
          inputRef.current[index + 1].focus()
        }
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
          onChange(data)
          setFocusIndex(paste.length)
        } else {
          const data = paste.slice(0, length).split('')
          onChange(data)
          setFocusIndex(length - 1)
        }
      }
    }
    el?.addEventListener('paste', pasteEvent)

    return () => {
      el?.removeEventListener('paste', pasteEvent)
    }
  }, [length, onChange, setVerifyCode, verifyCode])

  return (
    <div ref={codeInputRef} className="authing-g2-code-input" {...rest}>
      {new Array(length).fill(0).map((_, index) => {
        return (
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
              className="authing-g2-code-input-item"
              size="large"
              autoFocus={index === 0}
              onKeyDown={(evt) => handleKeyDown(evt, index)}
              value={verifyCode[index]}
              maxLength={1}
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
              <Divider className="authing-g2-code-input-divider" />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
