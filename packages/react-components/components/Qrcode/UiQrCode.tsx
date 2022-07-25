import React, { ReactElement, useCallback, useMemo } from 'react'
import className from 'classnames'
import './index.less'
import { useImage } from './hooks/useImage'
import { useStatus } from './hooks/useStatus'

// 配合一些额外的状态吧
// 得多增加一些状态 TODO: 错误分为 1.已过期 2. 未知错误 3. 取消扫码 5. 未知错误
export type CodeStatus =
  | 'loading'
  | 'ready'
  | 'already'
  | 'success'
  | 'error'
  | 'expired'
  | 'cancel'
  | 'MFA'

export const prefix = 'refactor'

export interface UiQrProps {
  /**
   * 组件加载状态
   */
  // loading?: boolean
  /**
   * Loading 组件
   */
  loadingComponent?: React.ReactElement
  /**
   * 二维码组件三种状态
   * ready 准备状态
   * already 已扫描状态
   * success 扫描成功/登录成功状态
   * error 错误状态（超时、网络错误）
   */
  status: CodeStatus
  /**
   * 二维码 URL
   */
  src?: string
  /**
   * 二维码底部描述文字
   */
  description: string
  /**
   * 外层 container 样式
   */
  containerStyle?: React.CSSProperties
  /**
   * 内层 container 样式(图片)
   */
  imageStyle?: React.CSSProperties
  /**
   * 二维码图片准备好的回调
   */
  onLoad?: () => void
  /**
   * 点击遮罩中的内容区
   * status 当前组件所处状态
   */
  onMaskContent?: (status: CodeStatus) => void
}

const QrCode: React.FC<UiQrProps> = (props) => {
  const {
    status,
    loadingComponent,
    src,
    description,
    containerStyle,
    imageStyle,
    onLoad,
    onMaskContent,
  } = props

  const [statusCls, statusComponent] = useStatus(status)

  const [baseUrl] = useImage(src, {
    onLoad,
  })

  const classes = className(`${prefix}-qrcode`, statusCls)

  const Loading = useMemo(() => {
    return loadingComponent || <div>default Loading</div>
  }, [loadingComponent])

  return (
    <div className={classes} style={containerStyle}>
      {status === 'loading' ? (
        Loading
      ) : (
        <>
          <span className={`${prefix}__image-wrapper`}>
            {statusComponent && (
              <div className={`${prefix}-qrcode__mask`}>
                {React.cloneElement(statusComponent as ReactElement, {
                  onClick: (e: React.MouseEvent) => {
                    onMaskContent && onMaskContent(status)
                    ;(statusComponent as ReactElement).props.onClick?.(e)
                  },
                })}
              </div>
            )}
            <img
              className={`${prefix}__image`}
              src={baseUrl}
              alt="二维码"
              style={imageStyle}
            />
          </span>
          <div className={`${prefix}__desc`}>{description}</div>
        </>
      )}
    </div>
  )
}

const UiQrCode = React.memo(QrCode)

export { UiQrCode }
