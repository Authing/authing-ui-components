const fs = require('fs-extra')
const path = require('path')

const { version } = require('../package.json')

fs.writeFileSync(
  path.join(__dirname, '..', 'components', 'version', 'version.tsx'),
  `
  const version = '${version}'
  export default version
  `,
  'utf8'
)
