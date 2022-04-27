import { User } from 'authing-js-sdk'
import { ApplicationConfig } from '../AuthingGuard/api'
import {
  CompleteInfoBaseControls,
  CompleteInfoExtendsControls,
  CompleteInfoMetaData,
  CompleteInfoRequest,
  ExtendsField,
} from '../CompleteInfo/interface'

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

export const extendsFieldsToMetaData = (
  extendsFields: ApplicationConfig['extendsFields'] = [],
  selectOptions: {
    key: string
    options: {
      value: string
      label: string
    }[]
  }[]
): CompleteInfoMetaData[] =>
  extendsFields.map((item) => {
    return {
      type: item.inputType as
        | CompleteInfoBaseControls
        | CompleteInfoExtendsControls,
      label: item.label,
      name: item.name,
      required: item.required,
      validateRules: item.validateRules,
      options: selectOptions.find((option) => option.key === item.name)
        ?.options,
    }
  })

export const fieldValuesToRegisterProfile = (
  extendsFields: ApplicationConfig['extendsFields'],
  fieldValues?: CompleteInfoRequest['fieldValues']
) => {
  const registerProfile: Record<string, any> = {
    udf: [],
  }

  fieldValues?.forEach(({ name, value, code }) => {
    const fieldType = extendsFields.find((item) => item.name === name)?.type

    // 根据字段类型生成不同的数据结构
    if (fieldType === 'internal') {
      if (name === 'phone') registerProfile.phoneToken = code

      if (name === 'email') registerProfile.emailToken = code

      registerProfile[name] = value
    } else if (fieldType === 'user') {
      registerProfile.udf.push({
        key: name,
        value,
      })
    }
  })

  return registerProfile
}
