"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function CreateCoursePage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    level: "beginner",
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState([
    "Development",
    "Business",
    "Finance",
    "IT & Software",
    "Marketing",
    "Design",
    "Health & Fitness",
    "Music",
    "Lifestyle",
    "Photography",
    "Education",
  ])
  
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
      
      // Only redirect to onboarding if status is pending AND bio is empty
      // This prevents endless redirects if they completed onboarding but are still pending admin approval
      if (user?.role === "creator" && user?.creatorStatus === "pending" && !user?.bio) {
        router.push("/creator/onboarding")
        return
      }
    }
  }, [isAuthenticated, loading, user, router])
  
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setCourseData({
      ...courseData,
      [name]: value
    })
  }
  
  const handleSelectChange = (name, value) => {
    setCourseData({
      ...courseData,
      [name]: value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!courseData.title || !courseData.description || !courseData.category) {
      toast.error("Please fill in all required fields")
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await axios.post("/creator/courses", courseData)
      toast.success("Course created successfully")
      router.push(`/creator/courses/${response.data.course._id}`)
    } catch (error) {
      console.error("Error creating course:", error)
      toast.error(error.response?.data?.message || "Failed to create course")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="flex-1 container mx-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
            <p className="text-muted-foreground">
              Fill in the basic details to get started with your new course
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>
                  Provide the basic information about your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    value={courseData.title}
                    onChange={handleChange}
                    placeholder="e.g., Complete Web Development Bootcamp"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Course Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={courseData.description}
                    onChange={handleChange}
                    placeholder="Describe what students will learn in your course"
                    rows={5}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                    <Select
                      value={courseData.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="level">Difficulty Level</Label>
                    <Select
                      value={courseData.level}
                      onValueChange={(value) => handleSelectChange("level", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    value={courseData.price}
                    onChange={handleChange}
                    placeholder="0 for free courses"
                  />
                  <p className="text-sm text-muted-foreground">
                    Set to 0 for free courses. You can change the price later.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Course"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}