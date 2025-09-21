import React, { useState } from 'react'
import { Button } from './ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx'
import { Textarea } from './ui/textarea.jsx'
import { Badge } from './ui/badge.jsx'
import { Alert, AlertDescription } from './ui/alert.jsx'
import { Brain, FileText, MapPin, Clock, DollarSign, Star, Info, ArrowRight, Loader2 } from 'lucide-react'

export default function CaseAnalysis({ userType }) {
  const [caseDescription, setCaseDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  const handleAnalyze = async () => {
    if (!caseDescription.trim()) return
    setIsAnalyzing(true)
    setTimeout(() => {
      const mockAnalysis = {
        caseType: 'Property Dispute',
        confidence: 92,
        recommendedLawyers: [
          { id: 1, name: 'Advocate Rafiqul Islam', specialization: 'Property Law', experience: '15 years', location: 'Dhaka High Court', rating: 4.8, consultationFee: '৳2,500', availability: 'Available this week' },
          { id: 2, name: "Barrister Shahana Ahmed", specialization: 'Real Estate & Property', experience: '12 years', location: 'Supreme Court of Bangladesh', rating: 4.9, consultationFee: '৳3,000', availability: 'Next Monday' },
          { id: 3, name: 'Advocate Mohammad Hasan', specialization: 'Civil & Property Law', experience: '10 years', location: 'Chittagong District Court', rating: 4.7, consultationFee: '৳2,000', availability: 'Available today' },
        ],
        keyPoints: [
          'This appears to be a property boundary dispute',
          'Documentation of property ownership will be crucial',
          'Consider mediation before litigation',
          'Time-sensitive - property disputes have statute of limitations',
        ],
        nextSteps: [
          'Gather all property documents (deed, survey, etc.)',
          'Consult with a property law specialist',
          'Consider getting a property survey done',
          'Document any evidence of boundary markers',
        ],
      }
      setAnalysis(mockAnalysis)
      setIsAnalyzing(false)
    }, 2000)
  }

  if (userType === 'anonymous') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>AI Case Analysis</CardTitle>
            <CardDescription>
              Get personalized lawyer recommendations based on your legal issue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Please register or login to access the AI Case Analysis feature. Anonymous users can still browse our lawyer directory and legal information hub.
              </AlertDescription>
            </Alert>
            <div className="mt-6 flex gap-3 justify-center">
              <Button>Register Now</Button>
              <Button variant="outline">Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
  <div className="container mx-auto px-4 py-8 md:py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-4">AI Legal Case Analysis</h1>
          <p className="text-xl text-muted-foreground">Describe your legal situation and get AI-powered recommendations</p>
        </div>

  <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Describe Your Legal Issue
                </CardTitle>
                <CardDescription>Provide as much detail as possible about your situation in plain language</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Example: I bought a piece of land last year..."
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                  className="min-h-40 mb-4 resize-y"
                />
                <Button onClick={handleAnalyze} disabled={!caseDescription.trim() || isAnalyzing} className="w-full">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze My Case
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Tips for Better Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">Include key details:</div>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>• Timeline of events</li>
                    <li>• Parties involved</li>
                    <li>• Financial implications</li>
                    <li>• Any existing documents</li>
                  </ul>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Common case types:</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">Property</Badge>
                    <Badge variant="outline" className="text-xs">Family</Badge>
                    <Badge variant="outline" className="text-xs">Business</Badge>
                    <Badge variant="outline" className="text-xs">Criminal</Badge>
                    <Badge variant="outline" className="text-xs">Employment</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {analysis && (
          <div className="mt-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Analysis Results
                  </span>
                  <Badge variant="secondary">{analysis.confidence}% confidence</Badge>
                </CardTitle>
                <CardDescription>
                  Based on your description, this appears to be a <strong>{analysis.caseType}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Key Observations</h4>
                    <ul className="space-y-2">
                      {analysis.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Recommended Next Steps</h4>
                    <ul className="space-y-2">
                      {analysis.nextSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                            {i + 1}
                          </div>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Legal Professionals</CardTitle>
                <CardDescription>Based on your case type and location preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.recommendedLawyers.map((lawyer) => (
                    <div key={lawyer.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{lawyer.name}</h4>
                          <p className="text-sm text-muted-foreground">{lawyer.specialization}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm">{lawyer.rating}</span>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {lawyer.experience}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {lawyer.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          {lawyer.consultationFee}
                        </div>
                        <div className="text-green-600">{lawyer.availability}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">
                          Book Consultation
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                        <Button variant="outline" size="sm">View Profile</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
