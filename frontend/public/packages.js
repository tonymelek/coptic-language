/*! Packages page install + format tabs */
;(function () {
  const PMS = {
    npm: (pkg) => `npm install ${pkg}`,
    yarn: (pkg) => `yarn add ${pkg}`,
    pnpm: (pkg) => `pnpm add ${pkg}`,
    bun: (pkg) => `bun add ${pkg}`,
  }

  function activateTab(group, name) {
    const root = group.closest('[data-tabs]') || group
    const tabs = root.querySelectorAll('[data-tab]')
    const panels = root.querySelectorAll('[data-panel]')
    tabs.forEach((tab) => {
      const on = tab.getAttribute('data-tab') === name
      tab.classList.toggle('is-active', on)
      tab.setAttribute('aria-pressed', on ? 'true' : 'false')
    })
    panels.forEach((panel) => {
      const on = panel.getAttribute('data-panel') === name
      panel.classList.toggle('hidden', !on)
      panel.hidden = !on
    })
  }

  document.querySelectorAll('[data-tabs]').forEach((root) => {
    root.querySelectorAll('[data-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        activateTab(tab, tab.getAttribute('data-tab'))
      })
    })
  })

  document.querySelectorAll('[data-install]').forEach((root) => {
    const pkg = root.getAttribute('data-install')
    const codeEl = root.querySelector('[data-install-cmd]')
    root.querySelectorAll('[data-pm]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pm = btn.getAttribute('data-pm')
        root.querySelectorAll('[data-pm]').forEach((b) => {
          const on = b === btn
          b.classList.toggle('is-active', on)
          b.setAttribute('aria-pressed', on ? 'true' : 'false')
        })
        if (codeEl && PMS[pm]) codeEl.textContent = PMS[pm](pkg)
      })
    })
  })

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const target = document.querySelector(btn.getAttribute('data-copy'))
      if (!target) return
      const text = target.textContent || ''
      try {
        await navigator.clipboard.writeText(text.trim())
        const prev = btn.textContent
        btn.textContent = 'Copied'
        setTimeout(() => {
          btn.textContent = prev
        }, 1400)
      } catch {
        /* ignore */
      }
    })
  })
})()
