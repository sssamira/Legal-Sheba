import React from 'react'
import { Scale } from 'lucide-react'
import { Button } from './ui/button.jsx'

export default function Header({ goAuth, userType = 'anonymous', onLogout }) {
  return (
    <header className="border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 sticky top-0 z-50">
      <div className="container px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <span className="text-xl font-medium">Legal-Sheba</span>
          </div>
          <div className="flex items-center gap-2">
            {userType === 'anonymous' ? (
              <>
                <Button variant="outline" size="sm" onClick={() => goAuth && goAuth('login')}>Login</Button>
                <Button size="sm" onClick={() => goAuth && goAuth('signup')}>Sign Up</Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={onLogout}>Logout</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
