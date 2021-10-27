import { AuthingGuard } from './AuthingGuard'

export * from './AuthingGuard/types'
export * from './AuthingGuard/hooks'
export type { AuthenticationClientOptions } from 'authing-js-sdk'

export { AuthingGuard }

export type { GuardProps } from './Guard'
export { default as Guard } from './Guard'
