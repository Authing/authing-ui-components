export enum GuardModuleType {
  LOGIN = 'login',
  MFA = 'mfa',
}

export const moduleCodeMap: Record<number, GuardModuleType> = {
  1636: GuardModuleType.MFA,
}
