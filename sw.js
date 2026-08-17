// 学习工作台 Service Worker v3 —— 自动更新，无需随构建修改
// 页面：网络优先（保证新版本及时生效），离线回退缓存
// 静态资源：缓存优先，回源后自动写入缓存
const CACHE_NAME = 'study-workbench-v3'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return

  // 页面导航：网络优先
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((r) => {
          const clone = r.clone()
          caches.open(CACHE_NAME).then((c) => c.put('./index.html', clone))
          return r
        })
        .catch(() => caches.match('./index.html'))
    )
    return
  }

  // 静态资源（含字体 CDN）：缓存优先 + 回源写缓存
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request).then((r) => {
          if (r && (r.status === 200 || r.type === 'opaque')) {
            const clone = r.clone()
            caches.open(CACHE_NAME).then((c) => c.put(e.request, clone))
          }
          return r
        })
    )
  )
})
