import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Eye, Leaf } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useLikeProject } from '@/hooks/useLikeProject'
import { Database } from '@/types/database'

type Project = Database['public']['Tables']['projects']['Row'] & {
  users: {
    full_name: string | null
    email: string
  }
}

interface ProjectCardProps {
  project: Project
}

function ProjectCard({ project }: ProjectCardProps) {
  const { isLiked, likesCount, toggleLike, loading } = useLikeProject(
    project.id, 
    project.likes_count || 0
  )

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking the heart
    e.stopPropagation()
    toggleLike()
  }

  const getCreatorName = () => {
    if (project.users?.full_name) {
      return project.users.full_name
    }
    // Extract first part of email as fallback
    const emailName = project.users?.email?.split('@')[0] || 'Anonymous'
    return emailName.charAt(0).toUpperCase() + emailName.slice(1)
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/project/${project.id}`}>
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          {project.cover_image_url ? (
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
              <Eye className="w-12 h-12 text-emerald-400" />
            </div>
          )}
          
          {project.difficulty && (
            <Badge
              className="absolute top-3 left-3"
              variant={
                project.difficulty === 'Beginner'
                  ? 'default'
                  : project.difficulty === 'Intermediate'
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {project.difficulty}
            </Badge>
          )}

          {project.environmental_score && (
            <Badge
              className="absolute top-3 right-12 bg-emerald-100 text-emerald-800 border-emerald-200"
              variant="outline"
            >
              <Leaf className="w-3 h-3 mr-1" />
              {project.environmental_score}
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLikeClick}
            disabled={loading}
            className={`absolute bottom-3 right-3 p-2 rounded-full transition-all duration-200 ${
              isLiked 
                ? 'bg-red-50 hover:bg-red-100 text-red-600' 
                : 'bg-white/80 hover:bg-white text-gray-600 hover:text-red-600'
            }`}
          >
            <Heart 
              className={`w-4 h-4 transition-all duration-200 ${
                isLiked ? 'fill-current' : ''
              }`} 
            />
          </Button>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-emerald-600 transition-colors">
            {project.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {project.style && (
                <Badge variant="outline" className="text-xs">
                  {project.style}
                </Badge>
              )}
              {project.room && (
                <Badge variant="outline" className="text-xs">
                  {project.room}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-1 text-gray-500">
              <Heart className={`w-4 h-4 ${isLiked ? 'text-red-600' : ''}`} />
              <span className="text-sm">{likesCount}</span>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-500">
            by {getCreatorName()}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

export function CommunityFeed() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          users (
            full_name,
            email
          )
        `)
        .eq('public', true)
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-white w-full">
        <div className="w-full px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Inspired by Our Community
            </h2>
            <p className="text-xl text-gray-600">
              Discover amazing transformations from our community of upcycling enthusiasts
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (projects.length === 0) {
    return (
      <section className="py-16 bg-white w-full">
        <div className="w-full px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Inspired by Our Community
            </h2>
            <p className="text-xl text-gray-600">
              Discover amazing transformations from our community of upcycling enthusiasts
            </p>
          </div>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Eye className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600">Be the first to share your upcycling project with the community!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white w-full">
      <div className="w-full px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get Inspired by Our Community
          </h2>
          <p className="text-xl text-gray-600">
            Discover amazing transformations from our community of upcycling enthusiasts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/explore"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors font-medium"
          >
            Explore All Projects
            <Eye className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}