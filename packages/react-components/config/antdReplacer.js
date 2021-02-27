/**
 * 全面提高 antd 样式优先级
 * https://juejin.cn/post/6844904116288749581#heading-8
 * https://github.com/fi3ework/postcss-rename-selector/blob/master/src/presets/antd.ts
 *  */

const parser = require('postcss-selector-parser')

function antdScopeReplacerFn(node) {
  if (node.type !== 'selector') return

  const firstAntClassNodeIndex = node.nodes.findIndex((n) => {
    return n.type === 'class' && n.value.startsWith('authing-')
  })
  if (firstAntClassNodeIndex < 0) return

  const firstAntClassNode = node.nodes[firstAntClassNodeIndex]
  const prevNode = node.nodes[firstAntClassNodeIndex - 1]

  // preserve line break
  const spaces = {
    before: firstAntClassNode.rawSpaceBefore,
    after: firstAntClassNode.rawSpaceAfter,
  }

  firstAntClassNode.setPropertyWithoutEscape('rawSpaceBefore', '')
  const toInsert = []

  if (firstAntClassNodeIndex === 0 || prevNode.type === 'combinator') {
    const universal = parser.universal({
      value: '*',
    })
    toInsert.push(universal)
  }

  const attr = parser.attribute({
    attribute: 'class',
    operator: '*=',
    value: `"authing-"`,
    raws: {},
  })

  toInsert.push(attr)
  toInsert[0].spaces = spaces

  firstAntClassNode.parent.nodes.splice(firstAntClassNodeIndex, 0, ...toInsert)
}

module.exports = {
  antdScopeReplacerFn,
}
