"use client"

import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"


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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  DragDropContext,
  Droppable,
  Draggable
} from 'react-beautiful-dnd'
import {
  Plus,
  Trash2,
  Upload,
  DollarSign,
  CalendarClock,
  AlertTriangle,
  GripVertical,
  Edit,
  Play,
  FileText,
  List,
  PenTool,
  Eye
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function CourseEditPage({ params }) {
    const id = use(params).id;
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef(null)
  
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    price: 0,
    discountPrice: 0,
    discountValidUntil: "",
    category: "",
    level: "beginner",
    whatYouWillLearn: [],
    requirements: [],
    tags: []
  })
  
  const [newRequirement, setNewRequirement] = useState("")
  const [newLearningPoint, setNewLearningPoint] = useState("")
  const [newTag, setNewTag] = useState("")
  
  // New module state
  const [newModuleTitle, setNewModuleTitle] = useState("")
  const [newModuleDescription, setNewModuleDescription] = useState("")
  const [isAddingModule, setIsAddingModule] = useState(false)
  
  // New lesson state
  const [activeModule, setActiveModule] = useState(null)
  const [newLessonData, setNewLessonData] = useState({
    title: "",
    description: "",
    type: "video",
    isPreview: false,
    content: {
      videoUrl: "",
      duration: 0,
      htmlContent: "",
      questions: [],
      instructions: "",
      submissionType: "text"
    }
  })
  const [isAddingLesson, setIsAddingLesson] = useState(false)
  
  const categories = [
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
  ]
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
      return
    }
    
    if (isAuthenticated) {
      if (user.role !== "creator" || user.creatorStatus !== "approved") {
        router.push("/dashboard")
        return
      }
      
      fetchCourse()
    }
  }, [isAuthenticated, loading, user, router, id])
  


  const fetchCourse = async () => {
    try {
      // Use the specialized creator endpoint instead
      const response = await axios.get(`/creator/courses/${id}/edit`);
      const courseData = response.data.course;
      
      setCourse(courseData);
      setModules(courseData.modules || []);
  
      
      setCourseForm({
        title: courseData.title || "",
        description: courseData.description || "",
        price: courseData.price || 0,
        discountPrice: courseData.discountPrice || 0,
        discountValidUntil: courseData.discountValidUntil ? 
          new Date(courseData.discountValidUntil).toISOString().split('T')[0] : "",
        category: courseData.category || "",
        level: courseData.level || "beginner",
        whatYouWillLearn: courseData.whatYouWillLearn || [],
        requirements: courseData.requirements || [],
        tags: courseData.tags || []
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error("Failed to load course details");
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleCourseChange = (e) => {
    const { name, value } = e.target
    setCourseForm({
      ...courseForm,
      [name]: value
    })
  }
  
  const handleSelectChange = (name, value) => {
    setCourseForm({
      ...courseForm,
      [name]: value
    })
  }
  
  const saveCourse = async () => {
    if (!courseForm.title || !courseForm.description || !courseForm.category) {
      toast.error("Please fill in all required fields")
      return
    }
    
    setIsSaving(true)
    try {
      await axios.put(`/creator/courses/${id}`, courseForm)
      toast.success("Course details saved successfully")
    } catch (error) {
      console.error("Error saving course:", error)
      toast.error(error.response?.data?.message || "Failed to save course")
    } finally {
      setIsSaving(false)
    }
  }
  
// In your course edit component
const handleThumbnailUpload = () => {
    fileInputRef.current.click();
  };
  
  const uploadThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or WebP)");
      return;
    }
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);
      
      console.log('Uploading course thumbnail:', file.name, file.type, file.size);
      
      const response = await axios.post(`/creator/courses/${id}/thumbnail`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Thumbnail upload response:', response.data);
      
      // Update the course object with the new thumbnail URL
      setCourse({
        ...course,
        thumbnail: response.data.thumbnail
      });
      
      toast.success("Thumbnail uploaded successfully");
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      console.error("Error response:", error.response?.data);
      toast.error("Failed to upload thumbnail: " + (error.response?.data?.message || "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };
  
  const addLearningPoint = () => {
    if (!newLearningPoint.trim()) return
    
    setCourseForm({
      ...courseForm,
      whatYouWillLearn: [...courseForm.whatYouWillLearn, newLearningPoint.trim()]
    })
    
    setNewLearningPoint("")
  }
  
  const removeLearningPoint = (index) => {
    const updatedPoints = [...courseForm.whatYouWillLearn]
    updatedPoints.splice(index, 1)
    
    setCourseForm({
      ...courseForm,
      whatYouWillLearn: updatedPoints
    })
  }
  
  const addRequirement = () => {
    if (!newRequirement.trim()) return
    
    setCourseForm({
      ...courseForm,
      requirements: [...courseForm.requirements, newRequirement.trim()]
    })
    
    setNewRequirement("")
  }
  
  const removeRequirement = (index) => {
    const updatedRequirements = [...courseForm.requirements]
    updatedRequirements.splice(index, 1)
    
    setCourseForm({
      ...courseForm,
      requirements: updatedRequirements
    })
  }
  
  const addTag = () => {
    if (!newTag.trim()) return
    
    setCourseForm({
      ...courseForm,
      tags: [...courseForm.tags, newTag.trim()]
    })
    
    setNewTag("")
  }
  
  const removeTag = (index) => {
    const updatedTags = [...courseForm.tags]
    updatedTags.splice(index, 1)
    
    setCourseForm({
      ...courseForm,
      tags: updatedTags
    })
  }
  
  const addModule = async () => {
    if (!newModuleTitle.trim()) {
      toast.error("Module title is required")
      return
    }
    
    setIsAddingModule(true)
    try {
      const response = await axios.post(`/creator/courses/${id}/modules`, {
        title: newModuleTitle,
        description: newModuleDescription
      })
      
      // Add the new module to the list
      setModules([...modules, response.data.module])
      
      // Reset form fields
      setNewModuleTitle("")
      setNewModuleDescription("")
      
      toast.success("Module added successfully")
    } catch (error) {
      console.error("Error adding module:", error)
      toast.error("Failed to add module")
    } finally {
      setIsAddingModule(false)
    }
  }
  
  const deleteModule = async (moduleId) => {
    if (!confirm("Are you sure you want to delete this module? All lessons within it will also be deleted.")) {
      return
    }
    
    try {
      await axios.delete(`/creator/modules/${moduleId}`)
      
      // Remove the module from the list
      setModules(modules.filter(module => module._id !== moduleId))
      
      toast.success("Module deleted successfully")
    } catch (error) {
      console.error("Error deleting module:", error)
      toast.error("Failed to delete module")
    }
  }
  
  const handleNewLessonChange = (e) => {
    const { name, value } = e.target
    setNewLessonData({
      ...newLessonData,
      [name]: value
    })
  }
  
  const handleLessonTypeChange = (value) => {
    // Reset the content based on the new type
    let content = {}
    
    if (value === "video") {
      content = { videoUrl: "", duration: 0 }
    } else if (value === "text") {
      content = { htmlContent: "" }
    } else if (value === "quiz") {
      content = { questions: [] }
    } else if (value === "assignment") {
      content = { instructions: "", submissionType: "text" }
    }
    
    setNewLessonData({
      ...newLessonData,
      type: value,
      content
    })
  }
  
  const handleLessonContentChange = (e) => {
    const { name, value } = e.target
    setNewLessonData({
      ...newLessonData,
      content: {
        ...newLessonData.content,
        [name]: value
      }
    })
  }
  
  const addLesson = async () => {
    if (!newLessonData.title.trim() || !activeModule) {
      toast.error("Lesson title is required")
      return
    }
    
    setIsAddingLesson(true)
    try {
      const response = await axios.post(`/creator/modules/${activeModule}/lessons`, newLessonData)
      
      // Update the modules list with the new lesson
      const updatedModules = modules.map(module => {
        if (module._id === activeModule) {
          return {
            ...module,
            lessons: [...(module.lessons || []), response.data.lesson]
          }
        }
        return module
      })
      
      setModules(updatedModules)
      
      // Reset form fields
      setNewLessonData({
        title: "",
        description: "",
        type: "video",
        isPreview: false,
        content: {
          videoUrl: "",
          duration: 0,
          htmlContent: "",
          questions: [],
          instructions: "",
          submissionType: "text"
        }
      })
      
      toast.success("Lesson added successfully")
    } catch (error) {
      console.error("Error adding lesson:", error)
      toast.error("Failed to add lesson")
    } finally {
      setIsAddingLesson(false)
    }
  }
  
  const deleteLesson = async (moduleId, lessonId) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return
    }
    
    try {
      await axios.delete(`/creator/lessons/${lessonId}`)
      
      // Update the modules list by removing the deleted lesson
      const updatedModules = modules.map(module => {
        if (module._id === moduleId) {
          return {
            ...module,
            lessons: module.lessons.filter(lesson => lesson._id !== lessonId)
          }
        }
        return module
      })
      
      setModules(updatedModules)
      
      toast.success("Lesson deleted successfully")
    } catch (error) {
      console.error("Error deleting lesson:", error)
      toast.error("Failed to delete lesson")
    }
  }
  
  const publishCourse = async () => {
    // Check if the course has at least one module and one lesson
    if (!modules.length) {
      toast.error("Your course needs at least one module before publishing")
      return
    }
    
    const hasLessons = modules.some(module => module.lessons && module.lessons.length > 0)
    if (!hasLessons) {
      toast.error("Your course needs at least one lesson before publishing")
      return
    }
    
    // Check if course has a thumbnail
    if (!course.thumbnail) {
      toast.error("Please upload a thumbnail before publishing")
      return
    }
    
    if (!confirm("Are you sure you want to publish this course? Once published, you won't be able to delete modules or lessons.")) {
      return
    }
    
    setIsPublishing(true)
    try {
      await axios.post(`/creator/courses/${id}/publish`)
      
      // Update course status
      setCourse({
        ...course,
        isPublished: true
      })
      
      toast.success("Course published successfully! It will be reviewed by our team before being visible to students.")
    } catch (error) {
      console.error("Error publishing course:", error)
      toast.error(error.response?.data?.message || "Failed to publish course")
    } finally {
      setIsPublishing(false)
    }
  }
  
  const onDragEnd = async (result) => {
    const { destination, source, type } = result
    
    // Check if item was dropped outside of any droppable area
    if (!destination) return
    
    // Check if the item was dropped in a different position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }
    
    // Handle module reordering
    if (type === 'MODULE') {
      const reorderedModules = [...modules]
      const [removed] = reorderedModules.splice(source.index, 1)
      reorderedModules.splice(destination.index, 0, removed)
      
      // Update the order property of each module
      const updatedModules = reorderedModules.map((module, index) => ({
        ...module,
        order: index + 1
      }))
      
      setModules(updatedModules)
      
      // Save the new order to the backend
      try {
        // This would be a batch update in a real implementation
        await Promise.all(updatedModules.map(module => 
          axios.put(`/creator/modules/${module._id}`, { order: module.order })
        ))
      } catch (error) {
        console.error("Error updating module order:", error)
        toast.error("Failed to save module order")
      }
    }
    
    // Handle lesson reordering within a module
    if (type === 'LESSON') {
      const moduleId = source.droppableId
      const targetModuleId = destination.droppableId
      
      // Find the source and target modules
      const sourceModule = modules.find(m => m._id === moduleId)
      const targetModule = modules.find(m => m._id === targetModuleId)
      
      if (!sourceModule || !targetModule) return
      
      // Make a copy of the lessons arrays
      const sourceLessons = [...(sourceModule.lessons || [])]
      const targetLessons = moduleId === targetModuleId ? 
        sourceLessons : [...(targetModule.lessons || [])]
      
      // Remove the lesson from the source module
      const [movedLesson] = sourceLessons.splice(source.index, 1)
      
      // Add the lesson to the target module
      if (moduleId === targetModuleId) {
        // Same module, just reorder
        sourceLessons.splice(destination.index, 0, movedLesson)
        
        // Update the order property of each lesson
        const updatedLessons = sourceLessons.map((lesson, index) => ({
          ...lesson,
          order: index + 1,
        }))
        
        // Update the modules state
        const updatedModules = modules.map(module => {
          if (module._id === moduleId) {
            return {
              ...module,
              lessons: updatedLessons
            }
          }
          return module
        })
        
        setModules(updatedModules)
        
        // Save the new lesson order to the backend
        try {
          await Promise.all(updatedLessons.map(lesson => 
            axios.put(`/creator/lessons/${lesson._id}`, { order: lesson.order })
          ))
        } catch (error) {
          console.error("Error updating lesson order:", error)
          toast.error("Failed to save lesson order")
        }
      } else {
        // Moving between modules (would require updating moduleId as well)
        // This is more complex and would require additional API support
        toast.error("Moving lessons between modules is not supported yet")
      }
    }
  }
  
  if (loading || (isAuthenticated && user.role !== "creator")) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <MainNav />
        <div className="flex-1 container mx-auto p-4 md:p-6 flex items-center justify-center">
          <div>Loading course details...</div>
        </div>
      </div>
    )
  }
  
  if (!course) {
    return (
      <div className="flex flex-col min-h-screen">
        <MainNav />
        <div className="flex-1 container mx-auto p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
            <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or you don't have permission to edit it.</p>
            <Button asChild>
              <Link href="/creator/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="border-b bg-muted/30">
        <div className="container mx-auto p-4 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              href="/creator/dashboard" 
              className="text-sm text-muted-foreground hover:text-primary mr-4"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold truncate max-w-md">
              {course.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {course.isPublished ? (
              <Badge variant={course.isApproved ? "success" : "warning"}>
                {course.isApproved ? "Published" : "Pending Review"}
              </Badge>
            ) : (
              <>
                <Badge variant="outline">Draft</Badge>
                <Button 
                  onClick={publishCourse} 
                  disabled={isPublishing}
                >
                  {isPublishing ? "Publishing..." : "Publish Course"}
                </Button>
              </>
            )}
            
            <Button 
  asChild 
  variant="outline" 
  className="mr-2"
>
  <Link 
    href={`/courses/${id}?preview=creator`} 
    target="_blank"
  >
    <Eye className="h-4 w-4 mr-2" />
    Preview
  </Link>
</Button>

          </div>
        </div>
      </div>
      
      <div className="flex-1 container mx-auto p-4 md:p-6">
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="details">Course Details</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>
          
          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <DragDropContext onDragEnd={onDragEnd}>
              <Card>
                <CardHeader>
                  <CardTitle>Course Thumbnail</CardTitle>
                  <CardDescription>
                    Upload an engaging thumbnail image for your course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="relative aspect-video w-full md:w-1/3 bg-muted rounded-lg overflow-hidden">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground text-sm">No thumbnail uploaded</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full md:w-2/3">
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a high-quality image that represents your course. Recommended size: 1280x720 pixels (16:9 ratio).
                      </p>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={uploadThumbnail}
                        accept="image/jpeg, image/png, image/webp"
                        className="hidden"
                      />
                      
                      <Button
                        onClick={handleThumbnailUpload}
                        disabled={isUploading}
                        variant="outline"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? "Uploading..." : "Upload Thumbnail"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Course Curriculum</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Module
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Module</DialogTitle>
                      <DialogDescription>
                        Create a new section of your course to organize your content
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="moduleTitle">Module Title <span className="text-red-500">*</span></Label>
                        <Input
                          id="moduleTitle"
                          value={newModuleTitle}
                          onChange={(e) => setNewModuleTitle(e.target.value)}
                          placeholder="e.g., Introduction to the Course"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="moduleDescription">Module Description</Label>
                        <Textarea
                          id="moduleDescription"
                          value={newModuleDescription}
                          onChange={(e) => setNewModuleDescription(e.target.value)}
                          placeholder="Briefly describe what this module covers"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button
                        onClick={addModule}
                        disabled={isAddingModule || !newModuleTitle.trim()}
                      >
                        {isAddingModule ? "Adding..." : "Add Module"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              {modules.length === 0 ? (
                <Card className="bg-muted/30">
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <List className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">No Modules Yet</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Start building your course by adding modules to organize your content
                    </p>

<Dialog>
  <DialogTrigger asChild>
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Add Your First Module
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add New Module</DialogTitle>
      <DialogDescription>
        Create a new section of your course to organize your content
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="moduleTitle">Module Title <span className="text-red-500">*</span></Label>
        <Input
          id="moduleTitle"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          placeholder="e.g., Introduction to the Course"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="moduleDescription">Module Description</Label>
        <Textarea
          id="moduleDescription"
          value={newModuleDescription}
          onChange={(e) => setNewModuleDescription(e.target.value)}
          placeholder="Briefly describe what this module covers"
        />
      </div>
    </div>
    
    <DialogFooter>
      <Button
        onClick={addModule}
        disabled={isAddingModule || !newModuleTitle.trim()}
      >
        {isAddingModule ? "Adding..." : "Add Module"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
                  </CardContent>
                </Card>
              ) : (
                <Droppable droppableId="modules" type="MODULE" isDropDisabled={false}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {modules.map((module, moduleIndex) => (
                        <Draggable
                          key={module._id}
                          draggableId={module._id}
                          index={moduleIndex}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <Card>
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="mr-2 cursor-move"
                                      >
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      <div>
                                        <CardTitle className="text-base">
                                          {moduleIndex + 1}. {module.title}
                                        </CardTitle>
                                        {module.description && (
                                          <CardDescription className="text-xs mt-1">
                                            {module.description}
                                          </CardDescription>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setActiveModule(module._id)}
                                        className="h-8"
                                      >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Lesson
                                      </Button>
                                      {!course.isPublished && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteModule(module._id)}
                                          className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  {module.lessons && module.lessons.length > 0 ? (
                                    <Droppable droppableId={module._id} type="LESSON" isDropDisabled={false}>
                                      {(provided) => (
                                        <div
                                          {...provided.droppableProps}
                                          ref={provided.innerRef}
                                          className="space-y-2"
                                        >
                                          {module.lessons.map((lesson, lessonIndex) => (
                                            <Draggable
                                              key={lesson._id}
                                              draggableId={lesson._id}
                                              index={lessonIndex}
                                            >
                                              {(provided) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  className="flex items-center justify-between bg-muted/30 p-3 rounded-md"
                                                >
                                                  <div className="flex items-center">
                                                    <div
                                                      {...provided.dragHandleProps}
                                                      className="mr-2 cursor-move"
                                                    >
                                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div className="mr-3">
                                                      {lesson.type === "video" ? (
                                                        <Play className="h-4 w-4 text-primary" />
                                                      ) : lesson.type === "text" ? (
                                                        <FileText className="h-4 w-4 text-primary" />
                                                      ) : lesson.type === "quiz" ? (
                                                        <List className="h-4 w-4 text-primary" />
                                                      ) : (
                                                        <PenTool className="h-4 w-4 text-primary" />
                                                      )}
                                                    </div>
                                                    <div>
                                                      <p className="text-sm font-medium">
                                                        {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                                                      </p>
                                                      {lesson.type === "video" && lesson.content?.duration && (
                                                        <p className="text-xs text-muted-foreground">
                                                          {Math.floor(lesson.content.duration / 60)}m {lesson.content.duration % 60}s
                                                        </p>
                                                      )}
                                                    </div>
                                                    {lesson.isPreview && (
                                                      <Badge variant="outline" className="ml-2 text-xs">
                                                        Preview
                                                      </Badge>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center">
                                                    <Link href={`/creator/courses/${id}/lessons/${lesson._id}`}>
                                                      <Button variant="ghost" size="sm" className="h-8">
                                                        <Edit className="h-3.5 w-3.5" />
                                                      </Button>
                                                    </Link>
                                                    {!course.isPublished && (
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteLesson(module._id, lesson._id)}
                                                        className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                      >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                      </Button>
                                                    )}
                                                  </div>
                                                </div>
                                              )}
                                            </Draggable>
                                          ))}
                                          {provided.placeholder}
                                        </div>
                                      )}
                                    </Droppable>
                                  ) : (
                                    <div className="text-center py-6 bg-muted/30 rounded-md">
                                      <p className="text-sm text-muted-foreground">
                                        No lessons in this module yet
                                      </p>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setActiveModule(module._id)}
                                        className="mt-2"
                                      >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Lesson
                                      </Button>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </DragDropContext>
            
            {/* Add Lesson Dialog */}
            <Dialog open={!!activeModule} onOpenChange={(open) => !open && setActiveModule(null)}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Add New Lesson</DialogTitle>
                  <DialogDescription>
                    Create a lesson for your module
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lessonTitle">Lesson Title <span className="text-red-500">*</span></Label>
                      <Input
                        id="lessonTitle"
                        name="title"
                        value={newLessonData.title}
                        onChange={handleNewLessonChange}
                        placeholder="e.g., Introduction to the Topic"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lessonType">Lesson Type</Label>
                      <Select
                        value={newLessonData.type}
                        onValueChange={handleLessonTypeChange}
                      >
                        <SelectTrigger id="lessonType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lessonDescription">Lesson Description</Label>
                    <Textarea
                      id="lessonDescription"
                      name="description"
                      value={newLessonData.description}
                      onChange={handleNewLessonChange}
                      placeholder="Briefly describe what this lesson covers"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPreview"
                      checked={newLessonData.isPreview}
                      onCheckedChange={(checked) => 
                        setNewLessonData({
                          ...newLessonData,
                          isPreview: !!checked
                        })
                      }
                    />
                    <Label htmlFor="isPreview">
                      Make this lesson available as a preview
                    </Label>
                  </div>
                  
                  {/* Content specific fields based on lesson type */}
                  {newLessonData.type === "video" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="videoUrl">Video URL (YouTube, Vimeo, or direct link)</Label>
                        <Input
                          id="videoUrl"
                          name="videoUrl"
                          value={newLessonData.content.videoUrl}
                          onChange={handleLessonContentChange}
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (in seconds)</Label>
                        <Input
                          id="duration"
                          name="duration"
                          type="number"
                          min="0"
                          value={newLessonData.content.duration}
                          onChange={handleLessonContentChange}
                          placeholder="e.g., 600 for a 10-minute video"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Note: You can edit the lesson after creation to upload a video file directly.
                      </p>
                    </div>
                  )}
                  
                  {newLessonData.type === "text" && (
                    <div className="space-y-2">
                      <Label htmlFor="htmlContent">Lesson Content</Label>
                      <Textarea
                        id="htmlContent"
                        name="htmlContent"
                        value={newLessonData.content.htmlContent}
                        onChange={handleLessonContentChange}
                        placeholder="You can use HTML for formatting"
                        rows={10}
                      />
                    </div>
                  )}
                  
                  {newLessonData.type === "quiz" && (
                    <div className="space-y-2">
                      <Label>Quiz Setup</Label>
                      <p className="text-sm text-muted-foreground">
                        You can add quiz questions after creating the lesson.
                      </p>
                    </div>
                  )}
                  
                  {newLessonData.type === "assignment" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="instructions">Assignment Instructions</Label>
                        <Textarea
                          id="instructions"
                          name="instructions"
                          value={newLessonData.content.instructions}
                          onChange={handleLessonContentChange}
                          placeholder="Explain what students need to do for this assignment"
                          rows={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="submissionType">Submission Type</Label>
                        <Select
                          value={newLessonData.content.submissionType}
                          onValueChange={(value) => 
                            setNewLessonData({
                              ...newLessonData,
                              content: {
                                ...newLessonData.content,
                                submissionType: value
                              }
                            })
                          }
                        >
                          <SelectTrigger id="submissionType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Response</SelectItem>
                            <SelectItem value="link">External Link</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setActiveModule(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addLesson}
                    disabled={isAddingLesson || !newLessonData.title.trim()}
                  >
                    {isAddingLesson ? "Adding..." : "Add Lesson"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          {/* Course Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Edit the basic details of your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    value={courseForm.title}
                    onChange={handleCourseChange}
                    placeholder="e.g., Complete Web Development Bootcamp"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Course Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={courseForm.description}
                    onChange={handleCourseChange}
                    placeholder="Describe what students will learn in your course"
                    rows={5}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                    <Select
                      value={courseForm.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
                      required
                    >
                      <SelectTrigger id="category">
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
                      value={courseForm.level}
                      onValueChange={(value) => handleSelectChange("level", value)}
                    >
                      <SelectTrigger id="level">
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
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>What Students Will Learn</CardTitle>
                <CardDescription>
                  Add key learning outcomes for your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={newLearningPoint}
                    onChange={(e) => setNewLearningPoint(e.target.value)}
                    placeholder="e.g., Build a complete web application from scratch"
                  />
                  <Button
                    type="button"
                    onClick={addLearningPoint}
                    disabled={!newLearningPoint.trim()}
                  >
                    Add
                  </Button>
                </div>
                
                {courseForm.whatYouWillLearn.length > 0 ? (
                  <div className="space-y-2">
                    {courseForm.whatYouWillLearn.map((point, index) => (
                      <div key={index} className="flex items-start group">
                        <div className="p-2 bg-primary/10 rounded mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{point}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLearningPoint(index)}
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No learning outcomes added yet. Adding clear outcomes helps students understand the value of your course.
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Course Requirements</CardTitle>
                <CardDescription>
                  Specify what students need to know before taking this course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="e.g., Basic knowledge of HTML and CSS"
                  />
                  <Button
                    type="button"
                    onClick={addRequirement}
                    disabled={!newRequirement.trim()}
                  >
                    Add
                  </Button>
                </div>
                
                {courseForm.requirements.length > 0 ? (
                  <ul className="space-y-2 list-disc pl-5">
                    {courseForm.requirements.map((req, index) => (
                      <li key={index} className="group flex items-start">
                        <span className="flex-1">{req}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRequirement(index)}
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 ml-2"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No requirements added yet. Let students know what prerequisites they need.
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Course Tags</CardTitle>
                <CardDescription>
                  Add relevant tags to help students find your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="e.g., javascript, programming, web development"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    disabled={!newTag.trim()}
                  >
                    Add
                  </Button>
                </div>
                
                {courseForm.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {courseForm.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="bg-muted px-3 py-1 rounded-full text-sm flex items-center group"
                      >
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTag(index)}
                          className="h-6 w-6 p-0 ml-1 hover:bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No tags added yet. Tags help make your course more discoverable.
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={saveCourse} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Pricing</CardTitle>
                <CardDescription>
                  Set the price and discount options for your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Regular Price (₹)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="1"
                      value={courseForm.price}
                      onChange={handleCourseChange}
                      placeholder="0 for free courses"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Set to 0 for free courses. Paid courses must be priced ₹499 or above.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discountPrice">Discount Price (optional)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="discountPrice"
                      name="discountPrice"
                      type="number"
                      min="0"
                      step="1"
                      value={courseForm.discountPrice}
                      onChange={handleCourseChange}
                      placeholder="Discounted price"
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discountValidUntil">Discount Valid Until (optional)</Label>
                  <div className="relative">
                    <CalendarClock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="discountValidUntil"
                      name="discountValidUntil"
                      type="date"
                      value={courseForm.discountValidUntil}
                      onChange={handleCourseChange}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                {courseForm.discountPrice > 0 && courseForm.discountPrice >= courseForm.price && (
                  <div className="flex items-start bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-yellow-700 dark:text-yellow-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Invalid Discount</h4>
                      <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                        Discount price must be lower than the regular price.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Price Preview</h3>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground">Regular Price:</span>
                      <span className="font-medium">₹{courseForm.price}</span>
                    </div>
                    
                    {courseForm.discountPrice > 0 && courseForm.discountPrice < courseForm.price && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-muted-foreground">Discount Price:</span>
                          <span className="font-medium">₹{courseForm.discountPrice}</span>
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-muted-foreground">Discount Amount:</span>
                          <span className="font-medium text-green-600">
                            ₹{courseForm.price - courseForm.discountPrice} ({Math.round((1 - courseForm.discountPrice / courseForm.price) * 100)}% off)
                          </span>
                        </div>
                        {courseForm.discountValidUntil && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Valid Until:</span>
                            <span className="font-medium">
                              {new Date(courseForm.discountValidUntil).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveCourse} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Pricing"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}