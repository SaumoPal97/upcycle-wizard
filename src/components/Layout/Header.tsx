import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Recycle, User, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-4 h-16 flex items-center justify-center">
        <div className="flex items-center justify-between w-full max-w-7xl">
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
              <Recycle className="w-5 h-5 text-white" />
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`font-medium transition-colors hover:text-emerald-600 ${
                isActive('/') ? 'text-emerald-600' : 'text-gray-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`font-medium transition-colors hover:text-emerald-600 ${
                isActive('/explore') ? 'text-emerald-600' : 'text-gray-600'
              }`}
            >
              Explore
            </Link>
            {user && (
              <Link
                to="/my-projects"
                className={`font-medium transition-colors hover:text-emerald-600 ${
                  isActive('/my-projects') ? 'text-emerald-600' : 'text-gray-600'
                }`}
              >
                My Projects
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button - Only visible on mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </Button>

            {/* User Menu - Visible on all screen sizes */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/my-projects" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      My Projects
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" asChild className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dialog */}
      <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                  <Recycle className="w-4 h-4 text-white" />
                </div>
                <span className="text-emerald-700">Navigation</span>
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMobileMenu}
                className="p-2"
                aria-label="Close mobile menu"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <nav className="flex flex-col space-y-4 mt-4">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              onClick={closeMobileMenu}
              className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/explore') 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
              }`}
            >
              Explore
            </Link>
            {user && (
              <Link
                to="/my-projects"
                onClick={closeMobileMenu}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive('/my-projects') 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
                }`}
              >
                My Projects
              </Link>
            )}
            {!user && (
              <Link
                to="/auth"
                onClick={closeMobileMenu}
                className="block px-4 py-3 rounded-lg font-medium text-center bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>
        </DialogContent>
      </Dialog>
    </header>
  )
}