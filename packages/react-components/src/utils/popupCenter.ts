/**
 * 在屏幕中心弹出新窗口加载 url
 * @param url
 * @param param1
 */
export const popupCenter = (
  url: string,
  { w, h }: { w: number; h: number } = { w: 585, h: 649 }
) => {
  // Fixes dual-screen position                             Most browsers      Firefox
  const dualScreenLeft =
    window.screenLeft !== undefined ? window.screenLeft : window.screenX
  const dualScreenTop =
    window.screenTop !== undefined ? window.screenTop : window.screenY

  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
    ? document.documentElement.clientWidth
    : window.screen.width
  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
    ? document.documentElement.clientHeight
    : window.screen.height

  const systemZoom = width / window.screen.availWidth
  const left = (width - w) / 2 / systemZoom + dualScreenLeft
  const top = (height - h) / 2 / systemZoom + dualScreenTop
  const newWindow = window.open(
    url,
    '_blank',
    `
        toolbar=no,
        menubar=no,
        scrollbars=no,
        resizable=no,
        location=no,
        status=no
        width=${w / systemZoom}, 
        height=${h / systemZoom}, 
        top=${top}, 
        left=${left}
        `
  )

  newWindow?.focus()
}
