// Google GenAI-backed analyzer with JSON schema output.
// Note: For browser apps, store API key in Vite env as VITE_GOOGLE_API_KEY.
// Install dependency: npm i @google/genai

// eslint-disable-next-line import/no-unresolved
import { GoogleGenAI, Type } from '@google/genai'

// Schema for structured JSON response
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description:
        "A concise, neutral summary of the legal document's main purpose and key terms. Should be 3-5 sentences long.",
    },
    suggestions: {
      type: Type.ARRAY,
      description:
        'Actionable suggestions or points of interest for the user to consider. Focus on important clauses they should review carefully.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description:
              "A short, descriptive title for the suggestion (e.g., 'Review Liability Clause').",
          },
          details: {
            type: Type.STRING,
            description:
              'A clear, detailed explanation of why this point is important and what the user should consider.',
          },
        },
        required: ['title', 'details'],
      },
    },
    warnings: {
      type: Type.ARRAY,
      description:
        "A list of potential 'red flags' or sketchy clauses. These should be parts of the document that are ambiguous, one-sided, or potentially disadvantageous to one party.",
      items: {
        type: Type.OBJECT,
        properties: {
          clause: {
            type: Type.STRING,
            description:
              'The exact (or slightly paraphrased for brevity) problematic clause from the document.',
          },
          reason: {
            type: Type.STRING,
            description:
              "A clear explanation of why this clause is a potential issue or 'red flag'.",
          },
        },
        required: ['clause', 'reason'],
      },
    },
  },
  required: ['summary', 'suggestions', 'warnings'],
}

/**
 * @typedef {{ data: string, mimeType: string }} ImageInput
 */

function buildParts(content) {
  const parts = []
  if (typeof content === 'string') {
    if (!content.trim()) throw new Error('Document text cannot be empty.')
    parts.push({ text: content })
  } else {
    parts.push({
      inlineData: {
        mimeType: content.mimeType,
        data: content.data,
      },
    })
    parts.push({
      text:
        'This image contains a legal document. First, perform OCR to extract all text from the document. Then, analyze the extracted text to provide a summary, suggestions, and warnings as per the instructions.',
    })
  }
  return parts
}

function getApiKey() {
  // Order of precedence:
  // 1) Vite env at build/dev start
  // 2) Runtime global (window.VITE_GOOGLE_API_KEY or window.__VITE_GOOGLE_API_KEY)
  // 3) Runtime localStorage item 'VITE_GOOGLE_API_KEY'
  // Avoid optional chaining on import.meta for maximum compatibility with some tooling
  let key = (import.meta.env?.VITE_GOOGLE_API_KEY) || ''
  if (!key && typeof window !== 'undefined') {
    key = window.VITE_GOOGLE_API_KEY || window.__VITE_GOOGLE_API_KEY || ''
  }
  if (!key && typeof localStorage !== 'undefined') {
    try {
      key = localStorage.getItem('VITE_GOOGLE_API_KEY') || ''
    } catch (_) {
      // ignore storage access issues
    }
  }
  return (key || '').trim()
}

function getClient() {
  const apiKey = getApiKey()
  if (!apiKey) return null
  try {
    return new GoogleGenAI({ apiKey })
  } catch (e) {
    return null
  }
}

/**
 * @param {string | ImageInput} content
 * @returns {Promise<any>} AnalysisResult-like object
 */
export async function analyzeDocument(content) {
  const ai = getClient()
  if (!ai) {
    throw new Error(
      'Missing VITE_GOOGLE_API_KEY. Set it in .env and restart the dev server, or set it at runtime via localStorage: localStorage.setItem("VITE_GOOGLE_API_KEY", "<your-key>") and reload.'
    )
  }

  const systemInstruction = `You are an expert AI legal assistant. Your task is to analyze a legal document provided by a user.
Do not provide legal advice. Instead, your goal is to help the user understand the document better by breaking it down.
Perform the following three actions based on the document text:
1.  **Summarize:** Create a neutral, high-level summary of the document's purpose.
2.  **Suggest:** Identify key clauses or sections that the user should pay close attention to. These are not necessarily bad, but are important.
3.  **Warn:** Pinpoint any clauses that seem ambiguous, overly broad, one-sided, or generally 'sketchy'. These are potential red flags.
Provide your analysis in the specified JSON format.`

  const parts = buildParts(content)

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.2,
      },
    })
    const text = (response?.text || '').trim()
    const cleaned = text.replace(/^```json\s*|```$/g, '')
    const result = JSON.parse(cleaned)
    return result
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error analyzing document:', error)
    if (error && error.message) {
      throw new Error(`Failed to analyze document: ${error.message}`)
    }
    throw new Error('An unknown error occurred during analysis.')
  }
}

// Allow setting the key at runtime without reload (stored in both window and localStorage)
export function setApiKeyAtRuntime(key) {
  const val = String(key || '').trim()
  if (!val) return
  if (typeof window !== 'undefined') {
    try {
      window.VITE_GOOGLE_API_KEY = val
      window.__VITE_GOOGLE_API_KEY = val
    } catch (_) {
      // ignore
    }
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('VITE_GOOGLE_API_KEY', val)
    }
  } catch (_) {
    // ignore
  }
}

export default { analyzeDocument, setApiKeyAtRuntime }
