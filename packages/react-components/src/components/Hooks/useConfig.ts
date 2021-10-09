const locaConfig: any = {}
const cloudConfig: any = {}

export const useConfig = (config?: any) => {
  // 调用 public-config 接口

  // config 默认值

  // 融合～ config

  return {
    config: config,
    cloudConfig: cloudConfig,
  }
}
