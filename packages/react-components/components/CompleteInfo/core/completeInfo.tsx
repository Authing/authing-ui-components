import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Form, Input, message, Select, DatePicker } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { ExtendsField } from '../../AuthingGuard/api'
import { UploadImage } from '../../AuthingGuard/Forms/UploadImage'
import { useGuardAuthClient } from '../../Guard/authClient'
import { i18n } from '../../_utils/locales'
import { useGuardHttp } from '../../_utils/guradHttp'
import { GuardCompleteInfoViewProps } from '../interface'
import SubmitButton from '../../SubmitButton'
import { InputNumber } from '../../InputNumber'
import { completeFieldsFilter } from '../utils'
import { User } from 'authing-js-sdk'
import CustomFormItem, { ICheckProps } from '../../ValidatorRules'
import { SendCode } from '../../SendCode'
import { fieldRequiredRule } from '../../_utils'
export interface CompleteInfoProps {
  user: User
  verifyCodeLength: number | undefined
  extendsFields: ExtendsField[]
  onRegisterInfoCompleted?: GuardCompleteInfoViewProps['onRegisterInfoCompleted']
  onRegisterInfoCompletedError?: GuardCompleteInfoViewProps['onRegisterInfoCompletedError']
}
export interface FieldMetadata {
  key: string
  options: any
}

const filterOption = (input: any, option: any) => {
  return (
    option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
    option.props.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
  )
}

