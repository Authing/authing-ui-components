import qs from 'qs'
import { i18n } from './locales'
import { CodeAction } from './responseManagement/interface'

export const requestClient = async (...rest: Parameters<typeof fetch>) => {
  const res = await fetch(...rest)
  return res.json()
}

export interface AuthingResponse<T = any> {
  code?: number
  statusCode?: number
  apiCode?: number
  data?: T
  messages?: string
  message?: string
}

export interface AuthingGuardResponse<T = any> extends AuthingResponse<T> {
  onGuardHandling?: () => CodeAction
  isFlowEnd?: boolean
}

const timeoutAction = (controller: AbortController) => {
  const timer: number = 10
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = new Response(
        JSON.stringify({
          code: -1,
        })
      )
      resolve(response)

      controller.abort() // 发送终止信号
    }, timer * 1000)
  })
}

requestClient.get = async <T>(
  path: string,
  query: Record<string, any> = {},
  init?: RequestInit
): Promise<AuthingResponse<T>> => {
  let controller = new AbortController()
  let signal = controller.signal

  const headers: Record<string, any> = {
    ...init?.headers,
    'Content-Type': 'application/json',
    [requestClient.langHeader]: i18n.language,
  }

  if (requestClient.tenantId !== '')
    headers[requestClient.tenantHeader] = requestClient.tenantId

  try {
    const res = await Promise.race([
      timeoutAction(controller),
      fetch(
        `${requestClient.baseUrl}${path}${qs.stringify(query, {
          addQueryPrefix: true,
        })}`,
        {
          ...init,
          credentials: 'include',
          headers,
          signal,
        }
      ),
    ])
    return (res as Response).json()
  } catch (e) {
    return Promise.resolve({
      code: -2,
    })
  }
}

requestClient.post = async <T>(
  path: string,
  data: any,
  config?: {
    headers: any
  }
): Promise<AuthingResponse<T>> => {
  let controller = new AbortController()
  let signal = controller.signal

  const headers: Record<string, any> = {
    ...config?.headers,
    'Content-Type': 'application/json',
    [requestClient.langHeader]: i18n.language,
  }

  if (requestClient.tenantId !== '')
    headers[requestClient.tenantHeader] = requestClient.tenantId

  try {
    const res = await Promise.race([
      timeoutAction(controller),
      fetch(`${requestClient.baseUrl}${path}`, {
        signal,
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...config?.headers,
          [requestClient.langHeader]: i18n.language,
        },
      }),
    ])
    return (res as Response).json()
  } catch (e) {
    return Promise.resolve({
      code: -2,
    })
  }

  // const res = await fetch(`${requestClient.baseUrl}${path}`, {
  //   method: 'POST',
  //   body: JSON.stringify(data),
  //   credentials: 'include',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     ...config?.headers,
  //     [requestClient.langHeader]: i18n.language,
  //   },
  // })
}

requestClient.postForm = async <T>(
  path: string,
  formData: any,
  config?: {
    headers: any
  }
): Promise<AuthingResponse<T>> => {
  let controller = new AbortController()
  let signal = controller.signal

  const res = await Promise.race([
    timeoutAction(controller),
    fetch(`${requestClient.baseUrl}${path}`, {
      signal,
      method: 'post',
      body: formData,
      credentials: 'include',
      headers: {
        ...config?.headers,
        [requestClient.langHeader]: i18n.language,
      },
    }),
  ])

  return (res as Response).json()
}

requestClient.baseUrl = ''
requestClient.setBaseUrl = (base: string) => {
  requestClient.baseUrl = base.replace(/\/$/, '')
}

const DEFAULT_LANG_HEADER = 'x-authing-lang'
const DEFAULT_TENANT_HEADER = 'x-authing-app-tenant-idåå'
requestClient.langHeader = DEFAULT_LANG_HEADER
requestClient.tenantHeader = DEFAULT_TENANT_HEADER
requestClient.tenantId = ''

requestClient.setLangHeader = (key: string | undefined) => {
  requestClient.langHeader = key || DEFAULT_LANG_HEADER
}

requestClient.setTenantHeader = (key: string | undefined) => {
  requestClient.tenantHeader = key || DEFAULT_LANG_HEADER
}

requestClient.setTenantId = (tenantId: string) => {
  requestClient.tenantId = tenantId
}
