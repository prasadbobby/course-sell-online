// frontend/src/app/creator/dashboard/page.jsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart as BarChartIcon,
  BookOpen,
  DollarSign,
  Users,
  Plus,
  Archive,
  Clock,
  AlertCircle
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { useAuth } from "@/components/auth-provider"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function CreatorDashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [earnings, setEarnings] = useState(null)
  
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }
      
      if (user?.role !== "creator") {
        router.push("/dashboard")
        return
      }
      
      // Only redirect to onboarding if they haven't completed profile setup (check bio)
      if (user?.role === "creator" && user?.creatorStatus === "pending" && !user?.bio) {
        router.push("/creator/onboarding")
        return
      }
      
      // Otherwise show dashboard with appropriate messages based on status
      fetchCourses()
      fetchEarnings()
    }
  }, [isAuthenticated, loading, user, router])
  
  const fetchCourses = async () => {
    try {
      const response = await axios.get("/creator/courses")
      setCourses(response.data.courses || [])
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to load courses")
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchEarnings = async () => {
    try {
      const response = await axios.get("/creator/earnings")
      setEarnings(response.data)
    } catch (error) {
      console.error("Error fetching earnings:", error)
      // Don't show error toast here as this might fail for new creators
    }
  }
  
  // Filter courses by status
  const publishedCourses = courses.filter(course => course.isPublished)
  const draftCourses = courses.filter(course => !course.isPublished)
  const approvedCourses = courses.filter(course => course.isPublished && course.isApproved)
  const pendingCourses = courses.filter(course => course.isPublished && !course.isApproved)
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Creator Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your courses and track your performance
            </p>
          </div>
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/creator/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              Create New Course
            </Link>
          </Button>
          </div>
        
        {/* Pending Approval Notice */}
        {user?.creatorStatus === "pending" && (
          <div className="mb-8">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <AlertCircle className="h-5 w-5 text-yellow-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-yellow-800 mb-1">
                      Your creator account is pending approval
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Our team is reviewing your application. This usually takes 1-2 business days. You can still create course content, but you won't be able to publish courses until approved.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rejected Notice */}
        {user?.creatorStatus === "rejected" && (
          <div className="mb-8">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-2 rounded-full">
                    <AlertCircle className="h-5 w-5 text-red-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-red-800 mb-1">
                      Your creator application was not approved
                    </h3>
                    <p className="text-sm text-red-700 mb-3">
                      Unfortunately, your creator application wasn't approved at this time. Please contact support for more information.
                    </p>
                    <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
              <p className="text-xs text-muted-foreground">
                {publishedCourses.length} published, {draftCourses.length} drafts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.reduce((total, course) => total + (course.enrolledStudents || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all your courses
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{earnings?.totalEarnings?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Lifetime earnings
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCourses.length}</div>
              <p className="text-xs text-muted-foreground">
                Courses awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Earnings Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {earnings?.monthlyEarnings?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={earnings.monthlyEarnings}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Earnings']} />
                    <Legend />
                    <Bar dataKey="earnings" name="Earnings" fill="#0066ff" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No earnings data available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Course List */}
        <h2 className="text-xl font-semibold mb-6">Your Courses</h2>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your courses...</p>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course._id} className="overflow-hidden">
                <div className="relative h-40">
                  <Image
                    src={course.thumbnail || "https://placehold.co/500x300?text=Course+Thumbnail"}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {!course.isPublished ? (
                      <Badge variant="secondary">Draft</Badge>
                    ) : !course.isApproved ? (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Pending Review
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Published
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-2 line-clamp-1">
                    {course.title}
                  </h3>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {course.enrolledStudents || 0} students
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      ₹{course.price}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/creator/courses/${course._id}`}>
                        Edit
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/courses/${course._id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add Course Card */}
            <Card className="border-dashed bg-muted/40 flex flex-col items-center justify-center h-full min-h-[20rem]">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Create New Course</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-[15rem]">
                  Start building your next course and share your knowledge
                </p>
                <Button asChild>
                  <Link href="/creator/courses/new">Create Course</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any courses yet.
            </p>
            <Button asChild>
              <Link href="/creator/courses/new">Create a Course</Link>
            </Button>
          </div>
        )}
        
        {pendingCourses.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Pending Review</h2>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <AlertCircle className="h-5 w-5 text-yellow-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-yellow-800 mb-1">
                      You have {pendingCourses.length} course(s) awaiting approval
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Our team reviews all courses before they are published. This usually takes 1-2 business days.
                    </p>
                    <Button asChild variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                      <Link href="/creator/courses?filter=pending">View Pending Courses</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}