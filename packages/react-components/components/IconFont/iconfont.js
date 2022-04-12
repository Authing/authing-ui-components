export const init = function (a, h) {
  let c, t, l, e, i, o

  let m = document.getElementsByTagName('script')

  m = m[m.length - 1].getAttribute('data-injectcss')

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
    let a, c, t
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
