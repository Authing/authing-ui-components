var $ = require('shelljs')
var Package = require('../package.json')

var version = Package.version
var name = Package.name

const getVersionTag = (version) => {
  const tagArr = ['alpha', 'beta', 'rc']

  const tagIndexArr = tagArr
    .map((type) => version.search(type))
    .filter((index) => index !== -1)

  if (tagIndexArr.length === 0) return ''

  const tagName = version.slice(tagIndexArr[0], version.length)

  return tagName
}

version.search('alpha')

var build = $.exec('yarn build:lib')

if (build.code !== 0) {
  $.echo('build 失败了～')
  $.exit(1)
}

$.exec(`git tab ${version}`)

var tag = getVersionTag(version)

let publish

if (tag !== '') {
  publish = $.exec(`npm publish --tag ${tag}`)
} else {
  publish = $.exec('npm publish')
}

if (publish.code !== 0) {
  $.echo(`publish 失败了～`)
  $.exit(1)
}

if ($.which('cnpm')) {
  $.echo(`正在同步到 淘宝源......`)

  $.exec(`cnpm sync name`)
} else if ($.which('open')) {
  $.exec(`open https://npmmirror.com/sync/${name}`)
} else {
  $.echo(`记得手动同步到淘宝源～`)

  $.echo(`https://npmmirror.com/sync/${name}`)
}

$.exit(0)
