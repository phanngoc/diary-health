"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Prefer back camera if available
        audio: false,
      })
      
      setStream(mediaStream)
      setIsCameraActive(true)
      setError(null)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      setError("Không thể kích hoạt camera. Vui lòng kiểm tra quyền truy cập camera.")
      console.error("Camera error:", err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsCameraActive(false)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")
    
    if (!context) return
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert canvas to data URL
    const imageDataUrl = canvas.toDataURL("image/jpeg")
    
    // Pass the image data to the parent component
    onCapture(imageDataUrl)
    
    // Stop the camera after capturing
    stopCamera()
  }

  useEffect(() => {
    // Clean up function to stop camera when component unmounts
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="flex flex-col items-center">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      
      <div className="relative w-full max-w-md aspect-video bg-black rounded-md overflow-hidden">
        {isCameraActive ? (
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <p>Nhấn nút bên dưới để kích hoạt camera</p>
          </div>
        )}
      </div>
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="mt-4 flex gap-4">
        {!isCameraActive ? (
          <Button 
            onClick={startCamera} 
            type="button" 
            className="w-full"
          >
            Bật camera
          </Button>
        ) : (
          <>
            <Button 
              onClick={captureImage} 
              type="button" 
              className="flex-1"
            >
              Chụp ảnh
            </Button>
            <Button 
              onClick={stopCamera} 
              type="button" 
              variant="outline" 
              className="flex-1"
            >
              Hủy
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
