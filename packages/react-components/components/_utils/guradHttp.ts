import version from '../version'
import { requestClient } from './http'

let httpClient: GuardHttp

export class GuardHttp {
  private requestClient: any
  private headers: Record<string, string> = {
    'x-authing-userpool-id': '',
    'x-authing-app-id': '',
    'x-authing-sdk-version': version,
    'x-authing-request-from': `Guard@${version}`,
  }

  constructor(baseUrl: string) {
    this.getRequestClient().setBaseUrl(baseUrl)
  }

  private getRequestClient() {
    if (!this.requestClient) {
      this.requestClient = requestClient
    }

    return this.requestClient
  }

  setUserpoolId(userpoolId: string) {
    this.headers['x-authing-userpool-id'] = userpoolId
  }

  setAppId(appId: string) {
    this.headers['x-authing-app-id'] = appId
  }

  setTenantId(tenantId: string) {
    this.headers['x-authing-app-tenant-id'] = tenantId
  }

  setBaseUrl(baseUrl: string) {
    this.getRequestClient().setBaseUrl(baseUrl)
  }

  public getHeaders = () => this.headers

  public get = async <T>(
    path: string,
    query: Record<string, any> = {},
    config?: RequestInit
  ) =>
    await requestClient.get<T>(path, query, {
      ...config,
      headers: { ...this.headers, ...config?.headers },
    })

  public post = async <T>(
    path: string,
    data: any,
    config?: {
      headers: any
    }
  ) =>
    await requestClient.post<T>(path, data, {
      headers: {
        ...this.headers,
        ...config?.headers,
      },
    })

  public postForm = async <T>(
    path: string,
    formData: any,
    config?: {
      headers: any
    }
  ) =>
    await requestClient.postForm<T>(path, formData, {
      headers: {
        ...this.headers,
        ...config?.headers,
      },
    })
}

export const initGuardHttp = (baseUrl: string) => {
  if (!httpClient) {
    const guardHttp = new GuardHttp(baseUrl)
    httpClient = guardHttp
  }

  return httpClient
}

export const getGuardHttp = () => {
  if (!httpClient) {
    throw new Error('Please initialize Http Client')
  }

  return httpClient
}

export const useGuardHttp = () => getGuardHttp()