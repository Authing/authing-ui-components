import { useEffect, useState } from 'react'
import { ApplicationConfig } from '../AuthingGuard/api'
import { getGuardWindow } from '../_utils/appendConfig'
import { init } from './iconfont'

export const useGuardIconfont = (publicConfig?: ApplicationConfig) => {
  const [svgString, setSvgString] = useState<string>()

  const [loaded, setLoaded] = useState<boolean>(false)

  const loadSvgString = async (cdnBase: string) => {
    const res = await fetch(`${cdnBase}/svg-string/guard`)

    const body = await res.text()

    setSvgString(body)
  }

  useEffect(() => {
    if (!publicConfig) return

    if (svgString) return

    loadSvgString(publicConfig.cdnBase)
  }, [publicConfig, svgString])

  useEffect(() => {
    if (!svgString) return

    const guardWindow = getGuardWindow()

    if (!guardWindow) return

    init(guardWindow, svgString)

    setLoaded(true)
  }, [svgString])

  if (loaded) {
    return true
  }
}
