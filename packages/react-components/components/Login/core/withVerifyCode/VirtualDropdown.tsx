import React, { FC } from 'react'
import { Select } from 'antd'
import { isoInfo, Iso } from '../../../_utils/countryList'
export interface VirtualDropdownProps {
  value?: string
  onChange?: (value: string) => void
  style?: React.CSSProperties
}
export const VirtualDropdown: FC<VirtualDropdownProps> = (props) => {
  const { value, onChange } = props
  const options = isoInfo.map((info: Iso) => {
    return {
      value: info.iso,
      key: info.areaCode,
      label: (
        <div className="select-option-item">
          <span>{info.areaCode}</span>
          <span>{info.regions}</span>
        </div>
      ),
    }
  })

  return (
    <Select
      bordered={false}
      listHeight={258}
      options={options}
      value={value}
      onChange={onChange}
      optionLabelProp="key"
      dropdownMatchSelectWidth={138}
      getPopupContainer={(node: any) => {
        if (node) {
          return node?.parentElement
        }
        return document.body
      }}
    />
  )
}
