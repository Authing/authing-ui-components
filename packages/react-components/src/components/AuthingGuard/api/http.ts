export const requestClient = async (...rest: Parameters<typeof fetch>) => {
  const res = await fetch(...rest)
  return res.json()
}

export interface AuthingResponse<T=any> {
  code: number
  message?: string
  data?: T
}

requestClient.get = async <T>(path: string, query: Record<string, any> = {}): Promise<AuthingResponse<T>> => {
  const queryStr = Object.entries(query)
    .map((item) => item.join('='))
    .join('&')
  const res = await fetch(`${requestClient.baseUrl}${path}?${queryStr}`)

  return res.json()
}

requestClient.post = async <T>(path: string, data: Record<string, any>): Promise<AuthingResponse<T>> => {
  const res = await fetch(`${requestClient.baseUrl}${path}`, {
    method: 'POST',
  })

  return res.json()
}

requestClient.baseUrl = ''
requestClient.setBaseUrl = (base: string) => {
  requestClient.baseUrl = base.replace(/\/$/, '')
}
