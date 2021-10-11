import { AuthenticationClient } from 'authing-js-sdk'

let authClient: AuthenticationClient | null = null

export const useAuthClient = () => {
  if (authClient) {
    return authClient
  }

  return authClient
}
