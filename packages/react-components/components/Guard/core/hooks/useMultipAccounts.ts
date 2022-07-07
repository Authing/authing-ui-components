import { useEffect, useRef } from 'react'
import { cloneDeep } from 'lodash'

export type LoginWay =
  | 'email'
  | 'phone'
  | 'username'
  | 'phone-code'
  | 'email-code'
  | 'social'

const MULTIPLE_ACCOUNT_KEY = '__authing__multiple_accounts'

/**
 * Store instance
 */
export type StoreInstance = ReturnType<MultipleAccount['getStore']>

/**
 * originStore 类型
 */
interface MultipleStore {
  [appId: string]: CurrentStore
}

/**
 * 当前 userId 对应的类型
 */
export interface CurrentStore {
  [id: string]: User
}

export interface User {
  /**
   * 登录方式
   */
  way: LoginWay
  /**
   * 姓名
   */
  name?: string | null
  /**
   * 昵称
   */
  nickname?: string | null
  /**
   * 用户名
   */
  username?: string | null
  /**
   * 手机号
   */
  phone?: string | null
  /**
   * 邮箱
   */
  email?: string | null
  /**
   * 头像
   */
  photo?: string | null
}

class MultipleAccount {
  /**
   * 原始的 localStore 值
   */
  private originStore: MultipleStore = {}
  /**
   * 当前 AppId Store
   */
  private currentStore: MultipleStore[string] = {}
  /**
   * 当前登录方式
   */
  private loginWay?: LoginWay
  private appId: string
  constructor() {
    this.originStore = {}
    this.currentStore = {}
    this.loginWay = undefined
    this.appId = ''
  }

  /**
   * 页面首次加载时初始化 Store
   * 从 LocalStore 中拿值 放到这里来
   */
  private initStore = (appId: string) => {
    this.appId = appId
    // TODO: 单独抽离 utils 方法 localStorage
    this.originStore =
      JSON.parse(localStorage.getItem(MULTIPLE_ACCOUNT_KEY) || '{}') || {}
    this.currentStore = this.getCurrentStore(this.originStore)
  }

  private getCurrentStore = (originStore: MultipleStore) => {
    return cloneDeep(originStore)[this.appId] || {}
  }

  private setLoginWay = (way: LoginWay) => {
    this.loginWay = way
  }

  /**
   * 设置/更新 store 内的用户信息
   */
  private setUserInfo = (user: Omit<User & { id: string }, 'way'>) => {
    if (!user || !this.loginWay) {
      console.log(`User or LoginWay does not exist.`)
    }
    const { photo, nickname, phone, username, email, id } = user
    this.currentStore[id] = Object.assign({
      way: this.loginWay,
      photo,
      nickname,
      phone,
      username,
      email,
      id,
    })
    this.saveStore()
  }

  /**
   * 持久化保存
   */
  private saveStore = () => {
    const newStore = Object.assign({}, this.originStore, {
      [this.appId]: this.currentStore,
    })
    localStorage.setItem(MULTIPLE_ACCOUNT_KEY, JSON.stringify(newStore))
  }

  /**
   * 根据登录的 account 判断本次登录的方式
   * @param account 登录输入的账号
   * @param param1 登录成功返回的相关信息 用户名/手机号/邮箱
   * @returns
   */
  private setLoginWayByHttpData = (
    account: string,
    data: {
      username?: string
      phone?: string
      email?: string
    }
  ) => {
    const { username, phone, email } = data
    switch (account) {
      case username:
        return this.setLoginWay('username')
      case phone:
        return this.setLoginWay('phone')
      case email:
        return this.setLoginWay('email')
    }
  }

  /**
   * 外部暴露方法
   */
  getStore = () => {
    return {
      initStore: this.initStore,
      // 当前登录方式
      setLoginWay: this.setLoginWay,
      // 设置用户信息
      setUserInfo: this.setUserInfo,
      // TODO: 脏逻辑
      setLoginWayByHttpData: this.setLoginWayByHttpData,
    }
  }
}

/**
 * MultipleAccounts 相关 Hook
 */
const useMultipleAccounts = ({ appId }: { appId?: string }) => {
  let store = useRef<StoreInstance>()

  useEffect(() => {
    if (!appId) {
      return
    }
    const instance = new MultipleAccount()
    const storeInstance = instance.getStore()
    storeInstance.initStore(appId)
    store.current = storeInstance
  }, [appId])

  return [store.current]
}

export default useMultipleAccounts
