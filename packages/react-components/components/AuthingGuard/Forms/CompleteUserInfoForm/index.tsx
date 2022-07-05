import { Button, Form, Input, message, Spin } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { FC, useEffect, useState } from 'react'
import { useGuardContext } from '../../../context/global/context'
import { User } from 'authing-js-sdk'
import { UploadImage } from '../UploadImage'
import { requestClient } from '../../../_utils/http'
import { CompleteUserInfoFormProps } from '../../types'
import { useTranslation } from 'react-i18next'
import { i18n } from '../../../_utils/locales'

export const CompleteUserInfoForm: FC<CompleteUserInfoFormProps> = ({
  onSuccess,
}) => {
  const { t } = useTranslation()
  const [rawForm] = useForm()
  const [submitting, setSubmitting] = useState(false)

  const [loading, setLoading] = useState(false)

  const {
    state: { config, authClient, guardEvents, userPoolId },
  } = useGuardContext()

  const { extendsFields } = config

  const [, setUser] = useState<User | null>()
  const [definitions, setDefinitions] = useState<any[]>([])

  const onFinish = async (values: any) => {
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

      setUser(user)

      await requestClient.post(
        `/api/v2/udfs/values`,
        {
          udfs,
        },
        {
          headers: {
            authorization: user?.token,
            'x-authing-userpool-id': userPoolId,
          },
        }
      )

      message.success(t('common.saveSuccess'))
      guardEvents.onRegisterInfoCompleted?.(user, udfs, authClient)
      onSuccess?.(user)
    } catch (e: any) {
      guardEvents.onRegisterInfoCompletedError?.(e, udfs, authClient)
      setSubmitting(false)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    ;(async () => {
      const user = await authClient.getCurrentUser()
      setUser(user)
      const { data } = await requestClient.get<any>(
        '/api/v2/udfs/definitions',
        undefined,
        {
          headers: {
            authorization: user?.token!,
            'x-authing-userpool-id': userPoolId,
          },
        }
      )
      setDefinitions(data)
      setLoading(false)
    })()
  }, [authClient, userPoolId])

  const onFinishFailed = () => {}

  const INPUT_MAP: Record<string, React.ReactNode | undefined> = {
    image: <UploadImage />,
  }

  const formFields = extendsFields.map((def) => {
    const key = `${def.type} ${def.type === 'internal' ? def.name : def.id}`

    const label = i18n.language === 'zh-CN' ? def.label : def.name

    return (
      <Form.Item key={key} name={key} label={label} style={{ marginBottom: 8 }}>
        {INPUT_MAP[def.inputType] || (
          <Input type={def.inputType} size="large" />
        )}
      </Form.Item>
    )
  })

  return (
    <Spin spinning={loading}>
      <Form
        layout="vertical"
        form={rawForm}
        onSubmitCapture={() => setSubmitting(true)}
        onFinishFailed={onFinishFailed}
        onFinish={onFinish}
      >
        {formFields}

        <Button
          size="large"
          loading={submitting}
          type="primary"
          block
          htmlType="submit"
        >
          {t('common.problem.form.submit')}
        </Button>
      </Form>
    </Spin>
  )
}
