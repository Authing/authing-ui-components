/* eslint-disable prettier/prettier */
import { FormInstance } from 'antd/lib/form'
import { useEffect, useCallback, useRef, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BackFillMultipleState,
  LoginWay,
} from '../../Guard/core/hooks/useMultipleAccounts'
import { useGuardMultipleInstance } from '../../_utils/context'

/**
 * 多账号登录下 账户 & 登录方式自动回填
 * TODO: HOOK 参数有时间整理成为对象，开始没有想到有这么多
 * 调用地方 core 中需要回填的两个登录方式
 */
function useLoginMultipleBackFill(
  form: FormInstance<any>,
  way: LoginWay,
  formKey: string,
  backfillData?: BackFillMultipleState,
  isOnlyInternationSms?: boolean,
  setAreaCode?: React.Dispatch<React.SetStateAction<string>>
) {
  // 获得格式化后的回填 account，如果是国际化选择框，还需要改变对应选项
  const parseFillData = useCallback(() => {
    const prefix = isOnlyInternationSms
      ? ''
      : backfillData?.phoneCountryCode
        ? backfillData?.phoneCountryCode + `&nbsp`
        : ''

    const content = backfillData?.account || ''

    const account = prefix + content

    return {
      account,
      areaCode: backfillData?.areaCode
    }
  }, [isOnlyInternationSms, backfillData])

  useEffect(() => {
    const matchLoginWay = backfillData?.way === way
    if (backfillData && matchLoginWay) {
      const { account, areaCode } = parseFillData()
      areaCode && setAreaCode?.(areaCode)
      form.setFieldsValue({
        [formKey]: account,
      })
    }
  }, [backfillData, form, formKey, way, setAreaCode, parseFillData])
}

/**
 * 多账号统一状态管理
 * @param setLoginWay
 * @returns
 */
function useLoginMultiple(setLoginWay: React.Dispatch<any>) {
  const multipleQrWay = useRef<string>()
  // 多账号实例
  const {
    instance: multipleInstance,
    referMultipleState,
    isMultipleAccount,
    multipleAccountData: backfillData,
  } = useGuardMultipleInstance()

  const onBackFillData = useCallback(
    (data: BackFillMultipleState) => {
      const { way, qrCodeId } = data
      const qrCodeDefaultTab = qrCodeId ? way + qrCodeId : way
      multipleQrWay.current = qrCodeDefaultTab
      setLoginWay(way)
    },
    [setLoginWay]
  )

  // 没办法了 TODO: 我真的是没办法了... 只有Default方式去硬逻辑加载
  if (backfillData?.qrCodeId) {
    multipleQrWay.current = backfillData.way + backfillData?.qrCodeId
  }

  useLayoutEffect(() => {
    // 非多账号登录页面 并且存在返回值
    if (!isMultipleAccount && backfillData) {
      onBackFillData(backfillData)
    }
  }, [isMultipleAccount, backfillData, onBackFillData])

  return {
    isMultipleAccount,
    multipleInstance,
    referMultipleState,
    backfillData,
    defaultQrWay: multipleQrWay.current,
  }
}

export { useLoginMultipleBackFill, useLoginMultiple }
