import React from 'react'

export default function AnalysisResult({ result }) {
  const [openSummary, setOpenSummary] = React.useState(true)
  const [openSuggestions, setOpenSuggestions] = React.useState(false)
  const [openWarnings, setOpenWarnings] = React.useState(false)
  if (!result) return null

  const suggestions = Array.isArray(result.suggestions) ? result.suggestions : []
  const warnings = Array.isArray(result.warnings) ? result.warnings : []
  const suggestionsCount = suggestions.length
  const warningsCount = warnings.length

  // Helper: split content into detail rows (avoid clipping by listing items)
  const splitDetails = (text = '') => {
    if (!text) return []
    const byNewline = text.split(/\r?\n+/).map((s) => s.trim()).filter(Boolean)
    if (byNewline.length > 1) return byNewline
    // Try bullet-like separators
    const byBullets = text.split(/\s*[•\-–]\s+/).map((s) => s.trim()).filter(Boolean)
    if (byBullets.length > 1) return byBullets
    // Fallback: sentence split
    const bySentence = text.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map((s) => s.trim()).filter(Boolean)
    return bySentence.length ? bySentence : [text]
  }

  // Icons
  const ChevronIcon = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"></polyline></svg>
  )
  const FileDocIcon = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <line x1="10" y1="9" x2="8" y2="9"></line>
    </svg>
  )
  const CheckCircleIcon = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  )
  const WarningTriangleIcon = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  )

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* Document Summary */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200">
        <button
          className="w-full p-6 text-left flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xl"
          aria-expanded={openSummary}
          aria-controls="section-Document-Summary"
          onClick={() => setOpenSummary((v) => !v)}
        >
          <div className="flex items-center">
            <FileDocIcon className="text-brand-primary" />
            <h3 className="ml-3 text-xl font-semibold text-gray-800">Document Summary</h3>
          </div>
          <div className="flex items-center">
            <ChevronIcon className={`w-6 h-6 text-gray-500 transition-transform duration-300 transform ${openSummary ? 'rotate-180' : ''}`} />
          </div>
        </button>
        {openSummary && (
          <div id="section-Document-Summary" className="p-6 pt-0 animate-fade-in-down" role="region">
            <div className="space-y-4 border-t border-gray-200 pt-4 mt-2">
              <p className="text-gray-600 leading-relaxed">{result.summary}</p>
            </div>
          </div>
        )}
      </div>

      {/* Key Suggestions */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200">
        <button
          className="w-full p-6 text-left flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xl"
          aria-expanded={openSuggestions}
          aria-controls="section-Key-Suggestions"
          onClick={() => setOpenSuggestions((v) => !v)}
        >
          <div className="flex items-center">
            <CheckCircleIcon className="text-green-600" />
            <h3 className="ml-3 text-xl font-semibold text-gray-800">Key Suggestions</h3>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-4 transition-opacity duration-300">{suggestionsCount} suggestion(s) found</span>
            <ChevronIcon className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${openSuggestions ? 'transform rotate-180' : ''}`} />
          </div>
        </button>
        {openSuggestions && (
          <div id="section-Key-Suggestions" className="p-6 pt-0" role="region">
            <div className="space-y-4 border-t border-gray-200 pt-4 mt-2">
              {suggestions.length > 0 ? (
                suggestions.map((s, i) => (
                  <div key={i} className="">
                    <div className="text-gray-900 font-semibold">{s.title}</div>
                    <div className="mt-2 space-y-2">
                      {splitDetails(s.details).map((d, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-md border border-green-200 bg-green-50 hover:bg-green-100/80 transition-colors"
                        >
                          <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                          <div className="text-sm text-gray-800 whitespace-pre-wrap">{d}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No suggestions found.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Potential Warnings */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200">
        <button
          className="w-full p-6 text-left flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-xl"
          aria-expanded={openWarnings}
          aria-controls="section-Potential-Warnings"
          onClick={() => setOpenWarnings((v) => !v)}
        >
          <div className="flex items-center">
            <WarningTriangleIcon className="text-red-600" />
            <h3 className="ml-3 text-xl font-semibold text-gray-800">Potential Warnings</h3>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-4 transition-opacity duration-300">{warningsCount} warning(s) found</span>
            <ChevronIcon className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${openWarnings ? 'transform rotate-180' : ''}`} />
          </div>
        </button>
        {openWarnings && (
          <div id="section-Potential-Warnings" className="p-6 pt-0" role="region">
            <div className="space-y-4 border-t border-gray-200 pt-4 mt-2">
              {warnings.length > 0 ? (
                warnings.map((w, i) => (
                  <div key={i} className="">
                    <div className="text-red-800 font-semibold">{w.clause}</div>
                    <div className="mt-2 space-y-2">
                      {splitDetails(w.reason).map((d, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-md border border-red-200 bg-red-50 hover:bg-red-100/80 transition-colors"
                        >
                          <WarningTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                          <div className="text-sm text-gray-900 whitespace-pre-wrap">{d}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No warnings detected.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
