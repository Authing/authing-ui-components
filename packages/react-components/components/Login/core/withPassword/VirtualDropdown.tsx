import React from 'react'
import { Select } from 'antd'
import {
  COUNTRY_LIST_ZH,
  Phone_List,
  COUNTRY_LIST_EN,
} from '../../../_utils/countryList'
export const VirtualDropdown = () => {
  // key
  const countryList = Object.keys(COUNTRY_LIST_ZH)

  const options = countryList.map((item: any) => {
    return {
      value: Phone_List[item],
      label: item,
    }
  })
  const cc = {
    value: '+86',
    regions: '中国',
    regions_en: 'China',
    iso: 'CN',
  }
  const data = countryList.map((country) => {
    return {
      iso: country,
      regions: COUNTRY_LIST_ZH[country],
      regions_en: COUNTRY_LIST_EN[country],
      areaCode: Phone_List[country],
    }
  })
  console.log(data)
  return (
    <div>
      <Select
        bordered={false}
        // open={true}
        listHeight={200}
        options={options}
        value={options[0].value}
        getPopupContainer={(node: any) => {
          if (node) {
            return node?.parentElement
          }
          return document.body
        }}
      />
    </div>
  )
}
