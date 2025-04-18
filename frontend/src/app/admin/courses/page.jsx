// src/app/admin/courses/page.jsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Star, 
  Eye 
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function AdminCoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  
  useEffect(() => {
    fetchCourses()
  }, [statusFilter])
  
  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter === "pending") {
        params.append("isApproved", "false")
        params.append("isPublished", "true")
      } else if (statusFilter === "approved") {
        params.append("isApproved", "true")
      } else if (statusFilter === "draft") {
        params.append("isPublished", "false")
      }
      
      if (searchQuery) {
        params.append("search", searchQuery)
      }
      
      const response = await axios.get(`/admin/courses?${params.toString()}`)
      setCourses(response.data.courses || [])
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to load courses")
      // Use dummy data for demonstration
      setCourses([
        {
          _id: "1",
          title: "Complete React Development Course",
          description: "Learn React from scratch",
          creator: { fullName: "John Doe", _id: "100" },
          price: 1999,
          isPublished: true,
          isApproved: true,
          isFeatured: true,
          enrolledStudents: 245,
          thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450",
          rating: { average: 4.8 }
        },
        {
          _id: "2",
          title: "Node.js Masterclass",
          description: "Build scalable APIs with Node.js",
          creator: { fullName: "Jane Smith", _id: "101" },
          price: 2499,
          isPublished: true,
          isApproved: true,
          isFeatured: false,
          enrolledStudents: 187,
          thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450",
          rating: { average: 4.6 }
        },
        {
          _id: "3",
          title: "Advanced Python Programming",
          description: "Take your Python skills to the next level",
          creator: { fullName: "Alex Johnson", _id: "102" },
          price: 1799,
          isPublished: true,
          isApproved: false,
          isFeatured: false,
          enrolledStudents: 0,
          thumbnail: "https://images.unsplash.com/photo-1526379879527-8559ecfd8bf7?w=800&h=450",
          rating: { average: 0 }
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSearch = (e) => {
    e.preventDefault()
    fetchCourses()
  }
  
  const updateCourse = async (action) => {
    if (!selectedCourse) return
    
    setIsUpdating(true)
    try {
      if (action === "approve") {
        await axios.put(`/admin/courses/${selectedCourse._id}/approve`, {
          isApproved: true
        })
        
        // Update local state
        setCourses(courses.map(course => 
          course._id === selectedCourse._id 
            ? { ...course, isApproved: true } 
            : course
        ))
        
        toast.success("Course approved successfully")
      } else if (action === "reject") {
        await axios.put(`/admin/courses/${selectedCourse._id}/approve`, {
          isApproved: false
        })
        
        // Update local state
        setCourses(courses.map(course => 
          course._id === selectedCourse._id 
            ? { ...course, isApproved: false } 
            : course
        ))
        
        toast.success("Course rejected")
      } else if (action === "feature") {
        await axios.put(`/admin/courses/${selectedCourse._id}/feature`, {
          isFeatured: !selectedCourse.isFeatured
        })
        
        // Update local state
        setCourses(courses.map(course => 
          course._id === selectedCourse._id 
            ? { ...course, isFeatured: !course.isFeatured } 
            : course
        ))
        
        toast.success(`Course ${selectedCourse.isFeatured ? 'unfeatured' : 'featured'} successfully`)
      }
      
      setSelectedCourse(null)
    } catch (error) {
      console.error("Error updating course:", error)
      toast.error("Failed to update course")
    } finally {
      setIsUpdating(false)
    }
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Course Management</h1>
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>
          
          // src/app/admin/courses/page.jsx (continued)
          <div className="flex items-center gap-2">
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Courses Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : courses.length > 0 ? (
                courses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-16 rounded overflow-hidden bg-muted">
                          <Image
                            src={course.thumbnail || "https://placehold.co/800x450?text=Course+Thumbnail"}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="max-w-[200px]">
                          <div className="font-medium truncate">{course.title}</div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Star className="h-3 w-3 mr-1 text-yellow-500" />
                            {course.rating?.average || "New"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{course.creator?.fullName || "Unknown"}</TableCell>
                    <TableCell>₹{course.price}</TableCell>
                    <TableCell>{course.enrolledStudents}</TableCell>
                    <TableCell>
                      {!course.isPublished ? (
                        <Badge variant="outline">Draft</Badge>
                      ) : !course.isApproved ? (
                        <Badge variant="secondary">Pending Review</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Approved
                        </Badge>
                      )}
                      {course.isFeatured && (
                        <Badge className="ml-1 bg-blue-500">Featured</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/courses/${course._id}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCourse(course)}
                        >
                          Manage
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">No courses found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Course Management Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Course</DialogTitle>
            <DialogDescription>
              Review and update course status
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourse && (
            <div className="py-4 space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative w-32 h-20 rounded overflow-hidden bg-muted">
                  <Image
                    src={selectedCourse.thumbnail || "https://placehold.co/800x450?text=Course+Thumbnail"}
                    alt={selectedCourse.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{selectedCourse.title}</h3>
                  <p className="text-sm text-muted-foreground">By {selectedCourse.creator?.fullName || "Unknown"}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-medium">₹{selectedCourse.price}</span>
                    <Badge variant="outline">
                      {selectedCourse.isPublished 
                        ? selectedCourse.isApproved 
                          ? "Approved" 
                          : "Pending" 
                        : "Draft"
                      }
                    </Badge>
                    {selectedCourse.isFeatured && (
                      <Badge>Featured</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-sm">
                <p className="mb-1 font-medium">Description</p>
                <p className="text-muted-foreground">{selectedCourse.description}</p>
              </div>
              
              <div className="pt-4 space-y-3">
                <p className="text-sm font-medium">Available Actions</p>
                
                {/* Show approve/reject actions only for pending courses */}
                {selectedCourse.isPublished && !selectedCourse.isApproved && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateCourse("approve")}
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Course
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateCourse("reject")}
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Course
                    </Button>
                  </div>
                )}
                
                {/* Show feature/unfeature for approved courses */}
                {selectedCourse.isPublished && selectedCourse.isApproved && (
                  <Button
                    variant={selectedCourse.isFeatured ? "outline" : "default"}
                    onClick={() => updateCourse("feature")}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {selectedCourse.isFeatured ? "Unfeature Course" : "Feature Course"}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  asChild
                  className="w-full"
                >
                  <Link href={`/courses/${selectedCourse._id}`} target="_blank">
                    <Eye className="h-4 w-4 mr-2" />
                    View Course Page
                  </Link>
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedCourse(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}