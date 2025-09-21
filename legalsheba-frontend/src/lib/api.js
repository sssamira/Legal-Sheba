// Simple API client for the Spring Boot backend

// Use relative /api by default so Vite dev proxy can forward to backend without CORS
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const ENDPOINTS = {
  register: '/auth/register',
  registerLawyer: '/auth/register-lawyer',
  login: '/auth/login',
  lawyers: '/lawyers',
  appointments: '/appointments',
  infohub: '/infohub',
}

export function getToken() {
  return localStorage.getItem('token') || ''
}
export function setToken(token) {
  if (token) localStorage.setItem('token', token)
}
export function clearToken() {
  localStorage.removeItem('token')
}
export function setStoredUser(user) {
  if (user) localStorage.setItem('user', JSON.stringify(user))
}
export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}
export function clearStoredUser() {
  localStorage.removeItem('user')
}

async function request(path, { method = 'GET', data, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      // Do not include cookies by default; JWT is sent in Authorization header
      body: data ? JSON.stringify(data) : undefined,
    })
  } catch (e) {
    throw new Error(`Network error: ${e.message || 'Failed to fetch'}`)
  }
  const text = await res.text()
  let json
  try { json = text ? JSON.parse(text) : {} } catch { json = { message: text } }
  if (!res.ok) {
    const msg = json?.message || `Request failed (${res.status})`
    throw new Error(msg)
  }
  return json
}

export async function registerUser({ name, email, password, role }) {
  // Backend accepts firstName/name via alias
  const res = await request(ENDPOINTS.register, { method: 'POST', data: { firstName: name, email, password } })
  // Normalize to { token, user }
  return {
    token: res.token,
    user: res.id ? { id: res.id, email: res.email, role: res.role, name: res.fName || res.name, lawyerProfileId: res.lawyerProfileId } : undefined,
  }
}

export async function loginUser({ email, password }) {
  const res = await request(ENDPOINTS.login, { method: 'POST', data: { email, password } })
  return {
    token: res.token,
    user: res.id ? { id: res.id, email: res.email, role: res.role, name: res.fName || res.name, lawyerProfileId: res.lawyerProfileId } : undefined,
  }
}

// Register lawyer (creates user + profile together)
export async function registerLawyer({
  name, email, password,
  experience, location, court_of_practice, availability_details, v_hour,
  specialties,
}) {
  const res = await request(ENDPOINTS.registerLawyer, {
    method: 'POST',
    data: {
      firstName: name,
      email,
      password,
      experience: Number(experience) || 0,
      location,
      courtOfPractice: court_of_practice,
      availabilityDetails: availability_details,
      vHour: v_hour,
      specialties: Array.isArray(specialties) ? specialties : undefined,
    },
  })
  return {
    token: res.token,
    user: res.id ? { id: res.id, email: res.email, role: res.role, name: res.fName || res.name, lawyerProfileId: res.lawyerProfileId } : undefined,
  }
}

// Directory endpoints (public)
export async function getLawyers() {
  return request(ENDPOINTS.lawyers, { method: 'GET' })
}
export async function getLawyerById(id) {
  return request(`${ENDPOINTS.lawyers}/${id}`, { method: 'GET' })
}

// Get current authenticated lawyer profile
export async function getMyLawyerProfile() {
  // Backend returns a raw number (profile id). Normalize to { id }
  const res = await request(`${ENDPOINTS.lawyers}/me/profile-id`, { method: 'GET', auth: true })
  const id = typeof res === 'number' ? res : (res?.id ?? null)
  return id != null ? { id } : null
}

// Appointments: client inferred from JWT; status defaults to backend
export async function createAppointment({ lawyerProfileId, appointmentDate, problemDescription, notes }) {
  return request(ENDPOINTS.appointments, {
    method: 'POST',
    data: { lawyerProfileId, appointmentDate, problemDescription, notes },
    auth: true,
  })
}

// Appointments for lawyer profile (protected)
export async function getAppointmentsByLawyerProfile(lawyerProfileId, page = 0, size = 10) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  return request(`${ENDPOINTS.appointments}/by-lawyer/${lawyerProfileId}?${params.toString()}`, { method: 'GET', auth: true })
}

// Update appointment status (protected)
export async function updateAppointmentStatus(id, status) {
  return request(`${ENDPOINTS.appointments}/${id}/status`, {
    method: 'PATCH',
    data: { status },
    auth: true,
  })
}

export { API_BASE, ENDPOINTS }

// InfoHub (public GET, ADMIN for mutations)
export async function listInfoHub({ category = '', page = 0, size = 10 } = {}) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  params.set('page', String(page))
  params.set('size', String(size))
  return request(`${ENDPOINTS.infohub}?${params.toString()}`, { method: 'GET' })
}

export async function getInfoHubById(id) {
  return request(`${ENDPOINTS.infohub}/${id}`, { method: 'GET' })
}

export async function createInfoHub({ title, content, category, date }) {
  return request(ENDPOINTS.infohub, { method: 'POST', data: { title, content, category, date }, auth: true })
}

export async function updateInfoHub(id, { title, content, category, date }) {
  return request(`${ENDPOINTS.infohub}/${id}`, { method: 'PUT', data: { title, content, category, date }, auth: true })
}

export async function deleteInfoHub(id) {
  return request(`${ENDPOINTS.infohub}/${id}`, { method: 'DELETE', auth: true })
}

// Client: list my appointments (protected)
export async function getMyAppointments(page = 0, size = 10) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  return request(`${ENDPOINTS.appointments}/my?${params.toString()}`, { method: 'GET', auth: true })
}
