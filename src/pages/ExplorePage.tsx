import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Heart, Eye, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
          
          <div className="flex items-center justify-between mb-3">
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
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>by {getCreatorName()}</span>
            <div className="flex items-center space-x-1">
              <Heart className={`w-4 h-4 ${isLiked ? 'text-red-600' : ''}`} />
              <span>{likesCount}</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

export function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // Sample projects for demo with creator info
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
      environmental_score: null,
      users: {
        full_name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com'
      }
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
      environmental_score: null,
      users: {
        full_name: 'Mike Rodriguez',
        email: 'mike.rodriguez@example.com'
      }
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
      environmental_score: null,
      users: {
        full_name: 'Emma Chen',
        email: 'emma.chen@example.com'
      }
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
      environmental_score: null,
      users: {
        full_name: 'Alex Thompson',
        email: 'alex.thompson@example.com'
      }
    },
    {
      id: '5',
      title: 'Rustic Dining Table',
      style: 'Rustic',
      room: 'Dining Room',
      likes_count: 201,
      difficulty: 'Advanced',
      cover_image_url: 'https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg',
      user_id: '5',
      quiz_data: {},
      guide_json: {},
      public: true,
      created_at: '2024-01-11T10:00:00Z',
      estimated_time: null,
      budget: null,
      environmental_score: null,
      users: {
        full_name: 'David Kim',
        email: 'david.kim@example.com'
      }
    },
    {
      id: '6',
      title: 'Scandinavian Nightstand',
      style: 'Scandinavian',
      room: 'Bedroom',
      likes_count: 95,
      difficulty: 'Intermediate',
      cover_image_url: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      user_id: '6',
      quiz_data: {},
      guide_json: {},
      public: true,
      created_at: '2024-01-10T10:00:00Z',
      estimated_time: null,
      budget: null,
      environmental_score: null,
      users: {
        full_name: 'Lisa Anderson',
        email: 'lisa.anderson@example.com'
      }
    }
  ]

  const displayProjects = projects.length > 0 ? projects : sampleProjects
  const filteredProjects = displayProjects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.style?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.room?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="flex items-center space-x-2 text-emerald-600">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Link>
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Explore Projects</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search projects or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}