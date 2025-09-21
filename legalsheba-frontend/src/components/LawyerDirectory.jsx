import React, { useEffect, useMemo, useState } from 'react'
import { Button } from './ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx'
import { Input } from './ui/input.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.jsx'
import { Badge } from './ui/badge.jsx'
import { Checkbox } from './ui/checkbox.jsx'
import { Search, MapPin, Star, Clock, DollarSign, Filter, Calendar, Phone, Mail, Award, ArrowRight } from 'lucide-react'
import { getLawyers } from '../lib/api.js'

export default function LawyerDirectory({ userType, onViewProfile }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [lawyers, setLawyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getLawyers()
        if (!ignore) setLawyers(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!ignore) setError(e.message || 'Failed to load lawyers')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  const specialtyOptions = useMemo(() => {
    const set = new Set()
    lawyers.forEach(l => (l.specialties || []).forEach(s => set.add(s)))
    return Array.from(set).sort()
  }, [lawyers])

  const locationOptions = useMemo(() => {
    const set = new Set()
    lawyers.forEach(l => {
      const val = l.courtOfPractice || l.location
      if (val) set.add(val)
    })
    return Array.from(set).sort()
  }, [lawyers])

  const filteredLawyers = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return lawyers.filter(l => {
      const specs = l.specialties || []
      const matchesSearch = l.name?.toLowerCase().includes(q) || specs.some(s => s.toLowerCase().includes(q))
      const matchesSpecialty = !selectedSpecialty || specs.includes(selectedSpecialty)
      const loc = l.courtOfPractice || l.location || ''
      const matchesLocation = !selectedLocation || loc === selectedLocation
      return matchesSearch && matchesSpecialty && matchesLocation
    })
  }, [lawyers, searchTerm, selectedSpecialty, selectedLocation])

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl mb-3 sm:mb-4">Find Legal Professionals</h1>
        <p className="text-base sm:text-xl text-muted-foreground">Search our directory of qualified lawyers across Bangladesh</p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or specialization..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-full sm:w-60">
                  <SelectValue placeholder="Select Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Specializations</SelectItem>
                  {specialtyOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full sm:w-60">
                  <SelectValue placeholder="Select Court/Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  {locationOptions.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'More Filters'}
              </Button>
            </div>

            {showFilters && (
              <div className="border-t pt-4 mt-4 animate-in fade-in slide-in-from-top-1">
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Experience</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="exp1" />
                        <label htmlFor="exp1" className="text-sm">0-5 years</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="exp2" />
                        <label htmlFor="exp2" className="text-sm">5-10 years</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="exp3" />
                        <label htmlFor="exp3" className="text-sm">10+ years</label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Consultation Fee</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="fee1" />
                        <label htmlFor="fee1" className="text-sm">Under ৳2,000</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="fee2" />
                        <label htmlFor="fee2" className="text-sm">৳2,000 - ৳3,000</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="fee3" />
                        <label htmlFor="fee3" className="text-sm">Above ৳3,000</label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="rating1" />
                        <label htmlFor="rating1" className="text-sm">4.5+ stars</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="rating2" />
                        <label htmlFor="rating2" className="text-sm">4.0+ stars</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="rating3" />
                        <label htmlFor="rating3" className="text-sm">3.5+ stars</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 sm:justify-between">
        <p className="text-sm sm:text-base text-muted-foreground">
          {loading ? 'Loading lawyers…' : error ? `Error: ${error}` : `Showing ${filteredLawyers.length} lawyers`}
        </p>
        <Select defaultValue="rating">
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="experience">Most Experienced</SelectItem>
            <SelectItem value="fee-low">Lowest Fee</SelectItem>
            <SelectItem value="fee-high">Highest Fee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {filteredLawyers.map((lawyer) => (
          <Card key={lawyer.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="lg:col-span-2 order-1">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-base sm:text-lg">
                      {lawyer.avatar || (lawyer.name ? lawyer.name.split(' ').map(p=>p[0]).slice(0,2).join('') : 'L')}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-medium">{lawyer.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{lawyer.experience} years experience</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                        {(lawyer.specialties || []).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-xs sm:text-sm order-3 lg:order-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{lawyer.courtOfPractice || lawyer.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{lawyer.vHour || 'Consultation fee N/A'}</span>
                  </div>
                  {lawyer.availabilityDetails && (
                    <div className="text-green-600">{lawyer.availabilityDetails}</div>
                  )}
                </div>
                <div className="flex flex-col gap-2 order-2 lg:order-3">
                  {userType === 'anonymous' ? (
                    <>
                      <Button variant="outline" className="w-full text-sm" onClick={() => onViewProfile && onViewProfile(lawyer)}>View Profile</Button>
                      <p className="text-[10px] sm:text-xs text-muted-foreground text-center">Login to book consultation</p>
                    </>
                  ) : userType === 'lawyer' ? (
                    <Button variant="outline" className="w-full text-sm" onClick={() => onViewProfile && onViewProfile(lawyer)}>
                      View Profile
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <>
                      <Button className="w-full text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Consultation
                      </Button>
                      <Button variant="outline" className="w-full text-sm" onClick={() => onViewProfile && onViewProfile(lawyer)}>
                        View Profile
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="ghost" className="flex-1">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && !error && (
        <div className="text-center mt-8">
          <Button variant="outline" className="w-full sm:w-auto">Load More Lawyers</Button>
        </div>
      )}
    </div>
  )
}
