import { Popover } from 'antd'
import React, { useMemo, useCallback } from 'react'
import { IconFont } from '../../IconFont'
import './style.less'

interface SelectPanelProps {
  lists: SelectOptions[]
  /**
   * 点击删除
   */
  handleDel: (id: string) => void
  /**
   * 点击 li
   */
  onClick: (id: string) => void
}

export interface SelectOptions {
  /**
   * 头像
   */
  photo?: string
  /**
   * 标题
   */
  title?: string
  /**
   * 描述
   */
  description?: string
  /**
   * 用户 ID 唯一标识符
   */
  id: string | 'other'
  /**
   * 显示操作栏 default: true
   */
  operation?: boolean
}

const SelectPanel: React.FC<SelectPanelProps> = (props) => {
  const { lists, handleDel, onClick } = props

  const finallyLists = useMemo(() => {
    return [
      ...lists,
      {
        operation: false,
        id: 'other',
        title: '使用其他账号',
        photo: '', // 这里应该是 CDN 的图片
      },
    ]
  }, [lists])

  const onDel = useCallback(
    (e: React.MouseEvent, id: string) => {
      handleDel(id)
      e.stopPropagation()
    },
    [handleDel]
  )

  const renderLits = useMemo(() => {
    return finallyLists.map((option) => {
      const { photo, title, description, id, operation = true } = option
      return (
        <li className="g2-multiple__li" key={id} onClick={() => onClick(id)}>
          <img className="g2-multiple__avatar" alt="" src={photo} />
          <section className="g2-multiple__body">
            {title && <span className="g2-multiple__title">{title}</span>}
            <span className="g2-multiple__desc">{description}</span>
          </section>
          {operation && (
            <span
              className="g2-multiple__op"
              onClick={(e) => e.stopPropagation()}
            >
              <Popover
                content={
                  <div
                    className="g2-multiple__del"
                    onClick={(e: React.MouseEvent) => onDel(e, id)}
                  >
                    <IconFont
                      style={{ fontSize: 20, marginRight: 8 }}
                      type="authing-add-circle-line"
                    />
                    移除
                  </div>
                }
                overlayClassName="g2-multiple__op-wrapper"
              >
                ...
              </Popover>
            </span>
          )}
        </li>
      )
    })
  }, [finallyLists, onClick, onDel])

  return <ul className="g2-multiple">{renderLits}</ul>
}

export { SelectPanel }
