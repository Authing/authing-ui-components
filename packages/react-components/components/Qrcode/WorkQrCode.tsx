import React, { FC, useCallback } from 'react'
import { ShieldSpin } from '../ShieldSpin'
import { useGuardHttpClient } from '../_utils/context'
import { usePreQrCode } from './hooks/usePreQrCode'
import { QrCodeResponse, useQrCode } from './hooks/useQrCode'
import { CodeStatus, UiQrCode, UiQrProps } from './UiQrCode'

/**
 * 二维码不同状态下的底部描述文字
 */
export type CodeStatusDescriptions = Partial<
  Record<Exclude<CodeStatus, 'loading'>, string>
>

export type GenRequestParams = {
  /**
   * @description 请求上下文，将会传递到 Pipeline 中
   */
  context?: { [x: string]: any }
  /**
   *  是否获取用户自定义数据
   */
  customData?: { [x: string]: any }
  /**
   * 多租户用的额外的 Idp Id。
   */
  extIdpConnId?: string
  /**
   * @description 是否获取用户自定义数据
   */
  withCustomData?: boolean
}

interface WorkQrCodeProps extends Omit<UiQrProps, 'description' | 'status'> {
  /**
   * 二维码场景
   */
  scene: 'WXAPP_AUTH' | 'APP_AUTH' | 'WECHATMP_AUTH'
  /**
   * TODO: 生成二维码时需要携带的参数，从SDK抄的 我不清楚代表的含义
   */
  genRequestParams: GenRequestParams
  /**
   * 不同状态请求文字
   */
  descriptions: CodeStatusDescriptions
  /**
   * 每当状态变化时，触发的 callback 。
   */
  onStatusChange?: (status: CodeStatus, data: QrCodeResponse) => void
}

const WorkQrCode: FC<WorkQrCodeProps> = (props) => {
  const {
    scene,
    descriptions,
    onStatusChange,
    genRequestParams,
    ...rest
  } = props

  const { context, customData, withCustomData, extIdpConnId } = genRequestParams

  const { get, post } = useGuardHttpClient()

  /**
   * 生成图片
   */
  const genCodeRequest = useCallback(
    () =>
      post<{ random: string; url: string }>(`/api/v2/qrcode/gene`, {
        autoMergeQrCode: false,
        scene,
        context,
        params: customData,
        withCustomData,
        extIdpConnId,
      }),
    [scene, post, context, customData, extIdpConnId, withCustomData]
  )

  const { state, dispatch, referQrCode } = usePreQrCode(genCodeRequest)

  /**
   * 状态检查
   */
  const checkedRequest = useCallback(
    async () => get(`/api/v2/qrcode/check?random=${state.random}`),
    [state.random, get]
  )

  const exchangeUserInfo = useCallback(
    async (ticket: string) =>
      post(`/api/v2/qrcode/userinfo`, {
        ticket,
      }),
    []
  )

  useQrCode(
    {
      state,
      dispatch,
      sleepTime: 1000,
      referQrCode,
      descriptions,
      onStatusChange,
    },
    {
      readyCheckedRequest: checkedRequest,
      alreadyCheckedRequest: checkedRequest,
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

  /**
   * 点击出现遮罩的中间内容区
   * @param status
   */
  const onClickMaskContent = (status: CodeStatus) => {
    referQrCode()
  }

  return (
    <UiQrCode
      src={state.src}
      description={state.description}
      status={state.status}
      loadingComponent={<ShieldSpin />}
      onLoad={onLoadQrcCode}
      onMaskContent={onClickMaskContent}
      {...rest}
    ></UiQrCode>
  )
}

export { WorkQrCode }
