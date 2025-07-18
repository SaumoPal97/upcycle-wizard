import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Heart, Eye, ArrowLeft, Leaf } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useLikeProject } from '@/hooks/useLikeProject'
import { useAuth } from '@/contexts/AuthContext'
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
  const { user } = useAuth()
  const { isLiked, likesCount, toggleLike, loading } = useLikeProject(
    project.id, 
    project.likes_count || 0
  )

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking the heart
    e.stopPropagation()
    
    if (!user) {
      // Redirect to auth page if not logged in
      window.location.href = '/auth'
      return
    }
    
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
              className="absolute top-3 left-24 bg-emerald-100 text-emerald-800 border-emerald-200"
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
            title={user ? (isLiked ? 'Remove from favorites' : 'Add to favorites') : 'Sign in to like projects'}
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
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [user])

  async function fetchProjects() {
    try {
      setError(null)
      
      // For unauthenticated users, we need to use the anon key and ensure we only get public projects
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

      if (error) {
        console.error('Error fetching projects:', error)
        // If there's an auth error, still try to show what we can
        if (error.code === 'PGRST301' || error.message.includes('JWT')) {
          // Try a simpler query without user data for unauthenticated users
          const { data: simpleData, error: simpleError } = await supabase
            .from('projects')
            .select('*')
            .eq('public', true)
            .order('created_at', { ascending: false })
          
          if (simpleError) {
            throw simpleError
          }
          
          // Map the data to include empty user info
          const projectsWithEmptyUsers = (simpleData || []).map(project => ({
            ...project,
            users: {
              full_name: null,
              email: 'anonymous@example.com'
            }
          }))
          
          setProjects(projectsWithEmptyUsers)
        } else {
          throw error
        }
      } else {
        setProjects(data || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError('Failed to load projects. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project =>
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

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search projects or creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
          </p>
          {!user && (
            <p className="text-sm text-emerald-600">
              <Link to="/auth" className="hover:underline">Sign in</Link> to like projects and create your own!
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <Button 
              onClick={fetchProjects} 
              variant="outline" 
              size="sm" 
              className="mt-2 text-red-600 border-red-300 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        )}

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

        {filteredProjects.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Try adjusting your search criteria or be the first to share a project!' 
                : 'No public projects available yet. Be the first to share your upcycling project!'
              }
            </p>
            {user && (
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link to="/quiz">Create Your First Project</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}