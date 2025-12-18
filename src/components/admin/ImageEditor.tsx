'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { X, Check, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'

interface ImageEditorProps {
  imageSrc: string
  onSave: (croppedImageBlob: Blob) => void
  onCancel: () => void
  aspectRatio?: number
  minWidth?: number
  minHeight?: number
}

interface Area {
  x: number
  y: number
  width: number
  height: number
}

export default function ImageEditor({
  imageSrc,
  onSave,
  onCancel,
  aspectRatio = 1,
  minWidth = 200,
  minHeight = 200,
}: ImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    canvas.width = safeArea
    canvas.height = safeArea

    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-safeArea / 2, -safeArea / 2)

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    )

    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'))
          return
        }
        resolve(blob)
      }, 'image/jpeg', 0.9)
    })
  }

  const handleSave = async () => {
    if (!croppedAreaPixels) return

    setProcessing(true)
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      onSave(croppedImage)
    } catch (error) {
      console.error('Error cropping image:', error)
      alert('Failed to process image')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Image</h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper */}
        <div className="relative flex-1 bg-gray-900" style={{ minHeight: '400px' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            cropShape="rect"
            showGrid={true}
          />
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-gray-200 space-y-4">
          {/* Zoom Control */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Zoom: {Math.round(zoom * 100)}%
            </label>
            <div className="flex items-center gap-2">
              <ZoomOut className="w-4 h-4 text-gray-600" />
              <input
                type="range"
                min={0.1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1"
              />
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </div>
          </div>

          {/* Rotation Control */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Rotation: {rotation}°
            </label>
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-gray-600" />
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={processing || !croppedAreaPixels}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

