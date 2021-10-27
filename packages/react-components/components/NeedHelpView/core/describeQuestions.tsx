import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, message, Select, Upload } from 'antd'
import SubmitButton from '../../SubmitButton'
import { UserOutlined, PlusOutlined } from '@ant-design/icons'
import { UploadFile } from 'antd/lib/upload/interface'
import { useGuardHttp } from '../../_utils/guradHttp'

function getBase64(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

interface describeQuestionsProps {
  appId: string
  host: string
  onSuccess: any
}

export const DescribeQuestions = (props: describeQuestionsProps) => {
  const { t } = useTranslation()

  // 不清楚为什么放出去之后，i18n 的结果全是 undefeated
  const typeProblemMap: any = {
    0: [
      t('common.problem.noVerifyTip.tip'),
      t('common.problem.noVerifyTip.type1'),
      t('common.problem.noVerifyTip.type2'),
      t('common.problem.noVerifyTip.type3'),
    ],
    1: [
      t('common.problem.noLoginTip.tip'),
      t('common.problem.noLoginTip.type1'),
      t('common.problem.noLoginTip.type2'),
    ],
    2: [
      t('common.problem.noRegisterTip.tip'),
      t('common.problem.noRegisterTip.type1'),
      t('common.problem.noRegisterTip.type2'),
      t('common.problem.noRegisterTip.type3'),
    ],
    3: [
      t('common.problem.noAccountTip.tip'),
      t('common.problem.noAccountTip.type1'),
      t('common.problem.noAccountTip.type2'),
    ],
    4: [
      t('common.problem.noResetPassTip.tip'),
      t('common.problem.noResetPassTip.type1'),
      t('common.problem.noResetPassTip.type2'),
    ],
    5: [t('common.problem.otherTip.tip'), t('common.problem.otherTip.type1')],
    6: [t('common.problem.otherTip.tip'), t('common.problem.otherTip.type1')],
  }

  const typeOperations = [
    {
      label: t('common.problem.noVerify'),
      value: 0,
    },
    {
      label: t('common.problem.noLogin'),
      value: 1,
    },
    {
      label: t('common.problem.noRegister'),
      value: 2,
    },
    {
      label: t('common.problem.noAccount'),
      value: 3,
    },
    {
      label: t('common.problem.noResetPass'),
      value: 4,
    },
    {
      label: t('common.problem.locked'),
      value: 5,
    },
    {
      label: t('common.problem.other'),
      value: 6,
    },
  ]

  const [form] = Form.useForm()
  const { post } = useGuardHttp()
  const [uploadUrl, setUploadUrl] = useState([])
  const submitButtonRef = useRef<any>(null)
  const [fileList, setFileList] = useState<UploadFile<any>[]>([])
  const [typeProblem, setTypeProblem] = useState(0)
  const textMap = typeProblemMap[typeProblem]

  const onFinish = (values: any) => {
    const params = {
      type: typeProblem,
      description: values.description,
      phone: values.identify,
      images: uploadUrl,
      appId: props.appId,
    }
    let context = post('/api/v2/feedback', params)
    context.then((res) => {
      if (res.code === 200) {
        props.onSuccess()
      }
    })
  }

  // const handlePreview = async (file: any) => {
  //   // setPreviewImage(file.url);
  //   // file 没有 url 属性，需要改成下面的用法
  //   let url = file.response.data.url
  //   setPreviewImage(url)
  //   setPreviewVisible(true)
  // }

  return (
    <div className="authing-g2-describe-questions">
      <Form
        name="resetPassword"
        layout="vertical"
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => {
          submitButtonRef?.current?.onError()
        }}
        autoComplete="off"
      >
        <Form.Item
          className="authing-g2-input-form"
          name="identify"
          label="联系方式"
          rules={[{ required: true, message: '请输入联系方式' }]}
        >
          <Input
            className="authing-g2-input"
            autoComplete="tel"
            size="large"
            placeholder={t('login.inputPhoneOrEmail')}
            prefix={<UserOutlined style={{ color: '#878A95' }} />}
          />
        </Form.Item>
        <Form.Item
          className="authing-g2-input-form"
          label="相关问题"
          name="questionPicker"
          initialValue={typeProblem}
        >
          <Select
            className="authing-g2-select"
            onChange={(value: number) => {
              setTypeProblem(value)
            }}
          >
            {typeOperations?.map(({ value, label }) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <div className="authing-g2-input-form">
          {textMap?.map((item: any, index: any) => (
            <div key={index}>{item}</div>
          ))}
        </div>

        <Form.Item
          className="authing-g2-input-form"
          name="description"
          label="问题描述"
        >
          <Input.TextArea className="authing-g2-input" />
        </Form.Item>

        <div className="authing-g2-input-form">
          <div className="label-title">问题截图</div>
          <div className="g2-questions">
            <Upload
              action={`${props.host}/api/v2/upload?folder=photos`}
              listType="picture-card"
              accept="image/png, image/jpeg, image/jpg"
              className="authing-g2-questions-upload-self"
              fileList={fileList}
              onPreview={() => {}}
              onChange={(e) => {
                setFileList(e.fileList)
                const imgUrl: any = e.fileList.map((item: any) => {
                  const response = item.response
                  return response?.data.url
                })
                setUploadUrl(imgUrl)
              }}
            >
              {fileList.length >= 5 ? null : <PlusOutlined />}
            </Upload>
          </div>
        </div>

        <Form.Item className="authing-g2-input-form submit-form">
          <SubmitButton
            className="forget-password"
            text="提交"
            ref={submitButtonRef}
          />
        </Form.Item>
      </Form>
    </div>
  )
}
