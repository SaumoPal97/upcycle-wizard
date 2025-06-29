import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Plus, Eye, EyeOff, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Database } from '@/types/database'
import { toast } from 'sonner'

type Project = Database['public']['Tables']['projects']['Row']

export function MyProjectsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingProjects, setUpdatingProjects] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user])

  async function fetchProjects() {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const toggleProjectPublicStatus = async (projectId: string, currentPublicStatus: boolean) => {
    if (updatingProjects.has(projectId)) return

    setUpdatingProjects(prev => new Set(prev).add(projectId))

    try {
      const { error } = await supabase
        .from('projects')
        .update({ public: !currentPublicStatus })
        .eq('id', projectId)
        .eq('user_id', user?.id) // Extra security check

      if (error) throw error

      // Update local state
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, public: !currentPublicStatus }
            : project
        )
      )

      toast.success(
        !currentPublicStatus 
          ? 'Project is now public and visible to everyone' 
          : 'Project is now private and only visible to you'
      )
    } catch (error) {
      console.error('Error updating project visibility:', error)
      toast.error('Failed to update project visibility')
    } finally {
      setUpdatingProjects(prev => {
        const newSet = new Set(prev)
        newSet.delete(projectId)
        return newSet
      })
    }
  }

  const deleteProject = async (projectId: string, projectTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`
    )

    if (!confirmed) return

    if (updatingProjects.has(projectId)) return

    setUpdatingProjects(prev => new Set(prev).add(projectId))

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user?.id) // Extra security check

      if (error) throw error

      // Remove from local state
      setProjects(prev => prev.filter(project => project.id !== projectId))

      toast.success('Project deleted successfully')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    } finally {
      setUpdatingProjects(prev => {
        const newSet = new Set(prev)
        newSet.delete(projectId)
        return newSet
      })
    }
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalProjects = projects.length
  const completedProjects = projects.filter(p => {
    const guide = p.guide_json as any
    return guide && Object.keys(guide).length > 0
  }).length
  const publicProjects = projects.filter(p => p.public).length
  const totalLikes = projects.reduce((sum, p) => sum + (p.likes_count || 0), 0)

  const getStatusBadge = (project: Project) => {
    const guide = project.guide_json as any
    if (guide && Object.keys(guide).length > 0) {
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Completed</Badge>
    } else {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">In Progress</Badge>
    }
  }

  const getVisibilityInfo = (project: Project) => {
    if (project.public) {
      return (
        <div className="flex items-center space-x-1 text-emerald-600 text-sm">
          <Eye className="w-4 h-4" />
          <span>Public</span>
          <span>•</span>
          <span>{project.likes_count || 0} likes</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center space-x-1 text-gray-500 text-sm">
          <EyeOff className="w-4 h-4" />
          <span>Private</span>
        </div>
      )
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Button onClick={() => navigate('/auth')} className="bg-emerald-600 hover:bg-emerald-700">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-emerald-50 border-b border-emerald-100">
        <div className="w-full px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="flex items-center space-x-2 text-emerald-600">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Link>
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link to="/quiz" className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search your projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-emerald-200 focus:border-emerald-400"
            />
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-emerald-100">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{totalProjects}</div>
              <div className="text-emerald-700 font-medium">Total Projects</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-emerald-100">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{completedProjects}</div>
              <div className="text-emerald-700 font-medium">Completed</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-emerald-100">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{publicProjects}</div>
              <div className="text-emerald-700 font-medium">Public</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-emerald-100">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{totalLikes}</div>
              <div className="text-emerald-700 font-medium">Total Likes</div>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">Start your first upcycling project!</p>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link to="/quiz">Create Your First Project</Link>
              </Button>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Card key={project.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Project Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {project.cover_image_url ? (
                        <img
                          src={project.cover_image_url}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                          <Eye className="w-8 h-8 text-emerald-400" />
                        </div>
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {project.title}
                        </h3>
                        <Edit className="w-4 h-4 text-gray-400" />
                      </div>
                      
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusBadge(project)}
                        {project.style && (
                          <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                            {project.style}
                          </Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          Created {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {getVisibilityInfo(project)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProjectPublicStatus(project.id, project.public)}
                        disabled={updatingProjects.has(project.id)}
                        className={`bg-white border-emerald-600 hover:bg-emerald-50 ${
                          project.public 
                            ? 'text-emerald-600 hover:text-emerald-700' 
                            : 'text-gray-600 hover:text-gray-700'
                        }`}
                        title={project.public ? 'Make private' : 'Make public'}
                      >
                        {updatingProjects.has(project.id) ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : project.public ? (
                          <EyeOff className="text-emerald-600 hover:text-emerald-600 w-4 h-4" />
                        ) : (
                          <Eye className="text-emerald-600 hover:text-emerald-600 w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProject(project.id, project.title)}
                        disabled={updatingProjects.has(project.id)}
                        className="bg-white border-emerald-600 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete project"
                      >
                        {updatingProjects.has(project.id) ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}