export const CompleteInfo: React.FC<CompleteInfoProps> = (props) => {
  const {
    verifyCodeLength,
    extendsFields,
    onRegisterInfoCompleted,
    onRegisterInfoCompletedError,
    user,
  } = props
  const authClient = useGuardAuthClient()
  const submitButtonRef = useRef<any>(null)
  const [contryList, setContryList] = useState<any>([])
  const [fieldMetadata, setFieldMetadata] = useState<FieldMetadata[]>([])
  // const [user, setUser] = useState<User>()
  const { get, post } = useGuardHttp()
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const refPhone = useRef<ICheckProps>(null)
  const refEmail = useRef<ICheckProps>(null)
  const refUserName = useRef<ICheckProps>(null)

  const loadInitData = useCallback(async () => {
    await authClient.tokenProvider.clearUser()
    await authClient.tokenProvider.setUser(user)

    const { data: resCountryList } = await get<any>(`/api/v2/country-list`)
    const toMap =
      i18n.language === 'zh-CN' ? resCountryList?.zh : resCountryList?.en
    const toSet: any = []
    for (const [key, value] of Object.entries(toMap)) {
      toSet.push({
        label: value,
        value: key,
      })
    }
    setContryList(toSet)
    const { data: currFieldMetadata } = await get<any>(
      `/api/v2/udfs/field-metadata-for-completion`,
      undefined,
      {}
    )
    setFieldMetadata(currFieldMetadata)
  }, [get, setContryList, setFieldMetadata, authClient, user])

  useEffect(() => {
    loadInitData()
  }, [loadInitData])

  const INPUT_MAP: Record<
    string,
    (props?: any) => React.ReactNode | undefined
  > = {
    image: () => <UploadImage />,
    number: () => (
      <InputNumber style={{ width: '100%' }} className="authing-g2-input" />
    ),
    date: () => (
      <DatePicker
        className="authing-g2-input"
        style={{ width: '100%' }}
        placeholder={i18n.t('common.pleaseSelectDate')}
      />
    ),
    datetime: () => (
      <DatePicker
        className="authing-g2-input"
        style={{ width: '100%' }}
        placeholder={i18n.t('common.pleaseSelectDate')}
      />
    ),
    select: (options: any[]) => (
      <Select
        className="authing-g2-select"
        showSearch
        options={options}
        filterOption={filterOption}
      />
    ),
    dropdown: (options: any[]) => (
      <Select
        className="authing-g2-select"
        showSearch
        options={options}
        filterOption={filterOption}
      />
    ),
    boolean: () => (
      <Select
        className="authing-g2-select"
        options={[
          { label: i18n.t('common.yes'), value: true as any },
          { label: i18n.t('common.no'), value: false as any },
        ]}
      />
    ),
    string: () => (
      <Input type="text" size="large" className="authing-g2-input" />
    ),
    text: () => <Input type="text" size="large" className="authing-g2-input" />,
  }
  const INTERNAL_INPUT_MAP: Record<
    string,
    (props: any) => React.ReactNode | undefined
  > = {
    gender: () => (
      <Select
        className="authing-g2-select"
        options={[
          { label: i18n.t('common.man'), value: 'M' },
          { label: i18n.t('common.female'), value: 'F' },
        ]}
      ></Select>
    ),
    country: (contryList: any) => (
      <Select
        className="authing-g2-select"
        options={contryList}
        showSearch
        filterOption={filterOption}
      ></Select>
    ),
    username: (props: any) => (
      <CustomFormItem.UserName
        validateFirst={true}
        className="authing-g2-input-form"
        name="internal username"
        key="internal-usernameadsf"
        label={i18n.t('common.username')}
        required={props.required}
        checkRepeat={true}
        ref={refUserName}
      >
        <Input
          className="authing-g2-input"
          autoComplete="username"
          key="internal-username:asdf"
          size="large"
          maxLength={11}
          placeholder={t('login.inputUsername')}
        />
      </CustomFormItem.UserName>
    ),
    phone: (props: { required?: boolean }) => (
      <>
        <CustomFormItem.Phone
          validateFirst={true}
          className="authing-g2-input-form"
          name="internal phone:phone"
          key="internal-phone:phoneadsf"
          label={i18n.t('common.phoneLabel')}
          required={props.required}
          checkRepeat={true}
          ref={refPhone}
        >
          <InputNumber
            className="authing-g2-input"
            autoComplete="tel"
            key="internal-phone:phone123"
            type="tel"
            size="large"
            maxLength={11}
            placeholder={t('login.inputPhone')}
          />
        </CustomFormItem.Phone>
        <Form.Item
          validateTrigger={['onBlur', 'onChange']}
          className="authing-g2-input-form"
          name="internal phone:code"
          key="internal-phone:codea"
          rules={
            props.required
              ? fieldRequiredRule(t('common.captchaCode'))
              : undefined
          }
        >
          <SendCode
            className="authing-g2-input"
            autoComplete="one-time-code"
            key="internal-phone:phone345"
            size="large"
            placeholder={t('common.inputFourVerifyCode', {
              length: verifyCodeLength,
            })}
            maxLength={verifyCodeLength}
            method="phone"
            fieldName="internal phone:phone"
            data={''}
            form={form}
            onSendCodeBefore={() =>
              form.validateFields(['internal phone:phone'])
            }
          />
        </Form.Item>
      </>
    ),
    email: (props: { required?: boolean }) => (
      <>
        <CustomFormItem.Email
          className="authing-g2-input-form"
          name="internal email:email"
          checkRepeat={true}
          label={i18n.t('common.email')}
          required={props.required}
          key="internal email:email13"
          validateFirst={true}
          ref={refEmail}
        >
          <Input
            className="authing-g2-input"
            autoComplete="email"
            size="large"
            placeholder={t('login.inputEmail')}
          />
        </CustomFormItem.Email>
        <Form.Item
          validateTrigger={['onBlur', 'onChange']}
          className="authing-g2-input-form"
          name="internal email:code"
          key="internal email:code1432"
          rules={
            props.required
              ? fieldRequiredRule(t('common.captchaCode'))
              : undefined
          }
        >
          <SendCode
            className="authing-g2-input"
            autoComplete="one-time-code"
            size="large"
            placeholder={t('common.inputFourVerifyCode', {
              length: verifyCodeLength,
            })}
            maxLength={verifyCodeLength}
            // prefix={<SafetyOutlined style={{ color: '#878A95' }} />}
            method="email"
            data={''}
            fieldName="internal email:email"
            form={form}
            onSendCodeBefore={() =>
              form.validateFields(['internal email:email'])
            }
          />
        </Form.Item>
      </>
    ),
  }

  const formFieldsV2 = useMemo(() => {
    return extendsFields
      .filter((each) => completeFieldsFilter(user as User, each))
      .map((def) => {
        const key = `${def.type} ${def.name}`
        const label =
          i18n.language === 'zh-CN' ? def.label || def.name : def.name
        const required = def.required || false
        const rules = def.validateRules
        const generateRules = () => {
          const l = []
          if (required) {
            l.push({
              required: true,
              message: `${label} ${t('login.noEmpty')}`,
            })
          }
          rules.forEach((rule) => {
            switch (rule.type) {
              case 'isNumber':
                l.push({
                  type: 'number',
                  required,
                  message: rule.error || t('login.mustBeNumber'),
                })
                break
              case 'regExp':
                l.push({
                  required,
                  pattern: new RegExp(rule.content.replaceAll('/', '')),
                  message: rule.error,
                })
                break
              default:
                break
            }
          })
          return l
        }

        const inputElement = () => {
          if (
            def.type === 'internal' &&
            Object.keys(INTERNAL_INPUT_MAP).includes(def.name)
          ) {
            if (def.name === 'country') {
              return INTERNAL_INPUT_MAP[def.name](contryList)
            } else {
              return INTERNAL_INPUT_MAP[def.name]({
                required,
              })
            }
          } else {
            if (Object.keys(INPUT_MAP).includes(def.inputType)) {
              if (def.inputType === 'select') {
                const options =
                  fieldMetadata.find((field) => field.key === def.name)
                    ?.options || []
                return INPUT_MAP[def.inputType](options)
              }
              return INPUT_MAP[def.inputType]()
            }
            return <Input type="text" className="authing-g2-input" />
          }
        }
        if (
          def.type === 'internal' &&
          ['phone', 'email', 'username'].includes(def.name)
        ) {
          return inputElement()
        } else {
          return (
            <Form.Item
              validateTrigger={['onBlur', 'onChange']}
              className="authing-g2-input-form"
              rules={generateRules()}
              key={key}
              name={key}
              label={label}
              style={{ marginBottom: 8 }}
            >
              {inputElement()}
            </Form.Item>
          )
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contryList, extendsFields, fieldMetadata, t, user])

  const [, onFinish] = useAsyncFn(async (values: any) => {
    submitButtonRef.current?.onSpin(true)
    const internalFields: any = {}
    const userFields: any[] = []
    let phoneToken: string | undefined = undefined
    let emailToken: string | undefined = undefined

    Object.entries(values).forEach(([key, value]) => {
      const [type, nameOrId] = key.split(' ')
      if (type === 'internal') {
        if (nameOrId.split(':').length > 1) {
          // 是验证码
          const [codeType, k] = nameOrId.split(':')
          if (codeType === k) {
            if (value !== '' || value) {
              internalFields[codeType] = value
            }
          } else {
            if (codeType === 'phone') {
              if (value !== '' || value) {
                phoneToken = value as string
              }
            } else if (codeType === 'email') {
              if (value !== '' || value) {
                emailToken = value as string
              }
            }
          }
        } else {
          internalFields[nameOrId] = value
        }
      } else if (type === 'user') {
        userFields.push({ nameOrId, value })
      }
    })

    const udfs = userFields
      .filter(({ nameOrId, value }) => Boolean(value))
      .map(({ nameOrId, value }) => ({
        definition: nameOrId,
        value,
      }))

    try {
      const user = await authClient.updateProfile(internalFields, {
        phoneToken,
        emailToken,
      })
      await post(
        `/api/v2/udfs/values`,
        {
          udfs,
        },
        {
          headers: {
            authorization: user?.token,
          },
        }
      )
      submitButtonRef.current?.onSpin(false)
      message.success(t('common.saveSuccess'))
      onRegisterInfoCompleted?.(user, udfs, authClient)
    } catch (e: any) {
      if (e?.message) {
        message.error(e.message)
      }
      // TODO
      submitButtonRef.current?.onSpin(false)
      onRegisterInfoCompletedError?.(e as any, udfs, authClient)
    }
  }, [])

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={onFinish}
      onFinishFailed={() => submitButtonRef.current.onError()}
      onValuesChange={(values) => {
        console.log('值改变')
        refPhone?.current?.check(values)
        refEmail?.current?.check(values)
        refUserName?.current?.check(values)
      }}
      className="authing-g2-completeInfo-form authing-g2-form-required-item-icon-after"
    >
      {formFieldsV2}

      <Form.Item className="authing-g2-input-form">
        <SubmitButton
          text={t('common.problem.form.submit')}
          ref={submitButtonRef}
          className="password g2-completeInfo-submit"
        />
      </Form.Item>
    </Form>
  )
}
