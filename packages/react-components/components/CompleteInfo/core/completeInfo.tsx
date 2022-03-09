import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Form, Input, message, Select, DatePicker } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { UploadImage } from '../../AuthingGuard/Forms/UploadImage'
import { useGuardAuthClient } from '../../Guard/authClient'
import { i18n } from '../../_utils/locales'
import {
  CompleteInfoBaseControls,
  CompleteInfoExtendsControls,
  CompleteInfoMetaData,
} from '../interface'
import { useGuardHttp } from '../../_utils/guardHttp'
import { GuardCompleteInfoViewProps } from '../interface'
import SubmitButton from '../../SubmitButton'
import { InputNumber } from '../../InputNumber'
import { EmailScene, SceneType } from 'authing-js-sdk'
import CustomFormItem, { ICheckProps } from '../../ValidatorRules'
import { fieldRequiredRule } from '../../_utils'
import { SendCodeByEmail } from '../../SendCode/SendCodeByEmail'
import { SendCodeByPhone } from '../../SendCode/SendCodeByPhone'
import { useGuardPublicConfig } from '../../_utils/context'
export interface CompleteInfoProps {
  metaData: CompleteInfoMetaData[]
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
    metaData,
    onRegisterInfoCompleted,
    onRegisterInfoCompletedError,
  } = props

  const config = useGuardPublicConfig()

  const verifyCodeLength = config?.verifyCodeLength

  const authClient = useGuardAuthClient()

  const submitButtonRef = useRef<any>(null)

  const [countryList, setCountryList] = useState<any>([])

  const { get, post } = useGuardHttp()

  const { t } = useTranslation()

  const [form] = Form.useForm()

  const refPhone = useRef<ICheckProps>(null)

  const refEmail = useRef<ICheckProps>(null)

  const refUserName = useRef<ICheckProps>(null)

  const loadInitCountryList = useCallback(async () => {
    const { data } = await get(`/api/v2/country-list`)

    const countryMap = i18n.language === 'zh-CN' ? data?.zh : data?.en

    const countryList: { label: string; value: string }[] = []

    countryMap.forEach((value: any, key: any) =>
      countryList.push({ label: value, value: key })
    )

    setCountryList(countryList)
  }, [get])

  useEffect(() => {
    if (!metaData.map((i) => i.name).includes('country')) return

    loadInitCountryList()
  }, [loadInitCountryList, metaData])

  const baseControlMap: Record<
    string,
    (props?: any) => React.ReactNode | undefined
  > = useMemo(
    () => ({
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
      select: (props: any) => (
        <Select
          className="authing-g2-select"
          showSearch
          options={props.options}
          filterOption={filterOption}
        />
      ),
      dropdown: (props: any) => (
        <Select
          className="authing-g2-select"
          showSearch
          options={props.options}
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
        <Input
          type="text"
          size="large"
          className="authing-g2-input"
          autoComplete="off"
        />
      ),
      text: () => (
        <Input
          type="text"
          size="large"
          className="authing-g2-input"
          autoComplete="off"
        />
      ),
      gender: () => (
        <Select
          className="authing-g2-select"
          options={[
            { label: i18n.t('common.man'), value: 'M' },
            { label: i18n.t('common.female'), value: 'F' },
          ]}
        />
      ),
      country: () => (
        <Select
          className="authing-g2-select"
          options={countryList}
          showSearch
          filterOption={filterOption}
        />
      ),
    }),

    [countryList]
  )
  const internalControlMap: Record<
    string,
    (props: any) => React.ReactNode | undefined
  > = useMemo(
    () => ({
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
            <SendCodeByPhone
              className="authing-g2-input g2-send-code-input"
              autoComplete="one-time-code"
              key="internal-phone:phone345"
              size="large"
              placeholder={t('common.inputFourVerifyCode', {
                length: verifyCodeLength,
              })}
              scene={SceneType.SCENE_TYPE_COMPLETE_PHONE}
              maxLength={verifyCodeLength}
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
            <SendCodeByEmail
              className="authing-g2-input g2-send-code-input"
              autoComplete="one-time-code"
              size="large"
              placeholder={t('common.inputFourVerifyCode', {
                length: verifyCodeLength,
              })}
              maxLength={verifyCodeLength}
              data={''}
              scene={EmailScene.VerifyCode}
              fieldName="internal email:email"
              form={form}
              onSendCodeBefore={() =>
                form.validateFields(['internal email:email'])
              }
            />
          </Form.Item>
        </>
      ),
    }),
    [form, t, verifyCodeLength]
  )

  const generateRules = useCallback(
    (metaData: CompleteInfoMetaData) => {
      const formRules = []

      const label =
        i18n.language === 'zh-CN'
          ? metaData.label || metaData.name
          : metaData.name

      const rules = metaData.validateRules ?? []

      const required = metaData.required ?? false

      if (metaData.required) {
        formRules.push({
          required: true,
          message: `${label} ${t('login.noEmpty')}`,
        })
      }

      // TODO 后端的 rule Type 有很多 前端目前只做了两种的映射
      rules.forEach((rule) => {
        switch (rule.type) {
          case 'isNumber':
            formRules.push({
              type: 'number',
              required,
              message: rule.errorMessages || '请填写数字',
            })
            break
          case 'regExp':
            formRules.push({
              required,
              pattern: new RegExp(rule.content.replaceAll('/', '')),
              message: rule.errorMessages,
            })
            break
          default:
            break
        }
      })
      return formRules
    },
    [t]
  )

  const inputElement = useCallback(
    (metaData: CompleteInfoMetaData) => {
      const key = `${metaData.type} ${metaData.name}`
      const label =
        i18n.language === 'zh-CN'
          ? metaData.label || metaData.name
          : metaData.name

      // 这部分的控件分两种 一个集成控件（手机号 + 验证码）一种是基础控件 分开处理
      if (
        (Object.values(CompleteInfoBaseControls) as (
          | CompleteInfoBaseControls
          | CompleteInfoExtendsControls
        )[]).includes(metaData.type)
      ) {
        return internalControlMap[metaData.name]({
          required: metaData.required,
        })
      } else {
        const userFormItem = (children: React.ReactNode) => (
          <Form.Item
            validateTrigger={['onBlur', 'onChange']}
            className="authing-g2-input-form"
            rules={generateRules(metaData)}
            key={key}
            name={key}
            label={label}
            style={{ marginBottom: 8 }}
          >
            {children}
          </Form.Item>
        )
        if (Object.keys(baseControlMap).includes(metaData.type))
          return userFormItem(
            baseControlMap[metaData.type]({ options: metaData.options })
          )

        return userFormItem(
          <Input type="text" className="authing-g2-input" autoComplete="off" />
        )
      }
    },
    [baseControlMap, generateRules, internalControlMap]
  )

  const formFieldsV2 = useMemo(() => {
    return metaData.map((data) => inputElement(data))
  }, [inputElement, metaData])

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
