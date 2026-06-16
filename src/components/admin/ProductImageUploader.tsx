import { useCallback, useRef, useState } from 'react'
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud,
  Crop as CropIcon,
  X,
  Loader2,
  ImageIcon,
  RotateCcw,
  MousePointer2,
} from 'lucide-react'
import {
  PRODUCT_CARD_ASPECT,
  getCroppedBlob,
  readFileAsDataUrl,
  scaleCropToNatural,
  uploadProductImage,
  validateImageFile,
  type PixelCrop as ImagePixelCrop,
} from '../../utils/productImageUpload'

interface ProductImageUploaderProps {
  productId: string
  value: string
  onChange: (url: string) => void
}

function defaultCrop(displayWidth: number, displayHeight: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, PRODUCT_CARD_ASPECT, displayWidth, displayHeight),
    displayWidth,
    displayHeight
  )
}

export function ProductImageUploader({ productId, value, onChange }: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const previewTimerRef = useRef<number>()
  const previewUrlRef = useRef<string | null>(null)

  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const openCropModal = useCallback((src: string) => {
    setCrop(undefined)
    setCompletedCrop(undefined)
    setPreviewUrl(null)
    setError('')
    setCropSrc(src)
  }, [])

  const openFileDialog = () => inputRef.current?.click()

  const handleFiles = useCallback(
    async (files: FileList | null) => {
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
        openCropModal(dataUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not read the image.')
      }
    },
    [openCropModal]
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    void handleFiles(e.dataTransfer.files)
  }

  const naturalCrop = useCallback((): ImagePixelCrop | null => {
    const img = imgRef.current
    if (!img || !completedCrop?.width || !completedCrop?.height) return null
    return scaleCropToNatural(
      completedCrop,
      img.width,
      img.height,
      img.naturalWidth,
      img.naturalHeight
    )
  }, [completedCrop])

  const updateLivePreview = useCallback(async () => {
    const pixels = naturalCrop()
    if (!cropSrc || !pixels) return
    try {
      const blob = await getCroppedBlob(cropSrc, pixels)
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
      const url = URL.createObjectURL(blob)
      previewUrlRef.current = url
      setPreviewUrl(url)
    } catch {
      /* preview optional */
    }
  }, [cropSrc, naturalCrop])

  const schedulePreview = useCallback(() => {
    window.clearTimeout(previewTimerRef.current)
    previewTimerRef.current = window.setTimeout(() => {
      void updateLivePreview()
    }, 100)
  }, [updateLivePreview])

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(defaultCrop(width, height))
  }

  const resetCropBox = () => {
    const img = imgRef.current
    if (!img) return
    setCrop(defaultCrop(img.width, img.height))
  }

  const closeCropModal = () => {
    if (uploading) return
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setPreviewUrl(null)
    setCropSrc(null)
    setCrop(undefined)
    setCompletedCrop(undefined)
  }

  const applyCrop = async () => {
    const pixels = naturalCrop()
    if (!cropSrc || !pixels) return
    setUploading(true)
    setError('')
    try {
      const blob = await getCroppedBlob(cropSrc, pixels)
      const { url, error: uploadError } = await uploadProductImage(blob, productId)
      if (uploadError || !url) {
        setError(uploadError ?? 'Upload failed.')
        return
      }
      onChange(url)
      closeCropModal()
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
        onChange={(e) => {
          void handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

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
            ? 'border-brand bg-brand/10'
            : 'border-white/15 bg-white/[0.03] hover:border-brand/40 hover:bg-white/[0.05]'
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
                <UploadCloud className="h-4 w-4 text-brand-bright" />
                Drop a new image or click to replace
              </p>
              <p className="mt-0.5 truncate text-xs text-white/40">{value}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
              <ImageIcon className="h-5 w-5 text-brand-bright" />
            </div>
            <p className="text-sm font-medium text-white">
              Drag &amp; drop an image here, or click to browse
            </p>
            <p className="text-xs text-white/40">PNG, JPG, or WEBP · up to 8MB · crop with mouse next</p>
          </>
        )}
      </div>

      {value && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            openCropModal(value)
          }}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-brand/40 bg-brand/15 px-3 py-2 text-sm font-medium text-brand-bright transition-colors hover:bg-brand/25"
        >
          <MousePointer2 className="h-4 w-4" />
          Edit / crop image with mouse
        </button>
      )}

      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}

      <AnimatePresence>
        {cropSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-4"
            onClick={closeCropModal}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
                <div>
                  <h4 className="flex items-center gap-2 font-display text-base font-semibold text-white">
                    <CropIcon className="h-4 w-4 text-brand-bright" />
                    Crop product image
                  </h4>
                  <p className="mt-0.5 text-xs text-white/45">
                    Drag corners or edges · drag inside to move the box
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCropModal}
                  disabled={uploading}
                  className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 p-4 sm:grid-cols-[1fr_minmax(0,140px)] sm:p-5">
                <div className="product-cropper max-h-[min(50vh,420px)] scroll-y rounded-xl bg-midnight-950">
                  <ReactCrop
                    crop={crop}
                    onChange={(pixelCrop, percentCrop) => {
                      setCrop(percentCrop)
                      setCompletedCrop(pixelCrop)
                      schedulePreview()
                    }}
                    aspect={PRODUCT_CARD_ASPECT}
                    className="product-cropper__react-crop"
                  >
                    <img
                      ref={imgRef}
                      src={cropSrc}
                      alt="Crop source"
                      onLoad={onImageLoad}
                      className="block max-h-[min(50vh,420px)] w-full object-contain"
                    />
                  </ReactCrop>
                </div>

                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                    Card preview
                  </p>
                  <div className="aspect-[16/10] overflow-hidden rounded-lg border border-white/15 bg-midnight-950">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Crop preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-xs text-white/30">
                        Drag crop handles to preview
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] leading-relaxed text-white/35">
                    Cyan box = crop area (16:10). Resize any side with the mouse.
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-white/10 px-4 py-4 sm:px-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <button
                    type="button"
                    onClick={resetCropBox}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white/75 hover:bg-white/10 disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset crop box
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={closeCropModal}
                      disabled={uploading}
                      className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={applyCrop}
                      disabled={uploading || !completedCrop?.width}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-50"
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
