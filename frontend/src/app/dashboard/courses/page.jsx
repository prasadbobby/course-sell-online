// src/app/dashboard/courses/page.jsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  Search, 
  BookOpen, 
  Clock, 
  BarChart, 
  Play 
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function UserCoursesPage() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  useEffect(() => {
    fetchEnrollments()
  }, [])
  
  const fetchEnrollments = async () => {
    try {
      const response = await axios.get("/users/me/courses")
      setEnrollments(response.data.enrolledCourses || [])
    } catch (error) {
      console.error("Error fetching enrollments:", error)
      toast.error("Failed to load your courses")
      // Use example data for demonstration
      setEnrollments([
        {
          enrollmentId: "1",
          progress: 75,
          enrollmentDate: "2023-04-15",
          course: {
            _id: "101",
            title: "Complete Web Development Bootcamp",
            thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=450",
            description: "Learn web development from scratch",
            level: "beginner",
            creator: { fullName: "John Doe", profileImage: "" },
            enrolledStudents: 1245,
            rating: { average: 4.8 }
          }
        },
        {
          enrollmentId: "2",
          progress: 32,
          enrollmentDate: "2023-05-20",
          course: {
            _id: "102",
            title: "Advanced JavaScript: From Fundamentals to Functional JS",
            thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450",
            description: "Master advanced JavaScript concepts",
            level: "intermediate",
            creator: { fullName: "Jane Smith", profileImage: "" },
            enrolledStudents: 895,
            rating: { average: 4.7 }
          }
        },
        {
          enrollmentId: "3",
          progress: 100,
          enrollmentDate: "2023-03-10",
          course: {
            _id: "103",
            title: "Python for Data Science and Machine Learning",
            thumbnail: "https://images.unsplash.com/photo-1526379879527-8559ecfd8bf7?w=800&h=450",
            description: "Learn Python for data analysis and ML",
            level: "intermediate",
            creator: { fullName: "Alex Johnson", profileImage: "" },
            enrolledStudents: 1560,
            rating: { average: 4.9 }
          }
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSearch = (e) => {
    e.preventDefault()
    // Filter enrollments locally since we're using dummy data
    // In a real app, you might want to call the API with search params
    const filtered = enrollments.filter(enrollment => 
      enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setEnrollments(filtered)
    if (searchQuery === "") {
      fetchEnrollments()
    }
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Courses</h1>
        
        {/* Search */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search your courses"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.enrollmentId} className="overflow-hidden h-full">
                <div className="relative h-40">
                  <Image
                    src={enrollment.course.thumbnail || "https://placehold.co/800x450?text=Course+Thumbnail"}
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
                  <h3 className="font-medium text-lg mb-1 line-clamp-2">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    By {enrollment.course.creator.fullName}
                  </p>
                  
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span>Progress</span>
                    <span className="font-medium">{Math.round(enrollment.progress)}%</span>
                  </div>
                  <Progress value={enrollment.progress} className="h-2 mb-4" />
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <Button asChild variant="ghost" size="sm">
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
            <h3 className="text-lg font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "No courses match your search criteria"
                : "You haven't enrolled in any courses yet"}
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