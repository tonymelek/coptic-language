document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('feedback-form')
  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const btn = document.getElementById('submit-btn')
    const status = document.getElementById('form-status')
    btn.disabled = true
    btn.textContent = 'Submitting…'
    status.className = 'hidden text-sm font-medium'

    const payload = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      submissionType: document.getElementById('category').value,
      message: document.getElementById('message').value,
      source: 'coptic-language',
    }

    try {
      const res = await fetch('/api/submitFeedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        status.textContent = 'Thank you — your message has been submitted.'
        status.className = 'text-sm font-medium text-green-700'
        form.reset()
      } else {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Submission failed')
      }
    } catch (err) {
      status.textContent = `${err.message}. Please try again.`
      status.className = 'text-sm font-medium text-red-600'
    } finally {
      btn.disabled = false
      btn.textContent = 'Send message'
    }
  })
})
