import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useCallback,
  useImperativeHandle,
} from 'react'
import { ShieldSpin } from '../ShieldSpin'
import { useGuardFinallyConfig, useGuardHttpClient } from '../_utils/context'
import { usePreQrCode } from './hooks/usePreQrCode'
import { QrCodeResponse, useQrCode } from './hooks/usePostQrCode'
import { CodeStatus, UiQrCode, UiQrProps } from './UiQrCode'
import { CancelToken } from 'axios'

/**
 * 二维码不同状态下的底部描述文字
 */
export type CodeStatusDescriptions = Partial<
  Record<Exclude<CodeStatus, 'loading'>, UiQrProps['description']>
>

export interface WorkQrCodeRef {
  referQrCode: () => Promise<
    | {
        random: string
        url: string
      }
    | undefined
  >
}

interface WorkQrCodeProps extends Omit<UiQrProps, 'description' | 'status'> {
  /**
   * 二维码场景
   */
  scene: 'WXAPP_AUTH' | 'APP_AUTH' | 'WECHATMP_AUTH'
  /**
   * 不同状态请求文字
   */
  descriptions: CodeStatusDescriptions
  /**
   * 睡眠时间 默认 1000
   */
  sleepTime?: number
  /**
   * 每当状态变化时，触发的 callback 。
   */
  onStatusChange?: (status: CodeStatus, data: QrCodeResponse) => void
  /**
   * 不同状态下点击遮罩中间区域方法
   */
  onClickMaskContent?: (status: CodeStatus) => void
}

//  FC<WorkQrCodeProps>

const WorkQrCodeComponent: ForwardRefRenderFunction<any, WorkQrCodeProps> = (
  props,
  ref
) => {
  const {
    scene,
    descriptions,
    sleepTime = 1000,
    onStatusChange,
    onClickMaskContent,
    ...rest
  } = props

  const { qrCodeScanOptions = {} } = useGuardFinallyConfig()
  const {
    context,
    customData,
    withCustomData,
    extIdpConnId,
  } = qrCodeScanOptions

  const { get, post } = useGuardHttpClient()

  /**
   * 生成图片
   */
  const genCodeRequest = useCallback(
    () =>
      post<{ random: string; url: string }>(`/api/v2/qrcode/gene`, {
        autoMergeQrCode: false,
        scene,
        /**
         * 请求上下文，将会传递到 Pipeline 中
         */
        context,
        /**
         * 是否获取用户自定义数据
         */
        params: customData,
        /**
         * 是否获取用户自定义数据
         */
        withCustomData,
        /**
         * 多租户用的额外的 Idp Id。
         */
        extIdpConnId,
      }),
    [scene, post, context, customData, extIdpConnId, withCustomData]
  )

  const { state, dispatch } = usePreQrCode()

  /**
   * 状态检查
   */
  const checkedRequest = useCallback(
    async () => get(`/api/v2/qrcode/check?random=${state.random}`),
    [state.random, get]
  )

  /**
   * 交换用户信息方法
   */
  const exchangeUserInfo = useCallback(
    async (ticket: string) =>
      post(`/api/v2/qrcode/userinfo`, {
        ticket,
      }),
    [post]
  )

  useQrCode(
    {
      state,
      dispatch,
      sleepTime,
      descriptions,
      onStatusChange,
    },
    {
      readyCheckedRequest: checkedRequest,
      alreadyCheckedRequest: checkedRequest,
      genCodeRequest,
      exchangeUserInfo,
    }
  )

  /**
   * 二维码渲染完成后重置状态
   */
  const onLoadQrcCode = () => {
    dispatch({
      type: 'changeStatus',
      payload: {
        status: 'ready',
      },
    })
  }

  const referQrCode = useCallback(() => {
    dispatch({
      type: 'changeStatus',
      payload: {
        status: 'loading',
      },
    })
  }, [dispatch])

  /**
   * 内置的默认遮罩中间元素点击事件
   */
  const processDefaultMaskClick = (status: CodeStatus) => {
    switch (status) {
      case 'cancel':
      case 'expired':
        referQrCode()
        break
      default:
        break
    }
  }

  /**
   * 点击出现遮罩的中间内容区 TODO: 不同状态等待处理
   * @param status
   */
  const handlerMaskClick = (status: CodeStatus) => {
    if (onClickMaskContent) {
      onClickMaskContent(status)
    } else {
      processDefaultMaskClick(status)
    }
  }

  useImperativeHandle(
    ref,
    () => {
      return {
        referQrCode,
      }
    },
    [referQrCode]
  )

  return (
    <UiQrCode
      src={state.src}
      description={state.description}
      status={state.status}
      loadingComponent={<ShieldSpin />}
      onLoad={onLoadQrcCode}
      onMaskContent={handlerMaskClick}
      {...rest}
    ></UiQrCode>
  )
}

const WorkQrCode = forwardRef(WorkQrCodeComponent)

export { WorkQrCode }
