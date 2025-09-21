import React, { useEffect, useMemo, useState } from 'react'
import { Button } from './ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card.jsx'
import { Badge } from './ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.jsx'
import { User, FileText, Calendar, Scale, Clock, Plus } from 'lucide-react'
import { getStoredUser, setStoredUser } from '../lib/api.js'
import { getMyLawyerProfile } from '../lib/api.js'
import { getAppointmentsByLawyerProfile, updateAppointmentStatus, getMyAppointments } from '../lib/api.js'
import { listInfoHub, createInfoHub, updateInfoHub as apiUpdateInfoHub, deleteInfoHub } from '../lib/api.js'

export default function Dashboard({ userType }) {
  const [activeTab, setActiveTab] = useState(userType === 'lawyer' ? 'appointments' : 'overview')
  // Lawyer appointments state
  const [appointments, setAppointments] = useState([])
  const [apLoading, setApLoading] = useState(false)
  const [apError, setApError] = useState('')
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [hasMore, setHasMore] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [resolvedLawyerId, setResolvedLawyerId] = useState(null)

  const [userState, setUserState] = useState(() => getStoredUser() || null)
  const isAdmin = ((userState?.role || '').toString().toLowerCase().includes('admin'))
  // Send the authenticated user's id to the backend; it resolves to the lawyer profile internally
  const lawyerUserId = userState?.id || null

  const statusLabelToBackend = {
    accepted: 'CONFIRMED',
    'on progress': 'IN_PROGRESS',
    done: 'COMPLETED',
    rejected: 'REJECTED',
  }
  const backendToNice = {
    CONFIRMED: 'Accepted',
    IN_PROGRESS: 'On Progress',
    COMPLETED: 'Done',
    PENDING: 'Pending',
  }

  useEffect(() => {
    if (userType !== 'lawyer') return
    async function ensureIdAndLoad() {
      // Prefer resolving the actual lawyer profile id from backend
      let lid = null
      try {
        const me = await getMyLawyerProfile()
        lid = me?.id || null
        if (lid) {
          const nextUser = { ...(userState || {}), lawyerProfileId: lid }
          setUserState(nextUser)
          setStoredUser(nextUser)
        }
      } catch (_) {
        // ignore resolution errors, fallback to user id
      }
      if (!lid) lid = lawyerUserId
      setResolvedLawyerId(lid || null)
      if (lid) {
        setAppointments([])
        setPage(0)
        setHasMore(true)
        await loadAppointments(0, lid)
      }
    }
    ensureIdAndLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType, lawyerUserId])

  async function loadAppointments(nextPage = page, idOverride = null) {
    try {
      setApLoading(true)
      setApError('')
      const idToUse = idOverride ?? lawyerUserId
      if (!idToUse) {
        setApError('Missing lawyer id')
        setHasMore(false)
        return
      }
      const res = await getAppointmentsByLawyerProfile(idToUse, nextPage, size)
      const content = Array.isArray(res?.content) ? res.content : []
      const filtered = content.filter((a) => a.status !== 'REJECTED')
      setAppointments((prev) => nextPage === 0 ? filtered : [...prev, ...filtered])
      const totalPages = Number(res?.totalPages ?? 0)
      setHasMore(nextPage + 1 < totalPages)
      setPage(nextPage)
    } catch (e) {
      setApError(e.message || 'Failed to load appointments')
    } finally {
      setApLoading(false)
    }
  }

  async function onChangeStatus(apptId, label) {
    const status = statusLabelToBackend[label]
    if (!status) return
    try {
      setUpdatingId(apptId)
      await updateAppointmentStatus(apptId, status)
      // Update local state; remove if rejected
      setAppointments((prev) => {
        const next = prev.map((a) => (a.id === apptId ? { ...a, status } : a))
        return next.filter((a) => a.status !== 'REJECTED')
      })
    } catch (e) {
      alert(e.message || 'Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  if (userType === 'anonymous') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <User className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Access Your Dashboard</CardTitle>
            <CardDescription>Register or login to access your personalized legal dashboard</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-muted-foreground">Track your cases, manage appointments, and access your legal documents</p>
              <div className="flex gap-3 justify-center">
                <Button>Register Now</Button>
                <Button variant="outline">Login</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (userType === 'client') {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl mb-2">My Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Welcome back! Here's what's happening with your legal matters.</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5 sm:space-y-6">
          <TabsList className="flex flex-wrap gap-1 p-1 overflow-x-auto max-w-full">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="appointments" className="text-xs sm:text-sm">My Appointments</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-5 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4">
              <Card><CardContent className="p-4 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[11px] sm:text-sm text-muted-foreground">Active Cases</p><p className="text-xl sm:text-2xl font-medium">0</p></div><FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" /></div></CardContent></Card>
              <Card><CardContent className="p-4 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[11px] sm:text-sm text-muted-foreground">Upcoming Meetings</p><p className="text-xl sm:text-2xl font-medium">0</p></div><Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" /></div></CardContent></Card>
              <Card><CardContent className="p-4 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[11px] sm:text-sm text-muted-foreground">Documents</p><p className="text-xl sm:text-2xl font-medium">0</p></div><FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" /></div></CardContent></Card>
              <Card><CardContent className="p-4 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[11px] sm:text-sm text-muted-foreground">Connected Lawyers</p><p className="text-xl sm:text-2xl font-medium">0</p></div><Scale className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" /></div></CardContent></Card>
            </div>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2 sm:pb-4"><CardTitle className="text-base sm:text-lg">Recent Cases</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg"><div className="pr-2"><p className="font-medium text-sm sm:text-base">Property Boundary Dispute</p><p className="text-[11px] sm:text-sm text-muted-foreground">with Advocate Rafiqul Islam</p></div><Badge variant="secondary" className="text-[10px] sm:text-xs">Active</Badge></div>
                    <div className="flex items-center justify-between p-3 border rounded-lg"><div className="pr-2"><p className="font-medium text-sm sm:text-base">Contract Review</p><p className="text-[11px] sm:text-sm text-muted-foreground">with Barrister Shahana Ahmed</p></div><Badge variant="outline" className="text-[10px] sm:text-xs">Pending</Badge></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 sm:pb-4"><CardTitle className="text-base sm:text-lg">Upcoming Appointments</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg"><Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary" /><div className="flex-1"><p className="font-medium text-sm sm:text-base">No Consultations yet</p><p className="text-[11px] sm:text-sm text-muted-foreground">--, --:-- PM/AM</p></div></div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg"><Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" /><div className="flex-1"><p className="font-medium text-sm sm:text-base">No review Sessions yet</p><p className="text-[11px] sm:text-sm text-muted-foreground">--, --:-- PM/AM</p></div></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cases" className="space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-medium">My Cases</h2>
              <Button className="self-start sm:self-auto text-sm sm:text-base"><Plus className="h-4 w-4 mr-2" />New Case</Button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {[
                { title: 'Property Boundary Dispute', lawyer: 'Advocate Rafiqul Islam', status: 'Active', lastUpdate: '2 days ago', progress: 60 },
                { title: 'Employment Contract Review', lawyer: 'Barrister Shahana Ahmed', status: 'Pending', lastUpdate: '1 week ago', progress: 30 },
              ].map((c, i) => (
                <Card key={i}><CardContent className="p-4 sm:p-6"><div className="flex items-center justify-between gap-3"><div className="pr-2"><p className="font-medium text-sm sm:text-base">{c.title}</p><p className="text-[11px] sm:text-sm text-muted-foreground">with {c.lawyer}</p></div><Badge variant={c.status === 'Active' ? 'secondary' : 'outline'} className="text-[10px] sm:text-xs">{c.status}</Badge></div><div className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-muted-foreground">Last update: {c.lastUpdate}</div></CardContent></Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <ClientAppointments />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Admin-only view (non-lawyer admins)
  if (userType === 'admin') {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl mb-2">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage InfoHub content and administrative tasks.</p>
        </div>
        <AdminInfoHub />
      </div>
    )
  }

  // Lawyer view
  if (userType === 'lawyer') {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl mb-2">Lawyer Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your appointments and case activities.</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5 sm:space-y-6">
          <TabsList className="flex flex-wrap gap-1 p-1 overflow-x-auto max-w-full">
            <TabsTrigger value="appointments" className="text-xs sm:text-sm">Appointments</TabsTrigger>
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin-infohub" className="text-xs sm:text-sm">Admin: InfoHub</TabsTrigger>}
          </TabsList>
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">My Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[11px] text-muted-foreground mb-2 flex items-center gap-2">
                  <span>Resolved ID:</span>
                  <code className="px-1 py-0.5 bg-muted rounded">{resolvedLawyerId ?? '—'}</code>
                  <Button size="sm" variant="outline" onClick={() => loadAppointments(0, resolvedLawyerId || lawyerUserId)} disabled={apLoading}>Refresh</Button>
                </div>
                {apError && <div className="text-destructive text-sm mb-3">{apError}</div>}
                <div className="space-y-3">
                  {apLoading && appointments.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Loading appointments...</div>
                  ) : appointments.map((a) => (
                    <div key={a.id} className="p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm sm:text-base">{a.clientName || a.client?.name || 'Client'}</p>
                          <Badge variant="secondary" className="text-[10px] sm:text-xs">{backendToNice[a.status] || a.status}</Badge>
                        </div>
                        <div className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                          {a.appointmentDate ? new Date(a.appointmentDate).toLocaleString() : '—'}
                        </div>
                        {a.problemDescription && (
                          <div className="text-[11px] sm:text-xs mt-1">{a.problemDescription}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className="border rounded-md px-2 py-1 text-sm"
                          value={''}
                          onChange={(e) => onChangeStatus(a.id, e.target.value)}
                          disabled={updatingId === a.id}
                        >
                          <option value="" disabled>Update status…</option>
                          <option value="accepted">Accepted</option>
                          <option value="on progress">On progress</option>
                          <option value="done">Done</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
                {hasMore && (
                  <div className="pt-3">
                    <Button variant="outline" onClick={() => loadAppointments(page + 1, resolvedLawyerId || lawyerUserId)} disabled={apLoading}>Load more</Button>
                  </div>
                )}
                {!apLoading && appointments.length === 0 && !apError && (
                  <div className="text-sm text-muted-foreground">
                    {resolvedLawyerId ? 'No appointments to show.' : 'No linked lawyer profile found for this account.'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="overview">
            <Card><CardContent className="p-4">No appointments yet</CardContent></Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin-infohub" className="space-y-4">
              <AdminInfoHub />
            </TabsContent>
          )}
        </Tabs>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader><CardTitle>Admin/Lawyer dashboard coming soon</CardTitle></CardHeader>
        <CardContent>Switch user type in the header badges to see client view.</CardContent>
      </Card>
    </div>
  )
}

function AdminInfoHub() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ id: null, title: '', content: '', category: '', date: '' })
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => { refresh(0) }, [])

  async function refresh(p = 0) {
    try {
      setLoading(true)
      setError('')
      const res = await listInfoHub({ page: p, size })
      const content = Array.isArray(res?.content) ? res.content : []
      setItems(p === 0 ? content : [...items, ...content])
      const totalPages = Number(res?.totalPages ?? 0)
      setHasMore(p + 1 < totalPages)
      setPage(p)
    } catch (e) {
      setError(e.message || 'Failed to load infohub')
    } finally { setLoading(false) }
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      if (form.id) {
        await apiUpdateInfoHub(form.id, form)
      } else {
        await createInfoHub(form)
      }
      setForm({ id: null, title: '', content: '', category: '', date: '' })
      await refresh(0)
    } catch (e) { setError(e.message || 'Failed to save') }
    finally { setLoading(false) }
  }

  async function onEdit(item) {
    setForm({ id: item.id, title: item.title, content: item.content, category: item.category, date: item.date })
  }

  async function onDelete(id) {
    if (!confirm('Delete this post?')) return
    try { await deleteInfoHub(id); await refresh(0) } catch (e) { alert(e.message || 'Delete failed') }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Create / Edit InfoHub Post</CardTitle></CardHeader>
        <CardContent>
          {error && <div className="text-destructive text-sm mb-3">{error}</div>}
          <form className="space-y-2" onSubmit={submit}>
            <input type="text" placeholder="Title" className="border rounded px-2 py-1 w-full" value={form.title} onChange={update('title')} required maxLength={150} />
            <input type="text" placeholder="Category (e.g., family, property)" className="border rounded px-2 py-1 w-full" value={form.category} onChange={update('category')} required maxLength={50} />
            <input type="text" placeholder="Date (YYYY-MM-DD)" className="border rounded px-2 py-1 w-full" value={form.date} onChange={update('date')} required maxLength={50} />
            <textarea rows={6} placeholder="Content" className="border rounded px-2 py-1 w-full" value={form.content} onChange={update('content')} required />
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>{form.id ? 'Update' : 'Create'}</Button>
              {form.id && <Button type="button" variant="outline" onClick={() => setForm({ id: null, title: '', content: '', category: '', date: '' })}>Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Posts</CardTitle></CardHeader>
        <CardContent>
          {loading && items.length === 0 ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="p-3 border rounded flex items-center justify-between">
                  <div className="pr-3">
                    <div className="font-medium">{it.title}</div>
                    <div className="text-xs text-muted-foreground">{it.category} • {it.date}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(it)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(it.id)}>Delete</Button>
                  </div>
                </div>
              ))}
              {hasMore && <div className="pt-2"><Button variant="outline" onClick={() => refresh(page + 1)} disabled={loading}>Load more</Button></div>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ClientAppointments() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => { refresh(0) }, [])

  async function refresh(p = 0) {
    try {
      setLoading(true)
      setError('')
      const res = await getMyAppointments(p, size)
      const content = Array.isArray(res?.content) ? res.content : []
      setItems(p === 0 ? content : [...items, ...content])
      const totalPages = Number(res?.totalPages ?? 0)
      setHasMore(p + 1 < totalPages)
      setPage(p)
    } catch (e) {
      setError(e.message || 'Failed to load appointments')
    } finally { setLoading(false) }
  }

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">My Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-destructive text-sm mb-3">{error}</div>}
        {loading && items.length === 0 ? (
          <div className="text-sm text-muted-foreground">Loading appointments…</div>
        ) : (
          <div className="space-y-3">
            {items.map((a) => (
              <div key={a.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm sm:text-base">{a.lawyerName || 'Lawyer'}</div>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs">{a.status || 'PENDING'}</Badge>
                </div>
                <div className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                  {a.appointmentDate ? new Date(a.appointmentDate).toLocaleString() : '—'}
                </div>
                {a.problemDescription && (
                  <div className="text-[11px] sm:text-xs mt-1">{a.problemDescription}</div>
                )}
                {a.notes && (
                  <div className="text-[11px] sm:text-xs mt-1 text-muted-foreground">Notes: {a.notes}</div>
                )}
              </div>
            ))}
          </div>
        )}
        {hasMore && (
          <div className="pt-3">
            <Button variant="outline" onClick={() => refresh(page + 1)} disabled={loading}>Load more</Button>
          </div>
        )}
        {!loading && items.length === 0 && !error && (
          <div className="text-sm text-muted-foreground">No appointments yet.</div>
        )}
      </CardContent>
    </Card>
  )
}
