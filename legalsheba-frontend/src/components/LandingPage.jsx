import React from 'react'
import { Button } from './ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx'
import { Badge } from './ui/badge.jsx'
import { Brain, Search, FileText, Calendar, MessageSquare, FolderOpen, Info, Shield, Users, Phone } from 'lucide-react'

export default function LandingPage({ userType, goAuth, goDashboard }) {
  const features = [
    { icon: Brain, title: 'AI Case Analysis', description: 'Describe your legal issue in plain language and get recommendations for the right type of lawyer', available: userType !== 'anonymous' },
    { icon: Search, title: 'Find Legal Professionals', description: 'Search our directory of qualified lawyers by specialty, location, and court of practice', available: true },
    { icon: Calendar, title: 'Book Consultations', description: 'Schedule appointments with lawyers and manage your consultation calendar', available: userType !== 'anonymous' },
    { icon: FileText, title: 'Document Analysis', description: 'Upload legal documents for AI-powered analysis, summaries, and explanations', available: userType !== 'anonymous' },
    { icon: FolderOpen, title: 'Case Management', description: 'Create case files, upload documents securely, and set reminders for important dates', available: userType !== 'anonymous' },
    { icon: Info, title: 'Legal Information Hub', description: 'Access general legal information, FAQs, and educational resources', available: true },
    { icon: MessageSquare, title: 'AI Legal Chatbot', description: 'Get instant answers to legal questions and document interpretations', available: userType !== 'anonymous' },
    { icon: Phone, title: 'Legal Helpline', description: 'Direct access to legal professionals for immediate assistance', available: true }
  ]

  // Testimonials and ratings removed

  return (
    <div className="min-h-screen">
      <section className="relative py-16 sm:py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10"></div>
        <div className="container mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <Badge className="mb-6">Powered by AI</Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-6 leading-tight">
                Your Gateway to <span className="text-primary">Legal Justice</span> in Bangladesh
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl">
                Connect with qualified legal professionals, get AI-powered case analysis, 
                and manage your legal matters efficiently. Making justice accessible for everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {userType === 'anonymous' ? (
                  <>
                    <Button size="lg" onClick={() => goAuth && goAuth('signup')}>Get Started Free</Button>
                    <Button variant="outline" size="lg">Find a Lawyer</Button>
                  </>
                ) : (
                  <>
                    <Button size="lg" variant="secondary" onClick={() => goAuth && goAuth('signup')}>
                      <Users className="h-4 w-4 mr-2" />
                      Join as Client
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => (userType === 'anonymous' ? (goAuth && goAuth('signup')) : (goDashboard && goDashboard()))}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Register as Lawyer
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="relative aspect-video w-full max-w-xl mx-auto lg:mx-0">
              <img
                src="/hero.jpg"
                alt="Legal-Sheba platform — justice and legal services"
                className="absolute inset-0 h-full w-full object-cover rounded-lg shadow-2xl"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl mb-4">Comprehensive Legal Services Platform</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to navigate Bangladesh's legal system efficiently and confidently
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {features.map((feature, index) => (
              <Card key={index} className={!feature.available ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${feature.available ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <feature.icon className="h-5 w-5" />
                    </div>
                    {!feature.available && <Badge variant="outline" className="text-xs">Login Required</Badge>}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

  {/* Stats section removed */}

      {/* Testimonials and ratings section removed */}

  <section className="py-16 sm:py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl mb-4">Ready to Access Justice?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of Bangladeshis who have found legal solutions through our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => goAuth && goAuth('signup')}>
              <Users className="h-4 w-4 mr-2" />
              Join as Client
            </Button>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 border border-white/80"
              onClick={() => (userType === 'anonymous' ? (goAuth && goAuth('signup')) : (goDashboard && goDashboard()))}
            >
              <Shield className="h-4 w-4 mr-2" />
              Register as Lawyer
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
