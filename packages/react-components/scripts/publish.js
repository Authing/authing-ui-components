var { version } = require('../package.json')
const shell = require('shelljs')

const getVersionTag = (version) => {
  if (version.includes('-beta')) {
    return 'beta'
  } else if (version.includes('-rc')) {
    return 'rc'
  } else if (version.includes('-alpha')) {
    return 'alpha'
  } else {
    return ''
  }
}
var tag = getVersionTag(version)

if (tag !== '') {
  shell.exec(`npm publish --tag ${tag} --guard-publish`)
} else {
  shell.exec(`npm publish --guard-publish`)
}
