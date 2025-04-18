// frontend/src/app/dashboard/page.jsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import axios from "@/lib/axios"
import { toast } from "sonner"
import { 
  BookOpen, 
  Award, 
  Clock, 
  BarChart, 
  Play, 
  Users, 
  User
} from "lucide-react"

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }
      
      // Redirect creators to creator dashboard
      if (user?.role === "creator") {
        router.push("/creator/dashboard")
        return
      }
      
      // Redirect admins to admin dashboard
      if (user?.role === "admin") {
        router.push("/admin/dashboard")
        return
      }
      
      // For students, fetch their courses
      fetchEnrollments()
      fetchStats()
    }
  }, [isAuthenticated, loading, user, router])
  
  const fetchEnrollments = async () => {
    try {
      const response = await axios.get("/users/me/courses")
      setEnrollments(response.data.enrolledCourses)
    } catch (error) {
      console.error("Error fetching enrollments:", error)
      toast.error("Failed to load your courses")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get("/enrollments/stats/me")
      setStats(response.data.stats)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Dashboard</h1>
            <p className="text-muted-foreground">
              Track your progress and continue learning
            </p>
          </div>
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/courses">Find New Courses</Link>
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Enrolled Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalEnrollments || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalEnrollments === 1 ? "Course" : "Courses"} in progress
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Courses
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.completedCourses || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.certificatesEarned || 0} certificates earned
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Average Progress
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(stats?.averageProgress || 0)}%
              </div>
              <Progress value={stats?.averageProgress || 0} className="h-2 mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Last Activity
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {stats?.recentlyAccessed ? (
                  <Link 
                    href={`/courses/${stats.recentlyAccessed.courseId._id}`}
                    className="hover:text-primary"
                  >
                    {stats.recentlyAccessed.courseId.title}
                  </Link>
                ) : "No recent activity"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.recentlyAccessed?.lastAccessedAt ? 
                  new Date(stats.recentlyAccessed.lastAccessedAt).toLocaleDateString() : 
                  "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Continue Learning</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading your courses...</p>
            </div>
          </div>
        ) : enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.enrollmentId} className="overflow-hidden">
                <div className="relative h-40">
                  <Image
                    src={enrollment.course.thumbnail || "https://placehold.co/500x300?text=Course+Thumbnail"}
                    alt={enrollment.course.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/courses/${enrollment.course._id}/learn`}>
                        <Play className="h-4 w-4 mr-2" />
                        Continue
                      </Link>
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-2 line-clamp-1">
                    {enrollment.course.title}
                  </h3>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-3 w-3 mr-1" />
                      <span>{enrollment.course.creator.fullName}</span>
                    </div>
                    <div className="text-sm font-medium">
                      {`${enrollment.progress.toFixed(0)}% complete`}
                    </div>
                  </div>
                  <Progress value={enrollment.progress} className="h-2" />
                  <div className="mt-4 flex justify-between">
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{enrollment.course.enrolledStudents || 0} students</span>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/courses/${enrollment.course._id}/learn`}>
                        Continue
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't enrolled in any courses yet.
            </p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}