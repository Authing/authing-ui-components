/** eslint-disable */
/**
 * !!!!!!!!!!!! 注意注意！！！！！！！！！！！！！
 *
 * 只要替换 svgStr 中的字符串即可，为了兼容 SSR！！！！！！
 *
 */
import { getGuardWindow } from '../_utils/appendConfog'
import { svgStr } from './svg'
var init = function (a) {
  var c,
    t,
    l,
    e,
    i,
    o,
    h = svgStr,
    m = (m = document.getElementsByTagName('script'))[
      m.length - 1
    ].getAttribute('data-injectcss')
  if (m && !a.__iconfont__svg__cssinject__) {
    a.__iconfont__svg__cssinject__ = !0
    try {
      document.write(
        '<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>'
      )
    } catch (a) {
      console && console.log(a)
    }
  }
  function n() {
    i || ((i = !0), l())
  }
  ;(c = function () {
    var a, c, t
    ;((t = document.createElement('div')).innerHTML = h),
      (h = null),
      (c = t.getElementsByTagName('svg')[0]) &&
        (c.setAttribute('aria-hidden', 'true'),
        (c.style.position = 'absolute'),
        (c.style.width = 0),
        (c.style.height = 0),
        (c.style.overflow = 'hidden'),
        (a = c),
        (t = document.body).firstChild
          ? (c = t.firstChild).parentNode.insertBefore(a, c)
          : t.appendChild(a))
  }),
    document.addEventListener
      ? ~['complete', 'loaded', 'interactive'].indexOf(document.readyState)
        ? setTimeout(c, 0)
        : ((t = function () {
            document.removeEventListener('DOMContentLoaded', t, !1), c()
          }),
          document.addEventListener('DOMContentLoaded', t, !1))
      : document.attachEvent &&
        ((l = c),
        (e = a.document),
        (i = !1),
        (o = function () {
          try {
            e.documentElement.doScroll('left')
          } catch (a) {
            return void setTimeout(o, 50)
          }
          n()
        })(),
        (e.onreadystatechange = function () {
          'complete' == e.readyState && ((e.onreadystatechange = null), n())
        }))
}

if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
  const globalWindow = getGuardWindow()

  if (globalWindow) init(globalWindow)
}
