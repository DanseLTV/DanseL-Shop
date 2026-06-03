import { useCallback, useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, Crop as CropIcon, X, Loader2, ImageIcon } from 'lucide-react'
import {
  PRODUCT_CARD_ASPECT,
  getCroppedBlob,
  readFileAsDataUrl,
  uploadProductImage,
  validateImageFile,
} from '../../utils/productImageUpload'

interface ProductImageUploaderProps {
  productId: string
  /** Current image URL shown to customers. */
  value: string
  onChange: (url: string) => void
}

export function ProductImageUploader({ productId, value, onChange }: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  // Crop modal state
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedPixels, setCroppedPixels] = useState<Area | null>(null)

  const openFileDialog = () => inputRef.current?.click()

  const handleFiles = useCallback(async (files: FileList | null) => {
    setError('')
    const file = files?.[0]
    if (!file) return
    const validation = validateImageFile(file)
    if (validation) {
      setError(validation)
      return
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedPixels(null)
      setCropSrc(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read the image.')
    }
  }, [])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    void handleFiles(e.dataTransfer.files)
  }

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedPixels(areaPixels)
  }, [])

  const applyCrop = async () => {
    if (!cropSrc || !croppedPixels) return
    setUploading(true)
    setError('')
    try {
      const blob = await getCroppedBlob(cropSrc, croppedPixels)
      const { url, error: uploadError } = await uploadProductImage(blob, productId)
      if (uploadError || !url) {
        setError(uploadError ?? 'Upload failed.')
        return
      }
      onChange(url)
      setCropSrc(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not process the image.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={openFileDialog}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openFileDialog()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragging
            ? 'border-accent-violet bg-accent-violet/10'
            : 'border-white/15 bg-white/[0.03] hover:border-accent-violet/40 hover:bg-white/[0.05]'
        }`}
      >
        {value ? (
          <div className="flex w-full items-center gap-3">
            <img
              src={value}
              alt="Current product"
              className="h-16 w-24 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
            />
            <div className="min-w-0 flex-1 text-left">
              <p className="flex items-center gap-1.5 text-sm font-medium text-white">
                <UploadCloud className="h-4 w-4 text-accent-cyan" />
                Drop a new image or click to replace
              </p>
              <p className="mt-0.5 truncate text-xs text-white/40">{value}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
              <ImageIcon className="h-5 w-5 text-accent-cyan" />
            </div>
            <p className="text-sm font-medium text-white">
              Drag &amp; drop an image here, or click to browse
            </p>
            <p className="text-xs text-white/40">PNG, JPG, or WEBP · up to 8MB · you can crop next</p>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}

      {/* Crop modal */}
      <AnimatePresence>
        {cropSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => !uploading && setCropSrc(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <h4 className="flex items-center gap-2 font-display text-base font-semibold text-white">
                  <CropIcon className="h-4 w-4 text-accent-cyan" />
                  Crop product image
                </h4>
                <button
                  type="button"
                  onClick={() => !uploading && setCropSrc(null)}
                  className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative h-72 w-full bg-midnight-950">
                <Cropper
                  image={cropSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={PRODUCT_CARD_ASPECT}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  showGrid
                />
              </div>

              <div className="space-y-4 px-5 py-4">
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-xs text-white/60">
                    <span>Zoom</span>
                    <span>{zoom.toFixed(1)}x</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-accent-violet"
                  />
                </div>
                <p className="text-xs text-white/40">
                  This is exactly how the image will fill the customer card (16:10).
                </p>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCropSrc(null)}
                    disabled={uploading}
                    className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyCrop}
                    disabled={uploading || !croppedPixels}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent-violet px-4 py-2 text-sm font-semibold text-white hover:bg-accent-violet/90 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <CropIcon className="h-4 w-4" />
                        Apply &amp; Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
