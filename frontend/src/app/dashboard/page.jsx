"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { 
  BookOpen, 
  Award, 
  Clock, 
  Users,
  BarChart,
  Play,
  Calendar
} from "lucide-react"
import axios from "@/lib/axios"
import { toast } from "sonner"

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

  if (loading || !isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Student Dashboard</h1>
            <p className="text-muted-foreground">
              Track your progress and continue learning
            </p>
          </div>
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/courses">
              Find New Courses
            </Link>
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

        {/* Main Content */}
        <Tabs defaultValue="my-courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-courses">My Courses</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-courses" className="space-y-4">
            <h2 className="text-xl font-semibold">Continue Learning</h2>
            
            {isLoading ? (
              <div className="text-center py-12">Loading your courses...</div>
            ) : enrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment) => (
                  <Card key={enrollment.enrollmentId} className="overflow-hidden">
                    <div className="relative h-40">
                      <Image
                        src={enrollment.course.thumbnail || "https://via.placeholder.com/500x300"}
                        alt={enrollment.course.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button asChild variant="secondary" size="sm">
                          <Link href={`/courses/${enrollment.course._id}`}>
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
                          <Users className="h-3 w-3 mr-1" />
                          <span>{enrollment.course.creator.fullName}</span>
                        </div>
                        <div className="text-sm font-medium">
                          {`${enrollment.progress.toFixed(0)}% complete`}
                        </div>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                      <div className="mt-4 text-xs text-muted-foreground flex justify-between">
                        <span>{enrollment.course.totalLessons || 0} lessons</span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                        </span>
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
          </TabsContent>
          
          <TabsContent value="certificates" className="space-y-4">
            <h2 className="text-xl font-semibold">Your Certificates</h2>
            
            {stats?.certificatesEarned > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrollments
                  .filter(e => e.certificate)
                  .map((enrollment) => (
                    <Card key={`cert-${enrollment.enrollmentId}`} className="flex">
                      <div className="p-4 border-r bg-muted/30 flex items-center justify-center">
                        <Award className="h-12 w-12 text-primary" />
                      </div>
                      <CardContent className="p-4 flex-1">
                        <h3 className="font-medium mb-1">{enrollment.course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Completed on {new Date(enrollment.certificate.issueDate).toLocaleDateString()}
                        </p>
                        <Button asChild size="sm" variant="outline">
                          <Link href={enrollment.certificate.url} target="_blank">
                            View Certificate
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No certificates yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete courses to earn certificates and showcase your skills.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}