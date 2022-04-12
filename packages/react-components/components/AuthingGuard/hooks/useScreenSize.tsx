import { useState, useEffect } from 'react'
import { getGuardWindow } from '../../_utils/appendConfog'
// import { inRange, debounce } from 'lodash'

function debounce(fn: Function, delay: number, immediate = true) {
  let timer: any

  return function (this: any) {
    let context = this
    let args = arguments
    timer && clearTimeout(timer)

    if (immediate && !timer) {
      fn.apply(context, args)
    }

    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}

function inRange(n: number, start: number, end?: number): boolean {
  if (end || end === 0) {
    return n >= start && n <= end
  }
  return n >= start
}

export enum ScreenSize {
  Mobile = 'mobile',
  Desktop = 'desktop',
}
export const SCREEN_SIZE_RANG: {
  size: ScreenSize
  range: [number, number]
}[] = [
  {
    size: ScreenSize.Mobile,
    range: [0, 719],
  },
  {
    size: ScreenSize.Desktop,
    range: [720, Infinity],
  },
]

export const getScreenSize = () => {
  const viewportWidth = document.body.clientWidth
  return (
    SCREEN_SIZE_RANG.find((item) => inRange(viewportWidth, ...item.range))
      ?.size ?? ScreenSize.Desktop
  )
}

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState(getScreenSize)

  useEffect(() => {
    const onResize = debounce(() => {
      setScreenSize(getScreenSize())
    }, 200)

    const guardWindow = getGuardWindow()

    guardWindow?.addEventListener('resize', onResize)

    return () => guardWindow?.removeEventListener('resize', onResize)
  }, [])

  return [screenSize]
}
