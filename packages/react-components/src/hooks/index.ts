import { GuardModuleType } from 'src/components/Guard/module'
import { useModule } from 'src/context/module/context'

export const useChangeModule = () => {
  const { module, changeModule, setInitData } = useModule()

  const nextModule = (nextModuleType: GuardModuleType, nextData?: any) => {
    if (nextModuleType !== module) changeModule(nextModuleType)

    setInitData(nextData ?? {})
  }

  return nextModule
}

let thisAppId: string = ''

export const useAppId = (appId?: string) => {
  if (appId) {
    thisAppId = appId
  }

  return thisAppId
}
