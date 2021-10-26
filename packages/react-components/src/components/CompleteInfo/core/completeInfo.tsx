import { Button, Form, Input, message, Select } from 'antd'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { ExtendsField } from 'src/components/AuthingGuard/api'
import { UploadImage } from 'src/components/AuthingGuard/Forms/UploadImage'
import { useAuthClient } from 'src/components/Guard/authClient'
import { i18n } from 'src/locales'
import { useGuardHttp } from 'src/utils/guradHttp'
import { GuardCompleteInfoViewProps } from '../props'

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
  const { get, post } = useGuardHttp()
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const [definitions, setDefinitions] = useState<any[]>([])

  const [load, loadInitData] = useAsyncFn(async () => {
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

  const [finish, onFinish] = useAsyncFn(async (values: any) => {
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

      message.success(t('common.saveSuccess'))
      onRegisterInfoCompleted?.(user, udfs, authClient)
    } catch (e) {
      // TODO
      onRegisterInfoCompletedError?.(e, udfs, authClient)
    }
  }, [])

  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      {formFields}

      <Button
        size="large"
        loading={finish.loading}
        type="primary"
        block
        htmlType="submit"
      >
        {t('common.problem.form.submit')}
      </Button>
    </Form>
  )
}
