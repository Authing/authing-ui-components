import { User } from 'authing-js-sdk'
import { ExtendsField } from '../CompleteInfo/interface'

export const completeFieldsFilter = (user: User, field: ExtendsField) => {
  if (!user) {
    return true
  }
  const { name } = field
  if (name === 'email' && user?.email) {
    return false
  }
  if (name === 'phone' && user?.phone) {
    return false
  }
  if (name === 'username') {
    if (user[name] === user['phone'] || user[name] === user['email']) {
      return true
    }
  }

  // gender 默认是 U
  if (name === 'gender' && user[name] === 'U') {
    return true
  }
  // 如果基础字段里面已经有了，不再要求补全
  if (
    user[name as keyof User] !== undefined &&
    user[name as keyof User] !== null
  ) {
    return false
  }
  // 如果扩展信息又了，不再要求补全
  const customData = user.customData
  if (
    customData &&
    customData[name] !== undefined &&
    customData[name] !== null
  ) {
    return false
  }
  return true
}
