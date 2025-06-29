import { useState, useRef } from 'react'
import { Upload, X, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface PhotoUploadStepProps {
  photos: string[]
  onUpdate: (photos: string[]) => void
}

export function PhotoUploadStep({ photos, onUpdate }: PhotoUploadStepProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !user) return

    setUploading(true)
    const newPhotos: string[] = []

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        continue
      }

      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { data, error } = await supabase.storage
          .from('furniture-photos')
          .upload(fileName, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('furniture-photos')
          .getPublicUrl(data.path)

        newPhotos.push(publicUrl)
      } catch (error) {
        console.error('Upload error:', error)
        alert('Failed to upload photo')
      }
    }

    onUpdate([...photos, ...newPhotos].slice(0, 5))
    setUploading(false)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onUpdate(newPhotos)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Upload Photos of Your Furniture
        </h2>
        <p className="text-lg text-gray-600">
          Add 2-5 clear photos from different angles. Natural lighting works best!
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {photos.map((photo, index) => (
          <Card key={index} className="relative group">
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <img
                  src={photo}
                  alt={`Furniture photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0"
                  onClick={() => removePhoto(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {photos.length < 5 && (
          <Card 
            className="border-2 border-dashed border-gray-300 hover:border-emerald-400 cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="p-0">
              <div className="aspect-square flex flex-col items-center justify-center text-gray-500 hover:text-emerald-600 transition-colors">
                {uploading ? (
                  <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Add Photo</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="bg-emerald-50 rounded-lg p-4 flex items-start space-x-3">
        <Camera className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-emerald-800">
          <strong>Tips for great photos:</strong> Use natural lighting, capture multiple angles, 
          show any damage or wear clearly, and ensure the furniture is the main focus.
        </div>
      </div>

      {photos.length < 2 && (
        <div className="mt-4 text-center text-red-600 text-sm">
          Please upload at least 2 photos to continue
        </div>
      )}
    </div>
  )
}