import { useState, useEffect } from 'react'
import { Star, User, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Feedback = Database['public']['Tables']['feedback']['Row'] & {
  users: {
    full_name: string | null
    avatar_url: string | null
    email: string
  }
}

interface FeedbackCommentsProps {
  projectId: string
}

export function FeedbackComments({ projectId }: FeedbackCommentsProps) {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeedback()
  }, [projectId])

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          users (
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFeedback(data || [])
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email[0].toUpperCase()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Community Feedback</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-16 bg-gray-200 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (feedback.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <Star className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
        <p className="text-gray-600">Be the first to share your experience with this project!</p>
      </div>
    )
  }

  const averageRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Community Feedback</h3>
        <div className="flex items-center space-x-2">
          {renderStars(Math.round(averageRating))}
          <span className="text-sm text-gray-600">
            {averageRating.toFixed(1)} ({feedback.length} review{feedback.length !== 1 ? 's' : ''})
          </span>
        </div>
      </div>

      {/* Feedback list */}
      <div className="space-y-4">
        {feedback.map((item) => (
          <Card key={item.id} className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={item.users.avatar_url || undefined} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {getInitials(item.users.full_name, item.users.email)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {item.users.full_name || 'Anonymous'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Completed
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    {renderStars(item.rating)}
                    <span className="text-sm text-gray-600">
                      {item.rating}/5 stars
                    </span>
                  </div>

                  {item.feedback_text && (
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {item.feedback_text}
                    </p>
                  )}

                  {item.completed_image_url && (
                    <div className="mt-3">
                      <img
                        src={item.completed_image_url}
                        alt="Completed project"
                        className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}