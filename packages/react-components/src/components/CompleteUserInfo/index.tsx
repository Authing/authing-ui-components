import { Button, Form, Input } from 'antd'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import { i18n } from 'src/locales'
import { useGuardHttp } from 'src/utils/guradHttp'
import { useAuthClient } from '../Guard/authClient'
import { CompleteUserInfoProps } from './props'

export const GuardCompleteUserInfo: React.FC<CompleteUserInfoProps> = ({
  appId,
  config = {},
}) => {
  useAuthClient()
  useGuardHttp()

  const { t } = useTranslation()

  const { extendsFields = [] } = config

  const [fields, setFields] = useState([])

  const [loadState, loadFields] = useAsyncFn(async () => {}, [], {
    loading: true,
  })

  const renderFields = extendsFields.map((field) => {
    const key = `${field.type} ${
      field.type === 'internal' ? field.name : field.id
    }`

    const label = i18n.language === 'zh-CN' ? field.label : field.name

    return (
      <Form.Item key={key} name={key} label={label} style={{ marginBottom: 8 }}>
        <Input type={field.inputType} size="large" />
      </Form.Item>
    )
  })

  return (
    <Form layout="vertical">
      {renderFields}
      <Button size="large" type="primary" block htmlType="submit">
        {t('common.problem.form.submit')}
      </Button>
    </Form>
  )
}
