import React, { useEffect, useRef, useState } from 'react'
import { Form, Input, message, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { ExtendsField } from '../../AuthingGuard/api'
import { UploadImage } from '../../AuthingGuard/Forms/UploadImage'
import { useAuthClient } from '../../Guard/authClient'
import { i18n } from '../../_utils/locales'
import { useGuardHttp } from '../../_utils/guradHttp'
import { GuardCompleteInfoViewProps } from '../props'
import SubmitButton from '../../SubmitButton'

export interface CompleteInfoProps {
  extendsFields: ExtendsField[]
  onRegisterInfoCompleted?: GuardCompleteInfoViewProps['onRegisterInfoCompleted']
  onRegisterInfoCompletedError?: GuardCompleteInfoViewProps['onRegisterInfoCompletedError']
}

export const CompleteInfo: React.FC<CompleteInfoProps> = ({
  extendsFields,
  onRegisterInfoCompleted,
  onRegisterInfoCompletedError,
}) => {
  const authClient = useAuthClient()
  const submitButtonRef = useRef<any>(null)
  const { get, post } = useGuardHttp()
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const [definitions, setDefinitions] = useState<any[]>([])

  const [, loadInitData] = useAsyncFn(async () => {
    const user = await authClient.getCurrentUser()

    const { data } = await get<any>('/api/v2/udfs/definitions', undefined, {
      headers: {
        authorization: user?.token!,
      },
    })

    setDefinitions(data)
  }, [authClient, get])

  useEffect(() => {
    loadInitData()
  }, [loadInitData])

  const INPUT_MAP: Record<string, React.ReactNode | undefined> = {
    image: <UploadImage />,
  }
  const INTERNAL_INPUT_MAP: Record<string, React.ReactNode | undefined> = {
    gender: (
      <Select
        className="authing-g2-select"
        options={[
          { label: i18n.t('common.man'), value: 'M' },
          { label: i18n.t('common.female'), value: 'F' },
        ]}
      />
    ),
  }

  const formFields = extendsFields.map((def) => {
    const key = `${def.type} ${def.type === 'internal' ? def.name : def.id}`

    const label = i18n.language === 'zh-CN' ? def.label : def.name

    return (
      <Form.Item
        key={key}
        name={key}
        label={label}
        // style={{ marginBottom: 24 }}
        className="authing-g2-input-form"
        rules={[
          {
            required: true,
            message: `${label} ${t('login.noEmpty')}`,
          },
        ]}
      >
        {INTERNAL_INPUT_MAP[def.name] || INPUT_MAP[def.inputType] || (
          <Input
            type={def.inputType}
            size="large"
            className="authing-g2-input"
            autoComplete="tel"
          />
        )}
      </Form.Item>
    )
  })

  const [, onFinish] = useAsyncFn(async (values: any) => {
    submitButtonRef.current?.onSpin(true)

    const internalFields: any = {}
    const userFields: any[] = []
    Object.entries(values).forEach(([key, value]) => {
      const [type, nameOrId] = key.split(' ')
      if (type === 'internal') {
        internalFields[nameOrId] = value
      } else if (type === 'user') {
        userFields.push({ nameOrId, value })
      }
    })

    const udfs = userFields.map(({ nameOrId, value }) => ({
      definition: definitions.find((def) => def.id === nameOrId),
      value,
    }))

    try {
      const user = await authClient.updateProfile(internalFields)

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
    } catch (e) {
      // TODO
      submitButtonRef.current?.onSpin(false)
      onRegisterInfoCompletedError?.(e, udfs, authClient)
    }
  }, [])

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={onFinish}
      onFinishFailed={() => submitButtonRef.current.onError()}
    >
      {formFields}

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
