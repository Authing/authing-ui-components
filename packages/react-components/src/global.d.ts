declare module 'jsencrypt' {
  export default class JSEncrypt {
    constructor()
    setPublicKey(pk: string): void
    encrypt(key: string): string
  }
}
