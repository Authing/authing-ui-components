import React, { FC, useState } from 'react'
import { Select } from 'antd'
import { isoInfo, Iso } from '../../../_utils/countryList'
import './styles.less'
export interface VirtualDropdownProps {
  value?: string
  onChange?: (value: string) => void
  style?: React.CSSProperties
}
export const VirtualDropdown: FC<VirtualDropdownProps> = (props) => {
  const { value, onChange } = props
  const [open, setOpen] = useState(false)
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
      open={open}
      onClick={() => {
        setOpen(!open)
      }}
      onBlur={() => {
        setOpen(false)
      }}
      dropdownClassName="areacode-virtual-dropdown"
      bordered={false}
      listHeight={258}
      options={options}
      value={value}
      onChange={onChange}
      optionLabelProp="key"
      dropdownMatchSelectWidth={138}
    />
  )
}
