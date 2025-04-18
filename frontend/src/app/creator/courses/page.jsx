// src/app/creator/courses/page.jsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Search,
  Edit,
  Eye,
  Plus,
  Archive
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function CreatorCoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  useEffect(() => {
    fetchCourses()
  }, [])
  
  const fetchCourses = async () => {
    try {
      const response = await axios.get("/creator/courses")
      setCourses(response.data.courses || [])
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to load your courses")
      // Use dummy data for demonstration
      setCourses([
        {
          _id: "1",
          title: "Web Development Masterclass",
          description: "Complete guide to modern web development",
          price: 1999,
          isPublished: true,
          isApproved: true,
          enrolledStudents: 245,
          thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=450",
          rating: { average: 4.8, count: 120 }
        },
        {
          _id: "2",
          title: "Advanced JavaScript",
          description: "Master advanced JavaScript concepts and patterns",
          price: 2499,
          isPublished: true,
          isApproved: false,
          enrolledStudents: 0,
          thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450",
          rating: { average: 0, count: 0 }
        },
        {
          _id: "3",
          title: "React & Redux Bootcamp",
          description: "Build modern React applications with Redux",
          price: 1799,
          isPublished: false,
          isApproved: false,
          enrolledStudents: 0,
          thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450",
          rating: { average: 0, count: 0 }
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSearch = (e) => {
    e.preventDefault()
    // Filter courses locally for now
    // In a real app, you would call the API with search params
    const filtered = courses.filter(course => 
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setCourses(filtered)
    if (searchQuery === "") {
      fetchCourses()
    }
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">My Courses</h1>
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/creator/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              Create New Course
            </Link>
          </Button>
        </div>
        
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
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course._id} className="overflow-hidden">
                <div className="relative h-40">
                  <Image
                    src={course.thumbnail || "https://placehold.co/800x450?text=Course+Thumbnail"}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {!course.isPublished ? (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>
                    ) : !course.isApproved ? (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-100 text-green-800">Published</Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-1 truncate">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-medium">₹{course.price}</div>
                    <div className="text-sm text-muted-foreground">
                      {course.enrolledStudents} {course.enrolledStudents === 1 ? 'student' : 'students'}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/creator/courses/${course._id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/courses/${course._id}?preview=creator`} target="_blank">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No courses match your search criteria" : "You haven't created any courses yet"}
            </p>
            <Button asChild>
              <Link href="/creator/courses/new">Create Your First Course</Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}