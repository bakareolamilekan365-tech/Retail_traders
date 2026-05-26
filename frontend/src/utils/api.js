const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const getToken = () => sessionStorage.getItem('token')

const setToken = (token) => {
  sessionStorage.setItem('token', token)
}

const clearToken = () => {
  sessionStorage.removeItem('token')
}

const decodeTokenPayload = (token) => {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch (error) {
    return null
  }
}

const apiFetch = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    clearToken()
  }

  return response
}

const loginUser = async ({ username, password }) => {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.detail || 'Login failed')
  }

  const payload = await response.json()
  setToken(payload.access_token)
  return payload
}

const registerUser = async ({ username, email, password }) => {
  const response = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.detail || 'Registration failed')
  }

  const payload = await response.json()
  setToken(payload.access_token)
  return payload
}

const changePassword = async ({ old_password, new_password }) => {
  const response = await apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ old_password, new_password }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.detail || 'Password update failed')
  }

  return response.json()
}

const checkAdmin = async () => {
  const response = await apiFetch('/admin/stats', { method: 'GET' })
  if (response.status === 403) {
    return false
  }
  if (!response.ok) {
    throw new Error('Failed to verify admin access')
  }
  return true
}

const fetchPredictionHistory = async () => {
  const response = await apiFetch('/predictions/history', { method: 'GET' })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.detail || 'Failed to load prediction history')
  }
  return response.json()
}

export {
  API_BASE,
  apiFetch,
  loginUser,
  registerUser,
  changePassword,
  checkAdmin,
  fetchPredictionHistory,
  decodeTokenPayload,
  getToken,
  setToken,
  clearToken,
}
