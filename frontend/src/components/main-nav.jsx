"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  Bookmark,
  User,
  Settings,
  LogOut,
  BookOpen,
  BarChart,
  PlusCircle,
  ShieldCheck,
  Menu,
  X,
  Search
} from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export function MainNav({ className }) {
  const { user, logout, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  const getUserInitials = () => {
    if (!user?.fullName) return "U"

    const names = user.fullName.split(" ")
    if (names.length === 1) return names[0].charAt(0).toUpperCase()

    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  const navItems = [
    {
      title: "Home",
      href: "/",
      active: pathname === "/"
    },
    {
      title: "Courses",
      href: "/courses",
      active: pathname === "/courses" || pathname.startsWith("/courses/")
    },
    {
      title: "About",
      href: "/about",
      active: pathname === "/about"
    },
    {
      title: "Contact",
      href: "/contact",
      active: pathname === "/contact"
    },
  ]

  return (
    <div className="border-b bg-background">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="mr-2 px-0 text-base hover:bg-transparent hover:text-primary md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="px-7">
              <Link href="/" className="flex items-center font-bold text-xl" onClick={() => setIsMenuOpen(false)}>
                <BookOpen className="mr-2 h-6 w-6" />
                <span>Course Platform</span>
              </Link>
            </div>
            <nav className="flex flex-col gap-4 mt-10">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "px-7 py-2 text-base font-medium transition-colors hover:text-primary",
                    item.active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </Link>
              ))}
              <div className="px-7 py-2">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search courses..."
                      className="w-full bg-background pl-8 pr-4"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>
              </div>

              {isAuthenticated ? (
                <>
                  <div className="border-t my-2" />
                  <Link
                    href={user.role === "creator" ? "/creator/dashboard" : "/dashboard"}
                    onClick={() => setIsMenuOpen(false)}
                    className="px-7 py-2 text-base font-medium transition-colors hover:text-primary"
                  >
                    Dashboard
                  </Link>

                  <Link
                    href="/my-courses"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-7 py-2 text-base font-medium transition-colors hover:text-primary"
                  >
                    My Courses
                  </Link>
                  {user?.role === "admin" ? (
                    <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="px-7 py-2 text-base font-medium transition-colors hover:text-primary">
                      Admin Dashboard
                    </Link>
                  ) : user?.role === "creator" ? (
                    <Link href="/creator/dashboard" onClick={() => setIsMenuOpen(false)} className="px-7 py-2 text-base font-medium transition-colors hover:text-primary">
                      Creator Dashboard
                    </Link>
                  ) : (
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="px-7 py-2 text-base font-medium transition-colors hover:text-primary">
                      Dashboard
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-7 py-2 text-base font-medium transition-colors hover:text-primary"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      logout()
                    }}
                    className="px-7 py-2 text-base font-medium transition-colors hover:text-primary text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t my-2" />
                  <div className="px-7 py-2 flex flex-col gap-2">
                    <Button asChild className="w-full">
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
                    </Button>
                  </div>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="hidden md:flex items-center mr-6 font-bold text-xl">
          <BookOpen className="mr-2 h-6 w-6" />
          <span>Course Platform</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                item.active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex relative ml-auto mr-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="w-[200px] lg:w-[300px] pl-8 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage} alt={user?.fullName} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem asChild>
                <Link href={user.role === "creator" ? "/creator/dashboard" : "/dashboard"} className="cursor-pointer flex w-full">
                  <Home className="mr-2 h-4 w-4" />
                  <span>{user.role === "creator" ? "Creator Dashboard" : "Dashboard"}</span>
                </Link>
              </DropdownMenuItem> */}
              <DropdownMenuItem asChild>
                {user.role === "admin" ? (
                  <Link href="/admin/dashboard" className="cursor-pointer flex w-full">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                ) : user.role === "creator" ? (
                  <Link href="/creator/dashboard" className="cursor-pointer flex w-full">
                    <BarChart className="mr-2 h-4 w-4" />
                    <span>Creator Dashboard</span>
                  </Link>
                ) : (
                  <Link href="/dashboard" className="cursor-pointer flex w-full">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                )}
              </DropdownMenuItem>


              <DropdownMenuItem asChild>
                <Link href="/my-courses" className="cursor-pointer flex w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>My Courses</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer flex w-full">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>

              {user?.role === "creator" && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/creator/courses/new" className="cursor-pointer flex w-full">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>Create Course</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden sm:flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}