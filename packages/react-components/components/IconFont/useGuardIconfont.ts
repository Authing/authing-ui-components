import { useCallback, useEffect, useState } from 'react'
import { getGuardWindow } from '../Guard/core/useAppendConfig'
import { GenerateSvg } from './iconfont'

export const useGuardIconfont = (cdnBase?: string, setError?: any) => {
  const [loaded, setLoaded] = useState<boolean>(false)

  const initIconfont = useCallback(async () => {
    if (!cdnBase) return

    try {
      const res = await fetch(`${cdnBase}/svg-string/guard`)
      const body = await res?.text()

      const guardWindow = getGuardWindow()

      if (!guardWindow) return

      GenerateSvg(guardWindow.document, body)

      setLoaded(true)
    } catch (error) {
      setError(error)
    }
  }, [cdnBase, setError])

  useEffect(() => {
    initIconfont()
  }, [initIconfont])

  return loaded
}
