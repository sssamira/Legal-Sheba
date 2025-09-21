import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx'
import { Button } from './ui/button.jsx'
import { getInfoHubById } from '../lib/api.js'

export default function InfoHubDetail({ postId, onBack }) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!postId) return
    let ignore = false
    async function load() {
      try {
        setLoading(true)
        setError('')
        const data = await getInfoHubById(postId)
        if (!ignore) setPost(data)
      } catch (e) {
        if (!ignore) setError(e.message || 'Failed to load article')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [postId])

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Button variant="outline" onClick={onBack}>Back to Legal Hub</Button>
        </div>
        {loading && <div className="text-muted-foreground">Loading…</div>}
        {error && <div className="text-destructive text-sm mb-3">{error}</div>}
        {post && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">{post.title}</CardTitle>
              <div className="text-[11px] sm:text-xs text-muted-foreground">
                <span className="capitalize">{post.category || 'general'}</span> • <span>{post.date}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none text-sm sm:text-base whitespace-pre-wrap">{post.content}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
