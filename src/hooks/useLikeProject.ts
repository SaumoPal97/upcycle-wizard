import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface UseLikeProjectReturn {
  isLiked: boolean
  likesCount: number
  toggleLike: () => Promise<void>
  loading: boolean
}

export function useLikeProject(projectId: string, initialLikesCount: number = 0): UseLikeProjectReturn {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && projectId) {
      checkIfLiked()
    }
  }, [user, projectId])

  const checkIfLiked = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .maybeSingle()

      if (error) {
        console.error('Error checking like status:', error)
        return
      }

      setIsLiked(!!data)
    } catch (error) {
      console.error('Error checking like status:', error)
    }
  }

  const toggleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like projects')
      return
    }

    if (loading) return

    setLoading(true)

    try {
      if (isLiked) {
        // Unlike the project
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('project_id', projectId)

        if (error) throw error

        setIsLiked(false)
        setLikesCount(prev => Math.max(0, prev - 1))
        toast.success('Removed from favorites')
      } else {
        // Like the project
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            project_id: projectId,
          })

        if (error) throw error

        setIsLiked(true)
        setLikesCount(prev => prev + 1)
        toast.success('Added to favorites')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like status')
    } finally {
      setLoading(false)
    }
  }

  return {
    isLiked,
    likesCount,
    toggleLike,
    loading,
  }
}