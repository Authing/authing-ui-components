import qs from 'qs'

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
    `${requestClient.baseUrl}${path}?${qs.stringify(query)}`,
    init
  )

  return res.json()
}

requestClient.post = async <T>(
  path: string,
  data: any
): Promise<AuthingResponse<T>> => {
  const res = await fetch(`${requestClient.baseUrl}${path}`, {
    method: 'POST',
    body: data,
  })

  return res.json()
}

requestClient.baseUrl = ''
requestClient.setBaseUrl = (base: string) => {
  requestClient.baseUrl = base.replace(/\/$/, '')
}
