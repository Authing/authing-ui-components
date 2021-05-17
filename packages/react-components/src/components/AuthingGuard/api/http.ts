import qs from 'qs'
import { i18n } from '../locales'

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
  const res = await fetch(
    `${requestClient.baseUrl}${path}${qs.stringify(query, {
      addQueryPrefix: true,
    })}`,
    {
      ...init,
      headers: {
        ...init?.headers,
        'x-authing-lang': i18n.language,
      },
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
  const res = await fetch(`${requestClient.baseUrl}${path}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      ...config?.headers,
      'Content-Type': 'application/json',
      'x-authing-lang': i18n.language,
    },
  })
  return res.json()
}

requestClient.baseUrl = ''
requestClient.setBaseUrl = (base: string) => {
  requestClient.baseUrl = base.replace(/\/$/, '')
}
