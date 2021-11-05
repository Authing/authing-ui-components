import { useRef, useCallback, useState } from 'react'
import { GuardModuleType } from '../../Guard/module'
import { useModule } from '../../context/module/context'
import { GuardConfig } from '../../Guard/config'
import { useTranslation } from 'react-i18next'
import { Rule } from 'antd/lib/form'
import { message } from 'antd'
import { fieldRequiredRule, VALIDATE_PATTERN } from '..'
import { i18n } from '../locales'
import { getGuardHttp, useGuardHttp } from '../guradHttp'
import { debounce } from 'lodash'

export const useChangeModule = () => {
  const { module, changeModule, setInitData } = useModule()

  const nextModule = (nextModuleType: GuardModuleType, nextData?: any) => {
    if (nextModuleType !== module) changeModule(nextModuleType)

    setInitData(nextData ?? {})
  }

  return nextModule
}

let thisAppId: string = ''

export const useAppId = (appId?: string) => {
  if (appId) {
    thisAppId = appId
  }

  return thisAppId
}

export const useDebounce = (
  // 回调函数
  fn: any,
  // 延迟时间
  delay: number
) => {
  const timer = useRef<{ time: any }>({ time: null })
  const errorBody = useRef<{ body: any }>({ body: null })
  return useCallback(
    (...args: any[]) => {
      if (timer.current.time) {
        clearTimeout(timer.current.time)
        timer.current.time = null
      }
      timer.current.time = setTimeout(() => {
        // fn.apply(this, args);
        const res = fn(...args)
        timer.current.time = null
        errorBody.current.body = res
      }, delay)
      if (errorBody.current.body) {
        return Promise.reject(errorBody.current.body)
      } else {
        return Promise.resolve()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timer.current, delay]
  )
}

// export const userValidatorRule = (userpoolId: string) => {
//   const checkError = (message: string) => Promise.reject(new Error(message))

//   const checkSuccess = (message?: string) => Promise.resolve(message)

//   const { get } = getGuardHttp()

//   const emailRest = debounce(async () => {
//     let { data } = await get<boolean>(`/api/v2/users/find`, {
//       userPoolId: userpoolId,
//       key: value,
//       type: 'email',
//     })
//   }, 1000)

//   // Email
//   const emailValidatorRule = (): Rule[] => {
//     const validator = async (_: any, value: any) => {
//       if (!VALIDATE_PATTERN.email.test(value))
//         return checkError(i18n.t('common.emailFormatError'))

//       let { data } = await get<boolean>(`/api/v2/users/find`, {
//         userPoolId: userpoolId,
//         key: value,
//         type: 'email',
//       })

//       if (data) return checkError(i18n.t('common.checkEmail'))
//       else return checkSuccess()
//     }
//   }

//   return { emailRules: emailValidatorRule() }
// }
