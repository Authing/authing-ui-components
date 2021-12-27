import qs from 'qs'
import { i18n } from './locales'

export const requestClient = async (...rest: Parameters<typeof fetch>) => {
  const res = await fetch(...rest)
  return res.json()
}

export interface AuthingResponse<T = any> {
  code: number
  message?: string
  data?: T
}

requestClient.get = async <T>(
  path: string,
  query: Record<string, any> = {},
  init?: RequestInit
): Promise<AuthingResponse<T>> => {
  const headers: Record<string, any> = {
    ...init?.headers,
    'Content-Type': 'application/json',
    [requestClient.langHeader]: i18n.language,
  }

  if (requestClient.tenantId !== '')
    headers[requestClient.tenantHeader] = requestClient.tenantId

  const res = await fetch(
    `${requestClient.baseUrl}${path}${qs.stringify(query, {
      addQueryPrefix: true,
    })}`,
    {
      ...init,
      credentials: 'include',
      headers,
    }
  )

  return res.json()
}

requestClient.post = async <T>(
  path: string,
  data: any,
  config?: {
    headers: any
  }
): Promise<AuthingResponse<T>> => {
  const headers: Record<string, any> = {
    ...config?.headers,
    'Content-Type': 'application/json',
    [requestClient.langHeader]: i18n.language,
  }

  if (requestClient.tenantId !== '')
    headers[requestClient.tenantHeader] = requestClient.tenantId

  const res = await fetch(`${requestClient.baseUrl}${path}`, {
    method: 'POST',
    body: JSON.stringify(data),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
      [requestClient.langHeader]: i18n.language,
    },
  })
  return res.json()
}

requestClient.postForm = async <T>(
  path: string,
  formData: any,
  config?: {
    headers: any
  }
): Promise<AuthingResponse<T>> => {
  const res = await fetch(`${requestClient.baseUrl}${path}`, {
    method: 'post',
    body: formData,
    credentials: 'include',
    headers: {
      ...config?.headers,
      [requestClient.langHeader]: i18n.language,
    },
  })
  return res.json()
}

requestClient.baseUrl = ''
requestClient.setBaseUrl = (base: string) => {
  console.log(base)
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
