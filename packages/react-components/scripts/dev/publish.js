// const { run } = require('./pre-build')
const execa = require('execa')

const run = (bin, args, opts = {}) => execa(bin, args, { shell: true, ...opts })

const publicScript = async (...args) =>
  await run('npm', ['publish', ...args, '--guard-publish'].filter(Boolean))

const publish = async (tag) => {
  // TODO: 正则处理 截取到 比如
  // if (distTag) {
  //   tag = distTag
  // }
  // let tag = ''
  // if (version.includes('-beta')) {
  //   tag = 'beta'
  // } else if (version.includes('-rc')) {
  //   tag = 'rc'
  // } else if (version.includes('-alpha')) {
  //   tag = 'alpha'
  // }
  if (tag !== '') {
    await publicScript(`--tag ${tag}`)
  } else {
    await publicScript()
  }
}

module.exports = {
  publish,
}
