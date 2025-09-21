import React, { useEffect, useState } from 'react'
import { Button } from './ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx'
import { Input } from './ui/input.jsx'
import { Tabs, TabsContent } from './ui/tabs.jsx'
import { Search, BookOpen, Home, Heart, Briefcase, Shield, Users, Building, Bookmark, Share, Clock, FileText } from 'lucide-react'
import { listInfoHub } from '../lib/api.js'

export default function LegalHub({ onOpenPost }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [hasMore, setHasMore] = useState(true)

  const categories = [
    { id: 'all', name: 'All Categories', icon: BookOpen },
    { id: 'property', name: 'Property Law', icon: Home },
    { id: 'family', name: 'Family Law', icon: Heart },
    { id: 'business', name: 'Business Law', icon: Briefcase },
    { id: 'criminal', name: 'Criminal Law', icon: Shield },
    { id: 'civil', name: 'Civil Rights', icon: Users },
    { id: 'labor', name: 'Labor Law', icon: Building },
  ]

  const faqs = [
    { id: 1, category: 'property', question: 'What documents do I need to buy property in Bangladesh?', answer: 'You need original deed, updated land records, mutation certificate, and more. A property lawyer should verify all documents.', popularity: 95 },
    { id: 2, category: 'family', question: 'What are the grounds for divorce in Bangladesh?', answer: 'Grounds include adultery, cruelty, desertion, conversion, mental illness, etc. Process differs by personal law.', popularity: 88 },
  ]
  // Load InfoHub posts from backend
  useEffect(() => {
    refresh(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  async function refresh(p = 0) {
    try {
      setLoading(true)
      setError('')
      const category = selectedCategory === 'all' ? '' : selectedCategory
      const res = await listInfoHub({ category, page: p, size })
      const content = Array.isArray(res?.content) ? res.content : []
      setPosts(p === 0 ? content : [...posts, ...content])
      const totalPages = Number(res?.totalPages ?? 0)
      setHasMore(p + 1 < totalPages)
      setPage(p)
    } catch (e) {
      setError(e.message || 'Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  const filteredFaqs = faqs.filter((f) => (selectedCategory === 'all' || f.category === selectedCategory) && (f.question.toLowerCase().includes(searchTerm.toLowerCase()) || f.answer.toLowerCase().includes(searchTerm.toLowerCase())))
  const filteredPosts = posts.filter((g) => (
    (selectedCategory === 'all' || (g.category || '').toLowerCase() === selectedCategory) &&
    ((g.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (g.content || '').toLowerCase().includes(searchTerm.toLowerCase()))
  ))

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl mb-3 sm:mb-4">Legal Information Hub</h1>
          <p className="text-base sm:text-xl text-muted-foreground">Free access to legal information, guides, and FAQs</p>
        </div>

        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search legal information, FAQs, guides..." className="pl-10 text-sm sm:text-base" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-2 -m-1">
                {categories.map((c) => (
                  <Button key={c.id} variant={selectedCategory === c.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(c.id)} className="flex items-center gap-1 sm:gap-2 m-1 text-[11px] sm:text-xs">
                    <c.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    {c.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="guides" className="space-y-5 sm:space-y-6">
          <TabsContent value="faqs" className="space-y-3 sm:space-y-4">
            {filteredFaqs.map((faq) => (
              <Card key={faq.id}>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
            {filteredFaqs.length === 0 && <p className="text-muted-foreground">No FAQs found.</p>}
          </TabsContent>
          <TabsContent value="guides" className="space-y-3 sm:space-y-4">
            {error && <div className="text-destructive text-sm">{error}</div>}
            {loading && posts.length === 0 && <p className="text-muted-foreground">Loading articles…</p>}
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => onOpenPost && onOpenPost(post)}>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-2 flex items-center gap-2">
                    <span className="capitalize">{post.category || 'general'}</span>•<span>{post.date}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{(post.content || '').slice(0, 240)}{(post.content || '').length > 240 ? '…' : ''}</div>
                </CardContent>
              </Card>
            ))}
            {!loading && filteredPosts.length === 0 && <p className="text-muted-foreground">No articles found.</p>}
            {hasMore && (
              <div className="pt-2">
                <Button variant="outline" onClick={() => refresh(page + 1)} disabled={loading}>Load more</Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Useful Resources</CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-muted-foreground">
                <ul className="list-disc ml-5 space-y-1 sm:space-y-1.5">
                  <li>Bangladesh Supreme Court website</li>
                  <li>Ministry of Law, Justice and Parliamentary Affairs</li>
                  <li>Legal aid organizations</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
