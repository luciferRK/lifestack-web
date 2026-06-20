export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').then((registration) => {
      void registration.update()
    }).catch((error: unknown) => {
      console.error('Unable to register the Lifestack service worker', error)
    })
  })
}
