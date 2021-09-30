import {
  AuthenticationClient,
  AuthenticationClientOptions,
} from 'authing-js-sdk'
import { useEffect, useState } from 'react'
import { defaultGuardConfig } from '../constants'

let authClient: AuthenticationClient | null = null

function debounce(fn: Function, delay: number, immediate = true) {
  let timer: any

  return function (this: any) {
    let context = this
    let args = arguments
    timer && clearTimeout(timer)

    if (immediate && !timer) {
      fn.apply(context, args)
    }

    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}
export interface AuthClientConfig extends AuthenticationClientOptions {
  /**
   * @deprecated 使用 appHost
   */
  appDomain?: string
  /**
   * @deprecated 无需传入
   */
  isSSO?: boolean
  /**
   * @deprecated 使用 appHost
   */
  host?: string
}

export const initAuthClient = (config: AuthClientConfig) => {
  if (authClient) {
    return authClient
  }

  const { appHost, appDomain, host } = config

  /**
   * 兼容之前的参数
   */
  let realHost
  if (appHost) {
    realHost = appHost
  } else if (appDomain) {
    const parsedUrl = new URL(host || defaultGuardConfig.appHost!)
    realHost = `${parsedUrl.protocol}//${appDomain}${
      parsedUrl.port ? ':' + parsedUrl.port : ''
    }`
  } else if (host) {
    realHost = host
  } else {
    realHost = defaultGuardConfig.appHost
  }
  config.appHost = realHost!

  authClient = new AuthenticationClient(config)

  return authClient
}

export const useAuthing = (config?: AuthClientConfig) => {
  return { authClient: getAuthClient(config) }
}

export const getAuthClient = (config?: AuthClientConfig) => {
  if (!authClient && !config) {
    throw new Error(
      'Please `initAuthClient` first or pass `AuthClientConfig` to useAuthing.'
    )
  }

  if (config) {
    initAuthClient(config)
  }

  return authClient
}

export const useMediaSize = () => {
  const global = require('globalthis')()

  // isPhoneMedia
  const [isPhoneMedia, setPhoneMedia] = useState<boolean>(
    global?.window?.innerWidth <= 719
  )

  useEffect(() => {
    const onResize = debounce(() => {
      setPhoneMedia(global?.window?.innerWidth <= 719)
    }, 200)

    window.onresize = onResize
  }, [global])

  return { isPhoneMedia }
}
