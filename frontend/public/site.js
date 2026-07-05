document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('menu-toggle')
  const mobileMenu = document.getElementById('mobile-menu')
  const hamburgerIcon = document.getElementById('hamburger-icon')
  const closeIcon = document.getElementById('close-icon')

  if (!toggleBtn || !mobileMenu) return

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true'
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded))
    mobileMenu.classList.toggle('hidden')
    mobileMenu.classList.toggle('flex')
    hamburgerIcon?.classList.toggle('hidden')
    closeIcon?.classList.toggle('hidden')
  })
})
