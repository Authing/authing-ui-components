const { publish } = require('./publish')
const execa = require('execa')
const { prompt } = require('enquirer')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const semver = require('semver')
const signale = require('signale')
const argv = require('minimist')(process.argv.slice(2))
const ora = require('ora')
const { feLog } = require('./tag')
const { generateVersion } = require('./generate-version')

// TODO: 增加 publish 流程
// TODO: 代码整理
// TODO: 分支规则将检查
// TODO: 正式包发布
// version -> build -> commit -> publish -> sync

const matchReg = /^(.*-)(.+)(\.(\d+))$/

const exit = () => process.exit(1)

const pckPath = path.resolve(process.cwd(), 'package.json')

const run = (bin, args, opts = {}) => execa(bin, args, { shell: true, ...opts })

const step = (msg, color = 'grey') => console.log(chalk[color](msg))

/**
 * 读取分支
 * @returns parseName 格式化后 dist-tag 的名称，originName 原始名称
 */
const readBranchName = async () => {
  const { stdout: originName } = await run('git', [
    'symbolic-ref --short -q HEAD',
  ])
  const branchName = originName.replace(/^feat\//, '')
  step(`当前所在分支: ${originName}`)
  return {
    parseName: branchName.replace(/-/g, '.'),
    originName,
  }
}

/**
 * 拉取远程版本
 * @param {*} tagName dist-tag @beta
 * @param {*} packageName 包名称 vue
 * @returns
 */
const fetchOriginTag = async (tagName, packageName) => {
  const findPackage = `${packageName}${tagName}`
  const { stdout: originPackage } = await run('npm', [
    'view',
    findPackage,
    'version',
    '--registry',
    'http://localhost:4873',
  ])
  return originPackage
}

/**
 * 创建一个全新的 Tag
 * @param {*} branchName
 * @returns
 */
const createNewTag = async (branchName, packageName) => {
  const latestVersion = await fetchOriginTag('', packageName)
  if (latestVersion) {
    return {
      latest: latestVersion,
      newVersion: semver.inc(latestVersion, 'prerelease', branchName),
    }
  }
}

/**
 * 问询
 */
const askCreateNewTag = async ({
  parseName,
  originName,
  packageName,
  packageInfo,
}) => {
  const { create } = await prompt({
    type: 'confirm',
    name: 'create',
    message: `是否新建 ${originName} 关联版本？(${packageName}@${parseName})`,
  })
  if (!create) {
    // TODO: 不需要新建直接终止吧
    process.exit(1)
  } else {
    const newVersion = await processAutoCreate({
      parseName,
      packageName,
      packageInfo,
    })
    return newVersion
  }
}

/**
 * 自动创建
 */
const processAutoCreate = async ({ parseName, packageName, packageInfo }) => {
  const { newVersion } = await createNewTag(parseName, packageName)
  await writeVersion(newVersion, packageInfo)
  return newVersion
}

/**
 * 读取 PCK 信息
 */
const readPckInfo = async () => {
  const pckContent = await fs.readFileSync(pckPath, {
    encoding: 'utf-8',
  })
  const content = JSON.parse(pckContent)
  return content
}

/**
 * 修改版本
 * @param {*} version
 */
const writeVersion = async (version, json) => {
  json.version = version
  await fs.writeFileSync(pckPath, JSON.stringify(json, null, 2) + '\n')
}

const genVersion = async ({ parseName, originName }) => {
  try {
    // pre 读取当前
    const packageInfo = await readPckInfo()
    const packageName = packageInfo.name
    // 1. 读取分支名 branchName
    const findPackage = `${packageName}@${parseName}`
    // 2. 检查远程是否存在该 Tag
    const originTag = await fetchOriginTag(`@${parseName}`, packageName)
    if (!originTag) {
      signale.warn(`未找到当前分支的关联版本信息: ${findPackage}...`)
      if (argv.ac) {
        // 自动创建
        step(`即将自动新建 ${findPackage} 版本...`)
        const newVersion = await processAutoCreate({
          parseName,
          packageName,
          packageInfo,
        })
        signale.success(`Done 新建: ${newVersion}`)
        return
      } else {
        // 问询创建对应的版本
        const version = await askCreateNewTag({
          parseName,
          originName,
          packageName,
          packageInfo,
        })
        if (!version) {
          signale.fatal(`手动取消流程`)
          return
        }
        signale.success(`Done 更新: ${version}...`)
        return version
      }
    } else {
      // 根据远程最新版本进行更新
      const updateVersion = semver.inc(originTag, 'prerelease')
      await writeVersion(updateVersion, packageInfo)
      signale.success(`${packageName}更新版本成功: ${updateVersion}`)
      return updateVersion
    }
  } catch (e) {
    step(e.message, 'red')
  }
}

const runBuild = async () => {
  const buildInstance = ora('build package...')
  // Log Tag
  feLog()
  // 写版本
  generateVersion()
  try {
    buildInstance.start()
    // build TODO: 这里需要后续处理 cwd 验证，必须在 react 项目中
    await run('npm', ['run', 'build:lib'], {
      cwd: process.cwd(),
    })
    buildInstance.succeed()
    return true
  } catch (e) {
    buildInstance.fail(e.message)
    signale.fatal(new Error(e))
    exit()
    return false
  }
}

const _gitFlow = async (...command) =>
  await run('git', command, {
    cwd: process.cwd(),
  })

const runGitFlow = async (version, originName) => {
  const getInstance = ora('run git flow...')
  try {
    getInstance.start()
    // build 完后 需要提交了
    await _gitFlow('add', '.')
    await _gitFlow('commit', '-m', `"build: publish Guard: ${version}"`)
    await _gitFlow(`push`, `origin`, `${originName}`)
    // step('暂时不提交 本地 tag 打完') // TODO: 补充 push
    getInstance.succeed()
    return true
  } catch (e) {
    getInstance.fail(e.message)
    exit()
  }
}

const runPublishNpm = async (version) => {
  const [, , distTag] = version.match(matchReg)
  let publishInstance = ora(`start publish flow: ${distTag} ...`)
  publishInstance.start()
  try {
    await publish(distTag)
    publishInstance.succeed()
  } catch (e) {
    console.log(e, 'publish')
    publishInstance.fail()
  }
}

const main = async () => {
  const { parseName, originName } = await readBranchName()
  // version
  const version = await genVersion({
    parseName,
    originName,
  })
  if (version) {
    // build
    await runBuild()
    // git flow
    await runGitFlow(parseName, originName)
    // publish 流程
    await runPublishNpm(version)
  }
}

main()

exports.run = run
exports.step = step
