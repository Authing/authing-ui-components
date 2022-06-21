import React, { FC } from 'react'
import { Select, Tooltip } from 'antd'
import { isoInfo, IsoType } from '../../../_utils/countryList'
import './styles.less'
import { IconFont } from '../../../IconFont'
import { i18n } from '../../../_utils/locales'

export interface VirtualDropdownProps {
  value?: string
  onChange?: (value: string) => void
  style?: React.CSSProperties
}
export const VirtualDropdown: FC<VirtualDropdownProps> = (props) => {
  const { value, onChange } = props
  // const [open, setOpen] = useState(false)
  // TODO 先取 iso type 作为 select 获取的 value 后续映射表弄好改为 区号码
  const options = isoInfo.map((info: IsoType) => {
    return {
      value: info.iso,
      key: info.iso,
      children: info.phoneCountryCode,
      label: (
        <div className="select-option-item">
          <span>{info.phoneCountryCode}</span>
          <div className="country">
            <Tooltip
              title={i18n.language === 'zh-CN' ? info.regions : info.regions_en}
            >
              {i18n.language === 'zh-CN' ? info.regions : info.regions_en}
            </Tooltip>
          </div>
        </div>
      ),
      region: info.regions,
      region_en: info.regions_en,
    }
  })

  return (
    <Select
      showSearch
      dropdownClassName="areacode-virtual-dropdown"
      bordered={false}
      listHeight={258}
      options={options}
      value={value}
      onChange={onChange}
      optionLabelProp="children"
      dropdownMatchSelectWidth={138}
      filterOption={(input, option: any) => {
        if (option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0) {
          return true
        }
        if (option.region.toLowerCase().indexOf(input.toLowerCase()) >= 0) {
          return true
        }
        if (option.region_en.toLowerCase().indexOf(input.toLowerCase()) >= 0) {
          return true
        }
        return false
        // return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }}
      suffixIcon={
        <IconFont
          className={'areacode-virtual-dropdown-icon'}
          type={'authing-arrow-down-s-fill'}
          style={{ width: 20, height: 20 }}
        />
      }
    />
  )
}
