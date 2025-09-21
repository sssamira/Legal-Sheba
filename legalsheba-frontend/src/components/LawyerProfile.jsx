import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx'
import { Button } from './ui/button.jsx'
import { Badge } from './ui/badge.jsx'
import { Input } from './ui/input.jsx'
import { Textarea } from './ui/textarea.jsx'
import { ArrowLeft, Calendar, Clock, DollarSign, MapPin, Award, Star, User } from 'lucide-react'
import { createAppointment, getStoredUser } from '../lib/api.js'

export default function LawyerProfile({ lawyer, onBack, userType = 'anonymous' }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ appointment_date: '', problem_description: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // Normalize role using both prop and persisted user (handles 'LAWYER', 'ROLE_LAWYER', etc.)
  const normalizedRole = ((userType || getStoredUser()?.role || 'anonymous') + '').toLowerCase()
  const isLawyer = normalizedRole.includes('lawyer')
  const isAnonymous = normalizedRole === 'anonymous' || normalizedRole === ''

  // Helper: parse lawyer availability
  const availabilityString = (lawyer.availabilityDetails || lawyer.availability || lawyer.availability_details || '').toString()
  const dayNameToIndex = {
    sunday: 0, sun: 0,
    monday: 1, mon: 1,
    tuesday: 2, tue: 2, tues: 2,
    wednesday: 3, wed: 3,
    thursday: 4, thu: 4, thur: 4, thurs: 4,
    friday: 5, fri: 5,
    saturday: 6, sat: 6,
  }
  function expandDayRange(start, end) {
    const s = dayNameToIndex[start.toLowerCase()]
    const e = dayNameToIndex[end.toLowerCase()]
    if (s == null || e == null) return []
    const res = []
    let i = s
    for (let k = 0; k < 7; k++) {
      res.push(i)
      if (i === e) break
      i = (i + 1) % 7
    }
    return res
  }
  function parseAvailability(str) {
    const daysSet = new Set()
    let startMinutes = null
    let endMinutes = null
    if (!str) return { days: daysSet, startMinutes, endMinutes }
    const parts = str.split(',').map(s => s.trim()).filter(Boolean)
    // Find a time range like HH:MM–HH:MM or HH:MM-HH:MM
    const timeRe = /(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/
    for (const p of parts) {
      const m = p.match(timeRe)
      if (m) {
        const sh = parseInt(m[1], 10), sm = parseInt(m[2], 10)
        const eh = parseInt(m[3], 10), em = parseInt(m[4], 10)
        startMinutes = sh * 60 + sm
        endMinutes = eh * 60 + em
      } else {
        // Days or day ranges
        const token = p.replace(/\./g, '')
        // Range like Mon–Fri or Monday–Friday
        const range = token.split(/\s*[–-]\s*/)
        if (range.length === 2 && dayNameToIndex[range[0].toLowerCase()] != null && dayNameToIndex[range[1].toLowerCase()] != null) {
          expandDayRange(range[0], range[1]).forEach(d => daysSet.add(d))
        } else if (dayNameToIndex[token.toLowerCase()] != null) {
          daysSet.add(dayNameToIndex[token.toLowerCase()])
        }
      }
    }
    return { days: daysSet, startMinutes, endMinutes }
  }
  function minutesOfDay(dateStr) {
    if (!dateStr) return null
    const d = new Date(dateStr)
    if (isNaN(d)) return null
    return d.getHours() * 60 + d.getMinutes()
  }
  function dayIndex(dateStr) {
    if (!dateStr) return null
    const d = new Date(dateStr)
    if (isNaN(d)) return null
    return d.getDay()
  }
  const parsedAvail = parseAvailability(availabilityString)
  function isWithinAvailability(dateStr) {
    if (!dateStr) return false
    // If no structured availability provided, allow booking
    if ((parsedAvail.days.size === 0) && (parsedAvail.startMinutes == null || parsedAvail.endMinutes == null)) return true
    const di = dayIndex(dateStr)
    const mins = minutesOfDay(dateStr)
    if (di == null || mins == null) return false
    if (parsedAvail.days.size > 0 && !parsedAvail.days.has(di)) return false
    if (parsedAvail.startMinutes != null && parsedAvail.endMinutes != null) {
      if (mins < parsedAvail.startMinutes || mins > parsedAvail.endMinutes) return false
    }
    return true
  }

  if (!lawyer) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <Card>
          <CardHeader>
            <CardTitle>Lawyer not found</CardTitle>
            <CardDescription>Please go back to the directory and select a profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back to Directory</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const update = (field) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    if (field === 'appointment_date') {
      // Live validate against availability
      setErrors((prev) => {
        const next = { ...prev }
        if (value && !isWithinAvailability(value)) {
          next.appointment_date = 'lawyer not available at the time you have selected'
        } else {
          delete next.appointment_date
        }
        return next
      })
    }
  }
  const validate = () => {
    const errs = {}
    if (!form.appointment_date) errs.appointment_date = 'Date & time is required'
    if (!form.problem_description.trim()) errs.problem_description = 'Please describe your problem'
    if (form.appointment_date && !isWithinAvailability(form.appointment_date)) {
      errs.appointment_date = 'lawyer not available at the time you have selected'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }
  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setFormError('')
    try {
      const user = getStoredUser()
      if (!user?.id) throw new Error('You must be logged in to book an appointment')
      await createAppointment({
        lawyerProfileId: lawyer.id ?? lawyer.user_id ?? lawyer.lawyer_id,
        appointmentDate: form.appointment_date,
        problemDescription: form.problem_description,
        notes: form.notes,
      })
      setSubmitted(true)
      setShowForm(false)
    } catch (err) {
      setFormError(err.message || 'Failed to create appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} className="-ml-2"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-medium">
                  {lawyer.avatar || <User className="h-6 w-6" />}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold">{lawyer.name}</h1>
                  <p className="text-muted-foreground">{lawyer.title}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400 fill-current" /><span>{lawyer.rating}</span><span className="text-muted-foreground">({lawyer.reviews} reviews)</span></div>
                    <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-muted-foreground" /><span>{lawyer.experience} years</span></div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {(lawyer.specialties || lawyer.specializations || []).map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-6 text-sm">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{lawyer.location}</span></div>
                <div className="flex items-center gap-2"><Award className="h-4 w-4 text-muted-foreground" /><span>{lawyer.education}</span></div>
                <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><span>{lawyer.consultationFee} consultation</span></div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{availabilityString || '—'}</span></div>
              </div>

              <div className="mt-6">
                <h2 className="font-medium mb-2">About</h2>
                <p className="text-sm text-muted-foreground">Experienced lawyer specializing in {(lawyer.specialties || lawyer.specializations || []).join(', ')}. Successfully handled over {lawyer.casesSolved}+ cases.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Take Appointment</CardTitle>
              <CardDescription>Schedule a consultation with this lawyer</CardDescription>
            </CardHeader>
            <CardContent>
              {isAnonymous ? (
                <div className="text-sm text-muted-foreground">Please login or sign up to book an appointment.</div>
              ) : isLawyer ? null : (
                <>
                  {!showForm && !submitted && (
                    <Button className="w-full" onClick={() => setShowForm(true)}><Calendar className="h-4 w-4 mr-2" />Book Appointment</Button>
                  )}
                  {submitted && (
                    <div className="text-sm text-green-600">Appointment request submitted. We'll notify you once it's confirmed.</div>
                  )}
                  {showForm && (
                    <form className="space-y-3" onSubmit={submit}>
                      {formError && <div className="text-destructive text-sm">{formError}</div>}
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Date & Time</label>
                        <Input type="datetime-local" value={form.appointment_date} onChange={update('appointment_date')} className={errors.appointment_date ? 'border-destructive' : ''} />
                        {errors.appointment_date && (
                          <p
                            className={`text-xs mt-1 ${
                              (errors.appointment_date + '').toLowerCase().includes('lawyer not available')
                                ? 'text-red-600'
                                : 'text-destructive'
                            }`}
                          >
                            {errors.appointment_date}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Problem Description</label>
                        <Textarea rows={4} placeholder="Briefly describe your legal issue" value={form.problem_description} onChange={update('problem_description')} className={errors.problem_description ? 'border-destructive' : ''} />
                        {errors.problem_description && <p className="text-destructive text-xs mt-1">{errors.problem_description}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Notes (optional)</label>
                        <Textarea rows={3} placeholder="Anything else the lawyer should know" value={form.notes} onChange={update('notes')} />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowForm(false); setSubmitted(false) }}>Cancel</Button>
                        <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</Button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
