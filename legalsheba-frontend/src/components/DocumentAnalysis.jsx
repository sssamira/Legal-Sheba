import React, { useState, useCallback, useRef } from 'react'
import { analyzeDocument, setApiKeyAtRuntime } from '../services/geminiService.js'
import Loader from './Loader.jsx'
import AnalysisResult from './AnalysisResult.jsx'
import { Button } from './ui/button.jsx'

// Minimal icons (inline SVG) to keep this component self-contained
const UploadIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
)
const FileIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
)
const XCircleIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
)

// Lazy-load pdf.js from CDN if not present
async function ensurePdfJs() {
  if (typeof window !== 'undefined' && window.pdfjsLib) {
    return window.pdfjsLib
  }
  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs'
    s.type = 'module'
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  }).catch(() => {})
  // Fallback to non-module build
  if (!window.pdfjsLib) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.js'
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    }).catch(() => {})
  }
  if (window.pdfjsLib) {
    try {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs'
    } catch {}
    return window.pdfjsLib
  }
  throw new Error('Failed to load PDF.js')
}

export default function DocumentAnalysis() {
  const [documentInput, setDocumentInput] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [error, setError] = useState('')
  // Camera capture removed
  const [runtimeKey, setRuntimeKey] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setDocumentInput(null)
    setIsLoading(true)

    try {
      if (file.type === 'text/plain') {
        setLoadingMessage('Reading text file...')
        const text = await file.text()
        setDocumentInput({ type: 'text', content: text, name: file.name })
      } else if (file.type.startsWith('image/')) {
        setLoadingMessage('Processing image...')
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target?.result
          setDocumentInput({ type: 'image', dataUrl, mimeType: file.type, name: file.name })
          setIsLoading(false)
        }
        reader.readAsDataURL(file)
        return
      } else if (file.type === 'application/pdf') {
        setLoadingMessage('Extracting text from PDF...')
        try {
          const pdfjsLib = await ensurePdfJs()
          const reader = new FileReader()
          reader.onload = async (e) => {
            try {
              const data = new Uint8Array(e.target?.result)
              const pdf = await pdfjsLib.getDocument({ data }).promise
              let fullText = ''
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i)
                const textContent = await page.getTextContent()
                fullText += textContent.items.map((item) => item.str).join(' ') + '\n'
              }
              setDocumentInput({ type: 'text', content: fullText, name: file.name })
            } catch (err) {
              setError('Failed to process PDF file.')
              // eslint-disable-next-line no-console
              console.error(err)
            } finally {
              setIsLoading(false)
            }
          }
          reader.readAsArrayBuffer(file)
          return
        } catch (e) {
          setError('PDF support failed to load.')
        }
      } else {
        throw new Error(`Unsupported file type: ${file.type}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read the file.')
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  // Camera capture removed

  const handleAnalyze = useCallback(async () => {
    if (!documentInput) {
      setError('Please provide a document before analyzing.')
      return
    }
    // If we previously had a missing-key error and user provided a key, try to set it before analyzing
    if (runtimeKey && /Missing VITE_GOOGLE_API_KEY/i.test(error || '')) {
      setApiKeyAtRuntime(runtimeKey)
    }
    setIsLoading(true)
    setLoadingMessage('Analyzing your document...')
    setError('')
    setAnalysisResult(null)
    try {
      let analysisInput
      if (documentInput.type === 'text') {
        analysisInput = documentInput.content
      } else {
        const base64Data = documentInput.dataUrl.split(',')[1]
        analysisInput = { data: base64Data, mimeType: documentInput.mimeType }
      }
      const result = await analyzeDocument(analysisInput)
      setAnalysisResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.')
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }, [documentInput])

  const handleReset = () => {
    setDocumentInput(null)
    setAnalysisResult(null)
    setError('')
    setIsLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const renderInputStage = () => (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
      {documentInput ? (
        <div>
          <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 mb-6">
            {documentInput.type === 'image' ? (
              <img src={documentInput.dataUrl} alt="Document Preview" className="max-h-40 rounded-md" />
            ) : (
              <div className="text-center">
                <FileIcon className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 font-semibold text-gray-700">{documentInput.name}</p>
                {'content' in documentInput && (
                  <p className="text-sm text-gray-500">{documentInput.content.length.toLocaleString()} characters</p>
                )}
              </div>
            )}
            <button onClick={() => setDocumentInput(null)} className="ml-4 text-gray-400 hover:text-red-500" aria-label="Remove document">
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
          <Button onClick={handleAnalyze} className="w-full sm:w-auto px-8 py-3">
            Analyze Document
          </Button>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Provide Your Document</h2>
          <p className="text-gray-500 mb-6">Upload a file to begin.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition-colors">
              <UploadIcon className="w-5 h-5 mr-2" />
              Upload File
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.pdf,.png,.jpg,.jpeg" />
          </div>
          <div className="mt-4 text-sm text-gray-400">Supported: TXT, PDF, PNG, JPG, JPEG</div>
        </>
      )}
    </div>
  )

  const renderResultStage = () => (
    <>
      <AnalysisResult result={analysisResult} />
      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg" role="alert">
        <h4 className="font-bold">Disclaimer</h4>
        <p className="text-sm">This AI analysis is for informational purposes only and does not constitute legal advice. It may contain errors or omissions. Always consult with a qualified legal professional for any legal matters or before taking any action based on this analysis.</p>
      </div>
      <div className="text-center mt-8">
        <Button onClick={handleReset} className="px-6 py-2">
          Analyze Another Document
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-[60vh] bg-gray-50 font-sans text-gray-800">
      <main className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Camera capture removed */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
              <p><span className="font-bold">Error:</span> {error}</p>
              {/Missing VITE_GOOGLE_API_KEY/i.test(error) && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-700">Provide your Google API key below to continue without restarting:</p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-800"
                      placeholder="Enter API key"
                      value={runtimeKey}
                      onChange={(e) => setRuntimeKey(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        if (!runtimeKey.trim()) return
                        setApiKeyAtRuntime(runtimeKey.trim())
                        setError('')
                      }}
                    >Save</Button>
                  </div>
                  <p className="text-xs text-gray-500">We store the key in your browser's localStorage under <code>VITE_GOOGLE_API_KEY</code>.</p>
                </div>
              )}
            </div>
          )}
          {isLoading ? <Loader message={loadingMessage} /> : analysisResult ? renderResultStage() : renderInputStage()}
        </div>
      </main>
    </div>
  )
}
