import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

export function isDevFn(mode: string): boolean {
  return mode === 'development'
}

export function isProdFn(mode: string): boolean {
  return mode === 'production'
}

/**
 * Whether to generate package preview
 */
export function isReportMode(): boolean {
  return process.env.REPORT === 'true'
}

// Read all environment variable configuration files to process.env
/**
 * 这段代码用于将配置文件中的环境变量转换为项目中使用的变量格式。具体来说，它接受一个对象 envConf，
 * 该对象包含了配置文件中定义的环境变量和对应的值，然后将这些变量转换为项目中使用的格式，并返回一个对象 ret，
 * 该对象包含了转换后的变量和对应的值。
 *
 * 具体转换过程如下：
 *
 * 遍历 envConf 中的每个属性，并根据属性名进行不同的处理。
 * 如果属性名为 VITE_PORT，则将属性值转换为数值类型。
 * 如果属性名为 VITE_PROXY，并且属性值不为空，则将属性值转换为 JSON 对象。如果转换失败，则将属性值设置为空字符串。
 * 将转换后的变量和对应的值存储在 ret 对象中。
 * 如果属性值是字符串类型，则将其设置为 process.env 中的环境变量。如果属性值是对象类型，则将其转换为 JSON 字符串后再设置为环境变量。
 * 通过这种方式，可以将配置文件中的环境变量转换为项目中使用的变量格式，以便在项目中方便地访问和使用这些变量。
 *
 *
 * process.env 中的环境变量是在 Node.js 运行时环境中定义的变量，它们可以用于在不同的环境中控制应用程序的行为。
 * 在 Node.js 应用程序中，可以通过 process.env 来读取和设置环境变量，这些环境变量可以在程序运行时动态修改，从而影响程序的行为。
 *
 * 环境变量的作用包括但不限于以下几个方面：
 *
 * 控制应用程序的配置：环境变量可以用于控制应用程序的配置，例如数据库的连接信息、调试模式的开关、日志级别等。
 *
 * 区分不同的运行环境：环境变量可以用于区分不同的运行环境，例如开发环境、测试环境和生产环境等。在不同的环境中，可以根据环境变量的值来设置不同的配置和行为。
 *
 * 控制应用程序的行为：环境变量可以用于控制应用程序的行为，例如设置特定的路由、启用或禁用某些功能等。
 *
 * 保护敏感信息：环境变量可以用于保护敏感信息，例如 API 密钥、用户名、密码等。将这些敏感信息保存在环境变量中，可以避免将它们硬编码到应用程序中，从而提高应用程序的安全性。
 *
 * 总之，环境变量是一种在应用程序中控制行为和配置的常用方式，可以让应用程序更加灵活和可配置。
 */
export function wrapperEnv(envConf: Recordable): ViteEnv {
  const ret: any = {}

  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, '\n')
    realName = realName === 'true' ? true : realName === 'false' ? false : realName

    if (envName === 'VITE_PORT') {
      realName = Number(realName)
    }
    if (envName === 'VITE_PROXY' && realName) {
      try {
        realName = JSON.parse(realName.replace(/'/g, '"'))
      } catch (error) {
        realName = ''
      }
    }
    ret[envName] = realName
    if (typeof realName === 'string') {
      process.env[envName] = realName
    } else if (typeof realName === 'object') {
      process.env[envName] = JSON.stringify(realName)
    }
  }
  return ret
}

/**
 * 获取当前环境下生效的配置文件名
 */
function getConfFiles() {
  const script = process.env.npm_lifecycle_script
  const reg = new RegExp('--mode ([a-z_\\d]+)')
  const result = reg.exec(script as string) as any
  if (result) {
    const mode = result[1] as string
    return ['.env', `.env.${mode}`]
  }
  return ['.env', '.env.production']
}

/**
 * Get the environment variables starting with the specified prefix
 * @param match prefix
 * @param confFiles ext
 */
export function getEnvConfig(match = 'VITE_GLOB_', confFiles = getConfFiles()) {
  let envConfig = {}
  confFiles.forEach((item) => {
    try {
      const env = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), item)))
      envConfig = { ...envConfig, ...env }
    } catch (e) {
      console.error(`Error in parsing ${item}`, e)
    }
  })
  const reg = new RegExp(`^(${match})`)
  Object.keys(envConfig).forEach((key) => {
    if (!reg.test(key)) {
      Reflect.deleteProperty(envConfig, key)
    }
  })
  return envConfig
}

/**
 * Get user root directory
 * @param dir file path
 */
export function getRootPath(...dir: string[]) {
  return path.resolve(process.cwd(), ...dir)
}
