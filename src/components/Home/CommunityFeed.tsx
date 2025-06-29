import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useLikeProject } from '@/hooks/useLikeProject'
import { Database } from '@/types/database'

type Project = Database['public']['Tables']['projects']['Row']

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

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLikeClick}
            disabled={loading}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
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
        .select('*')
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

  const sampleProjects = [
    {
      id: '1',
      title: 'Vintage Dresser Makeover',
      style: 'Bohemian',
      room: 'Bedroom',
      likes_count: 124,
      difficulty: 'Intermediate',
      cover_image_url: 'https://images.pexels.com/photos/1648377/pexels-photo-1648377.jpeg',
      user_id: '1',
      quiz_data: {},
      guide_json: {},
      public: true,
      created_at: '2024-01-15T10:00:00Z',
      estimated_time: null,
      budget: null,
      environmental_score: null
    },
    {
      id: '2',
      title: 'Industrial Coffee Table',
      style: 'Industrial',
      room: 'Living Room',
      likes_count: 89,
      difficulty: 'Advanced',
      cover_image_url: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      user_id: '2',
      quiz_data: {},
      guide_json: {},
      public: true,
      created_at: '2024-01-14T10:00:00Z',
      estimated_time: null,
      budget: null,
      environmental_score: null
    },
    {
      id: '3',
      title: 'Farmhouse Bookshelf',
      style: 'Farmhouse',
      room: 'Office',
      likes_count: 156,
      difficulty: 'Beginner',
      cover_image_url: 'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg',
      user_id: '3',
      quiz_data: {},
      guide_json: {},
      public: true,
      created_at: '2024-01-13T10:00:00Z',
      estimated_time: null,
      budget: null,
      environmental_score: null
    },
    {
      id: '4',
      title: 'Modern Plant Stand',
      style: 'Modern',
      room: 'Living Room',
      likes_count: 73,
      difficulty: 'Beginner',
      cover_image_url: 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg',
      user_id: '4',
      quiz_data: {},
      guide_json: {},
      public: true,
      created_at: '2024-01-12T10:00:00Z',
      estimated_time: null,
      budget: null,
      environmental_score: null
    }
  ]

  const displayProjects = projects.length > 0 ? projects : sampleProjects

  if (loading && projects.length === 0) {
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
          {displayProjects.map((project) => (
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