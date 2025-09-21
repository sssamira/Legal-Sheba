import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card.jsx'
import { Input } from './ui/input.jsx'
import { Button } from './ui/button.jsx'
import { Badge } from './ui/badge.jsx'
import { Alert, AlertDescription } from './ui/alert.jsx'
import { Mail, Lock, UserPlus, LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { registerUser, registerLawyer, loginUser, setToken, setStoredUser } from '../lib/api.js'

// Simple email regex for demo
const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/

export default function Auth({ mode: initialMode = 'login', onAuth, onCancel }) {
  const [mode, setMode] = useState(initialMode) // 'login' | 'signup'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: 'client',
    // Lawyer profile fields
    experience: '', // integer years
    location: '',
    court_of_practice: '',
    availability_details: '',
    v_hour: '',
    // Enhanced availability + specialties
    availability_days: [], // ['Saturday', 'Sunday', ...]
    availability_start: '', // HH:MM
    availability_end: '', // HH:MM
    specialties_text: '', // comma-separated
  })
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const isSignup = mode === 'signup'
  const isLawyer = isSignup && form.role === 'lawyer'

  // Sync with external mode changes (e.g., from header)
  React.useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const toggleDay = (day) => {
    setForm((f) => {
      const set = new Set(f.availability_days || [])
      if (set.has(day)) set.delete(day)
      else set.add(day)
      return { ...f, availability_days: Array.from(set) }
    })
  }

  const validate = () => {
    const errs = {}
    if (!emailRegex.test(form.email)) errs.email = 'Valid email required'
    if (!form.password || form.password.length < 6) errs.password = 'Min 6 characters'
    if (isSignup) {
      if (!form.name.trim()) errs.name = 'Name required'
      if (form.confirm !== form.password) errs.confirm = 'Passwords do not match'
      if (isLawyer) {
        // Basic validations aligned to schema
        if (form.experience === '' || isNaN(Number(form.experience))) errs.experience = 'Experience (years) required'
        if (!form.location.trim()) errs.location = 'Location required'
        if (!form.court_of_practice.trim()) errs.court_of_practice = 'Court of practice required'
        // availability_details and v_hour optional here unless you want to enforce
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      if (isSignup) {
        let userRes
        if (form.role === 'lawyer') {
          // Build availabilityDetails from selected days and times if provided
          const days = (form.availability_days || [])
          const timeRange = (form.availability_start && form.availability_end)
            ? `${form.availability_start}–${form.availability_end}`
            : ''
          let availability_details = (form.availability_details || '').trim()
          if (days.length || timeRange) {
            const daysStr = days.length ? days.join(', ') : ''
            availability_details = [daysStr, timeRange].filter(Boolean).join(', ')
          }
          const specialties = (form.specialties_text || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)

          userRes = await registerLawyer({
            name: form.name,
            email: form.email,
            password: form.password,
            experience: form.experience,
            location: form.location,
            court_of_practice: form.court_of_practice,
            availability_details,
            v_hour: form.v_hour,
            specialties,
          })
        } else {
          userRes = await registerUser({ name: form.name, email: form.email, password: form.password })
        }
        // Prefer token+user from register; otherwise, login to obtain JWT
        let token = userRes.token || ''
        let user = userRes.user || { id: userRes.id, role: form.role, name: form.name, email: form.email }
        if (!token) {
          const loginRes = await loginUser({ email: form.email, password: form.password })
          token = loginRes.token || token
          user = loginRes.user || user
        }
        if (token) setToken(token)
        if (user) setStoredUser(user)
        onAuth && onAuth(form.role || 'client')
      } else {
        const loginRes = await loginUser({ email: form.email, password: form.password })
        const token = loginRes.token || ''
        const user = loginRes.user || null
        if (token) setToken(token)
        if (user) setStoredUser(user)
        onAuth && onAuth(user?.role || 'client')
      }
    } catch (err) {
        const raw = err?.message || ''
        const friendly = (isSignup && /409/.test(raw))
          ? 'An account with this email already exists.'
          : (raw || 'Authentication failed')
        setErrors({ form: friendly })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <div className="max-w-md mx-auto">
        <Card className="shadow-sm">
          <CardHeader className="space-y-2 pb-4 sm:pb-6">
            <Badge variant="secondary" className="w-fit text-[10px] sm:text-xs tracking-wide">SECURE AREA</Badge>
            <CardTitle className="text-2xl sm:text-3xl flex items-center gap-2">
              {isSignup ? <UserPlus className="h-6 w-6" /> : <LogIn className="h-6 w-6" />}
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {isSignup ? 'Register to access AI legal tools & personalized dashboard.' : 'Login to continue to your dashboard and tools.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.form && <p className="text-destructive text-sm">{errors.form}</p>}
              {isSignup && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input placeholder="Your name" value={form.name} onChange={update('name')} className={errors.name ? 'border-destructive' : ''} />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> Email</label>
                <Input type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} className={errors.email ? 'border-destructive' : ''} />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-2"><Lock className="h-4 w-4 text-muted-foreground" /> Password</label>
                <div className="relative">
                  <Input type={showPw ? 'text' : 'password'} placeholder="••••••" value={form.password} onChange={update('password')} className={errors.password ? 'pr-10 border-destructive' : 'pr-10'} />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
              </div>
              {isSignup && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <Input type={showPw2 ? 'text' : 'password'} placeholder="Repeat password" value={form.confirm} onChange={update('confirm')} className={errors.confirm ? 'pr-10 border-destructive' : 'pr-10'} />
                    <button type="button" onClick={() => setShowPw2((s) => !s)} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground">
                      {showPw2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirm && <p className="text-destructive text-xs mt-1">{errors.confirm}</p>}
                </div>
              )}
              {isSignup && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['client','lawyer'].map(r => (
                      <button type="button" key={r} onClick={() => setForm(f => ({...f, role: r}))} className={`border rounded-md py-2 text-sm font-medium transition-colors ${form.role===r? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}>
                        {r.charAt(0).toUpperCase()+r.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isLawyer && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Experience (years)</label>
                      <Input type="number" min="0" placeholder="e.g. 5" value={form.experience} onChange={update('experience')} className={errors.experience ? 'border-destructive' : ''} />
                      {errors.experience && <p className="text-destructive text-xs mt-1">{errors.experience}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Location</label>
                      <Input placeholder="e.g. Dhaka" value={form.location} onChange={update('location')} className={errors.location ? 'border-destructive' : ''} />
                      {errors.location && <p className="text-destructive text-xs mt-1">{errors.location}</p>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Court of Practice</label>
                    <Input placeholder="e.g. Dhaka High Court" value={form.court_of_practice} onChange={update('court_of_practice')} className={errors.court_of_practice ? 'border-destructive' : ''} />
                    {errors.court_of_practice && <p className="text-destructive text-xs mt-1">{errors.court_of_practice}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Availability</label>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'].map((d) => (
                          <label key={d} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={(form.availability_days || []).includes(d)}
                              onChange={() => toggleDay(d)}
                              className="h-4 w-4"
                            />
                            <span>{d.slice(0,3)}</span>
                          </label>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">Start Time</label>
                          <Input type="time" value={form.availability_start} onChange={update('availability_start')} />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">End Time</label>
                          <Input type="time" value={form.availability_end} onChange={update('availability_end')} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Or free text</label>
                        <Input placeholder="e.g. Mon–Fri, 10am–5pm" value={form.availability_details} onChange={update('availability_details')} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Hourly Rate (v_hour)</label>
                    <Input placeholder="e.g. ৳2500/hour" value={form.v_hour} onChange={update('v_hour')} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Specialties</label>
                    <Input placeholder="e.g. Family Law, Civil" value={form.specialties_text} onChange={update('specialties_text')} />
                    <p className="text-xs text-muted-foreground">Comma-separated. Example: Family Law, Civil</p>
                  </div>
                </div>
              )}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Please wait...' : isSignup ? (isLawyer ? 'Create Lawyer Account' : 'Create Account') : 'Login'}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center text-xs sm:text-sm text-muted-foreground">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button type="button" className="text-primary underline-offset-4 hover:underline font-medium" onClick={() => { setErrors({}); setMode(isSignup ? 'login' : 'signup') }}>
                  {isSignup ? 'Login' : 'Sign Up'}
                </button>
              </div>
              {!isSignup && (
                <div className="text-center">
                  <button type="button" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground underline decoration-dotted">Forgot password?</button>
                </div>
              )}
              <Alert className="text-xs sm:text-sm">
                <ShieldCheck className="h-4 w-4" />
                <AlertDescription>
                  We never share your email. By continuing you agree to our Terms & Privacy.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
