import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Plus, Eye, Copy, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Database } from '@/types/database'

type Project = Database['public']['Tables']['projects']['Row']

export function MyProjectsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user) {
      fetchUserProjects()
    }
  }, [user])

  const fetchUserProjects = async () => {
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
      console.error('Error fetching user projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
      
      setProjects(projects.filter(p => p.id !== projectId))
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    }
  }

  const togglePublic = async (projectId: string, currentPublic: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ public: !currentPublic })
        .eq('id', projectId)

      if (error) throw error
      
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, public: !currentPublic } : p
      ))
    } catch (error) {
      console.error('Error updating project visibility:', error)
      alert('Failed to update project visibility')
    }
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.style?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.room?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalProjects = projects.length
  const completedProjects = projects.filter(p => {
    const guide = p.guide_json as any
    return guide?.steps && guide.steps.length > 0
  }).length
  const publicProjects = projects.filter(p => p.public).length
  const totalLikes = projects.reduce((sum, p) => sum + (p.likes_count || 0), 0)

  const getStatusBadge = (project: Project) => {
    const guide = project.guide_json as any
    if (guide?.steps && guide.steps.length > 0) {
      return <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>
    } else if (project.quiz_data && Object.keys(project.quiz_data).length > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="w-full px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <Button variant="ghost" asChild className="flex items-center space-x-2 text-emerald-600">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Link>
              </Button>
              
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            </div>
            
            <Button 
              onClick={() => navigate('/quiz')}
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Button>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search your projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{totalProjects}</div>
              <div className="text-gray-600">Total Projects</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{completedProjects}</div>
              <div className="text-gray-600">Completed</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{publicProjects}</div>
              <div className="text-gray-600">Public</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{totalLikes}</div>
              <div className="text-gray-600">Total Likes</div>
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
              <Button 
                onClick={() => navigate('/quiz')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Create Your First Project
              </Button>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Card key={project.id} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Project Image */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {project.cover_image_url ? (
                        <img
                          src={project.cover_image_url}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center bg-white">
                          <Eye className="w-8 h-8 text-emerald-400" />
                        </div>
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                        <Edit className="w-4 h-4 text-gray-400" />
                      </div>
                      
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusBadge(project)}
                        {project.style && (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                            {project.style}
                          </Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          Created {formatDate(project.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {project.public ? (
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>Public • {project.likes_count || 0} likes</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <span>🔒 Private</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/project/${project.id}`)}
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublic(project.id, project.public)}
                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProject(project.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
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