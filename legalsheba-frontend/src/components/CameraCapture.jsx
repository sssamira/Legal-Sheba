import React, { useEffect, useRef, useState } from 'react'

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let stream
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (e) {
        setError('Unable to access camera')
      }
    }
    start()
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const capture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    onCapture?.(dataUrl)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Camera</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">Close</button>
        </div>
        <div className="p-4">
          {error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : (
            <video ref={videoRef} className="w-full rounded-lg bg-black" />
          )}
          <canvas ref={canvasRef} className="hidden" />
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={capture} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Capture</button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
