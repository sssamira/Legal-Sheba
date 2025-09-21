import React, { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import LandingPage from './components/LandingPage.jsx'
import CaseAnalysis from './components/CaseAnalysis.jsx'
import LawyerDirectory from './components/LawyerDirectory.jsx'
import LawyerProfile from './components/LawyerProfile.jsx'
import DocumentAnalysis from './components/DocumentAnalysis.jsx'
import LegalHub from './components/LegalHub.jsx'
import InfoHubDetail from './components/InfoHubDetail.jsx'
import Dashboard from './components/Dashboard.jsx'
import Auth from './components/Auth.jsx'
import { getStoredUser, clearToken, clearStoredUser, getLawyerById } from './lib/api.js'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [userType, setUserType] = useState('anonymous')
  const [authMode, setAuthMode] = useState('login')
  const [selectedLawyer, setSelectedLawyer] = useState(null)
  const [selectedPostId, setSelectedPostId] = useState(null)

  // Normalize arbitrary backend roles to app roles
  const normalizeRole = (role) => {
    const r = (role || '').toString().toLowerCase()
    if (r.includes('admin')) return 'admin'
    if (r.includes('lawyer')) return 'lawyer'
    if (r.includes('client') || r === 'user') return 'client'
    return 'anonymous'
  }

  // Load persisted user session and page on first mount
  useEffect(() => {
    const user = getStoredUser()
    if (user?.role) {
      setUserType(normalizeRole(user.role))
    }
    const savedPage = localStorage.getItem('currentPage')
    if (savedPage) {
      setCurrentPage(savedPage)
      if (savedPage === 'lawyer-profile') {
        const id = localStorage.getItem('selectedLawyerId')
        if (id) {
          // Try to restore lawyer profile from backend
          getLawyerById(id).then((lw) => {
            setSelectedLawyer(lw)
          }).catch(() => {
            // ignore; user can navigate back
          })
        }
      } else if (savedPage === 'hub-detail') {
        const pid = localStorage.getItem('selectedPostId')
        if (pid) setSelectedPostId(pid)
      }
    }
  }, [])

  // Persist page changes
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage)
  }, [currentPage])

  const handleLogout = () => {
    clearToken()
    clearStoredUser()
    setUserType('anonymous')
    setCurrentPage('home')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage
          userType={userType}
          goAuth={(mode) => { setAuthMode(mode || 'signup'); setCurrentPage('auth') }}
          goDashboard={() => setCurrentPage('dashboard')}
        />
      case 'analysis':
        return <CaseAnalysis userType={userType} />
      case 'lawyers':
        return <LawyerDirectory userType={userType} onViewProfile={(lawyer) => { setSelectedLawyer(lawyer); if (lawyer?.id) localStorage.setItem('selectedLawyerId', lawyer.id); setCurrentPage('lawyer-profile') }} />
      case 'lawyer-profile':
        return <LawyerProfile lawyer={selectedLawyer} userType={userType} onBack={() => setCurrentPage('lawyers')} />
      case 'documents':
        return <DocumentAnalysis userType={userType} />
      case 'hub':
        return <LegalHub userType={userType} onOpenPost={(post) => { if (post?.id) { setSelectedPostId(post.id); localStorage.setItem('selectedPostId', post.id); setCurrentPage('hub-detail') } }} />
      case 'hub-detail':
        return <InfoHubDetail postId={selectedPostId} onBack={() => { setCurrentPage('hub'); }} />
      case 'dashboard':
        return <Dashboard userType={userType} />
      case 'auth':
  return <Auth mode={authMode} onAuth={(role) => { setUserType(normalizeRole(role)); setCurrentPage('dashboard') }} onCancel={() => setCurrentPage('home')} />
      default:
        return <LandingPage userType={userType} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
  <Header userType={userType} onLogout={handleLogout} goAuth={(mode) => { setAuthMode(mode || 'login'); setCurrentPage('auth') }} />

      <nav className="border-b bg-white sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 py-2">
            <button
              onClick={() => setCurrentPage('home')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'home'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Home
            </button>
            {/* AI Analysis nav item removed for now */}
            <button
              onClick={() => setCurrentPage('lawyers')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'lawyers'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Find Lawyers
            </button>
            <button
              onClick={() => setCurrentPage('documents')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'documents'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setCurrentPage('hub')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'hub'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Legal Hub
            </button>
            {userType !== 'anonymous' && (
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </nav>

      <main>{renderPage()}</main>

      <footer className="bg-muted/30 border-t mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 justify-items-center text-center max-w-3xl mx-auto">
            {/* Brand and social section removed as requested */}

            <div>
              <h4 className="font-medium mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>AI Case Analysis</li>
                <li>Lawyer Directory</li>
                <li>Document Analysis</li>
                <li>Legal Consultation</li>
                <li>Case Management</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Legal Areas</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Property Law</li>
                <li>Family Law</li>
                <li>Corporate Law</li>
                <li>Criminal Law</li>
                <li>Civil Rights</li>
              </ul>
            </div>

            {/* Support section removed as requested */}
          </div>

          <div className="border-t pt-8 mt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Legal-Sheba. All rights reserved. @sssamira</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
