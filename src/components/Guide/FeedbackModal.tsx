import { useState, useRef } from 'react'
import { X, Upload, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Database } from '@/types/database'
import { toast } from 'sonner'

type Project = Database['public']['Tables']['projects']['Row']

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  onFeedbackSubmitted?: () => void
}

export function FeedbackModal({ isOpen, onClose, project, onFeedbackSubmitted }: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/completed/${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('furniture-photos')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('furniture-photos')
        .getPublicUrl(data.path)

      setUploadedImage(publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    setSubmitting(true)
    try {
      // Insert feedback into database
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          project_id: project.id,
          rating,
          feedback_text: feedback.trim() || null,
          completed_image_url: uploadedImage,
        })

      if (error) throw error

      toast.success('Thank you for your feedback!')
      
      // Reset form
      setRating(0)
      setFeedback('')
      setUploadedImage(null)
      
      // Notify parent component
      onFeedbackSubmitted?.()
      
      onClose()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            How did your build turn out?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload your finished piece
            </label>
            
            {uploadedImage ? (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Completed project"
                  className="w-full h-48 object-cover rounded-lg border-2 border-dashed border-emerald-300"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="border-white bg-white absolute top-2 right-2 bg-white hover:bg-white border-none hover:border-none"
                  onClick={() => setUploadedImage(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-emerald-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 transition-colors"
              >
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-emerald-600 mb-2" />
                    <span className="text-emerald-600 font-medium">Click to upload your photo</span>
                  </>
                )}
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate your experience
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 transition-colors bg-transparent hover:bg-transparent border-transparent hover:border-transparent ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tell us about your experience (optional)
            </label>
            <Textarea
              placeholder="What went well? What could be improved? Any tips for other makers?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}