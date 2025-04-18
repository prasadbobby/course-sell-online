"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  PlayCircle, 
  FileText, 
  CheckCircle,
  Home,
  X,
  ListChecks,
  Award
} from "lucide-react"
import axios from "@/lib/axios"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

// Dynamically import video player to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player/lazy"), {
  ssr: false,
})

export default function CourseLearnPage({ params }) {
  const { id } = params
  const searchParams = useSearchParams()
  const lessonId = searchParams.get("lesson")
  
  const { user, isAuthenticated, loading } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [course, setCourse] = useState(null)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [isVideoComplete, setIsVideoComplete] = useState(false)
  const playerRef = useRef(null)
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "/login"
      return
    }
    
    fetchCourseAndLessons()
  }, [isAuthenticated, loading, id])
  
  useEffect(() => {
    if (course && lessonId) {
      loadLesson(lessonId)
    } else if (course && course.enrollment?.lastAccessedLesson) {
      loadLesson(course.enrollment.lastAccessedLesson)
    } else if (course && course.modules && course.modules[0]?.lessons[0]) {
      loadLesson(course.modules[0].lessons[0]._id)
    }
  }, [course, lessonId])
  
  const fetchCourseAndLessons = async () => {
    try {
      const response = await axios.get(`/courses/${id}`)
      setCourse(response.data.course)
    } catch (error) {
      console.error("Error fetching course:", error)
      toast.error("Failed to load course content")
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadLesson = async (lessonId) => {
    try {
      setIsLoading(true)
      const response = await axios.get(`/lessons/${lessonId}`)
      setCurrentLesson(response.data.lesson)
      setVideoProgress(0)
      setIsVideoComplete(false)
      
      // Update URL without reloading
      const url = new URL(window.location)
      url.searchParams.set("lesson", lessonId)
      window.history.pushState({}, "", url)
    } catch (error) {
      console.error("Error loading lesson:", error)
      toast.error("Failed to load lesson content")
    } finally {
      setIsLoading(false)
    }
  }
  
  const markLessonComplete = async () => {
    if (!currentLesson || isMarkingComplete) return
    
    setIsMarkingComplete(true)
    try {
      const response = await axios.post(`/lessons/${currentLesson._id}/complete`)
      
      // Update course progress
      setCourse(prev => ({
        ...prev,
        enrollment: {
          ...prev.enrollment,
          progress: response.data.progress,
          completedLessons: response.data.completedLessons
        }
      }))
      
      toast.success("Lesson marked as complete")
      
      // Move to next lesson if available
      const nextLesson = getNextLesson()
      if (nextLesson) {
        loadLesson(nextLesson._id)
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error)
      toast.error("Failed to mark lesson as complete")
    } finally {
      setIsMarkingComplete(false)
    }
  }
  
  const handleVideoProgress = (state) => {
    // For video lessons, track progress
    if (currentLesson?.type === "video") {
      const progress = (state.playedSeconds / state.loadedSeconds) * 100
      setVideoProgress(progress)
      
      // Mark as complete if watched 90% of the video
      if (progress > 90 && !isVideoComplete) {
        setIsVideoComplete(true)
      }
    }
  }
  
  const getNextLesson = () => {
    if (!course || !currentLesson) return null
    
    let foundCurrent = false
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (foundCurrent) {
          return lesson
        }
        if (lesson._id === currentLesson._id) {
          foundCurrent = true
        }
      }
    }
    return null
  }
  
  const getPreviousLesson = () => {
    if (!course || !currentLesson) return null
    
    let previousLesson = null
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson._id === currentLesson._id) {
          return previousLesson
        }
        previousLesson = lesson
      }
    }
    return null
  }
  
  // Get all lessons in a flat array for navigation
  const getAllLessons = () => {
    if (!course) return []
    
    const allLessons = []
    course.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        allLessons.push({
          ...lesson,
          moduleName: module.title
        })
      })
    })
    return allLessons
  }
  
  const isLessonCompleted = (lessonId) => {
    return course?.enrollment?.completedLessons?.includes(lessonId)
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    )
  }
  
  if (!course || !course.isEnrolled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You are not enrolled in this course.</p>
          <Button asChild>
            <Link href={`/courses/${id}`}>Go to Course Page</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Lesson Selected</h2>
          <p className="text-muted-foreground mb-6">Please select a lesson from the course curriculum.</p>
          <Button asChild>
            <Link href={`/courses/${id}`}>Go to Course Page</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  const nextLesson = getNextLesson()
  const prevLesson = getPreviousLesson()
  const allLessons = getAllLessons()
  const currentIndex = allLessons.findIndex(l => l._id === currentLesson._id)
  const progress = ((currentIndex + 1) / allLessons.length) * 100
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="h-16 border-b bg-background flex items-center justify-between px-4">
        <div className="flex items-center">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
              <SheetHeader className="h-16 border-b flex items-center px-4">
                <SheetTitle className="flex-1">Course Content</SheetTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </SheetHeader>
              <CourseSidebar 
                course={course} 
                currentLesson={currentLesson}
                onSelectLesson={(id) => {
                  loadLesson(id)
                  setIsSidebarOpen(false)
                }}
              />
            </SheetContent>
          </Sheet>
          
          <Link 
            href={`/courses/${id}`}
            className="ml-2 flex items-center text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Back to course</span>
          </Link>
        </div>
        
        <h1 className="text-lg font-medium truncate max-w-md mx-4 text-center hidden sm:block">
          {course.title}
        </h1>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/dashboard">
                    <Home className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Dashboard</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {course.enrollment.progress === 100 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/courses/${id}/certificate`}>
                      <Award className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Certificate</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (hidden on mobile) */}
        <div className="hidden md:block w-80 border-r overflow-hidden">
          <CourseSidebar 
            course={course} 
            currentLesson={currentLesson}
            onSelectLesson={loadLesson}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {/* Lesson Content */}
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
              <div className="mb-6">
                <Badge variant="outline" className="mb-2">
                  {currentLesson.moduleName || "Module"}
                </Badge>
                <h1 className="text-2xl font-bold mb-1">{currentLesson.title}</h1>
                <p className="text-muted-foreground">{currentLesson.description}</p>
              </div>
              
              {currentLesson.type === "video" && (
                <div className="relative aspect-video mb-6 bg-black rounded-md overflow-hidden">
                  <ReactPlayer
                    ref={playerRef}
                    url={currentLesson.content.videoUrl}
                    width="100%"
                    height="100%"
                    controls
                    onProgress={handleVideoProgress}
                    config={{
                      file: {
                        attributes: {
                          controlsList: "nodownload"
                        }
                      }
                    }}
                  />
                </div>
              )}
              
              {currentLesson.type === "text" && (
                <div className="prose prose-sm sm:prose lg:prose-lg max-w-none mb-6">
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.content.htmlContent }} />
                </div>
              )}
              
              {currentLesson.type === "quiz" && (
                <QuizContent 
                  lesson={currentLesson} 
                  onComplete={markLessonComplete} 
                  isCompleted={isLessonCompleted(currentLesson._id)}
                />
              )}
              
              {currentLesson.type === "assignment" && (
                <AssignmentContent 
                  lesson={currentLesson} 
                  courseId={id}
                  onComplete={markLessonComplete}
                  isCompleted={isLessonCompleted(currentLesson._id)}
                />
              )}
            </div>
          </div>
          
          {/* Footer Navigation */}
          <div className="h-16 border-t bg-background flex items-center justify-between px-4">
            <div>
              {prevLesson && (
                <Button 
                  variant="ghost" 
                  className="flex items-center" 
                  onClick={() => loadLesson(prevLesson._id)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex-1 max-w-md mx-4 hidden sm:block">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.round(course.enrollment.progress)}%</span>
              </div>
              <Progress value={course.enrollment.progress} className="h-2" />
            </div>
            
            <div className="flex items-center gap-2">
              {!isLessonCompleted(currentLesson._id) ? (
                <Button 
                  onClick={markLessonComplete} 
                  disabled={isMarkingComplete}
                >
                  {isMarkingComplete ? "Marking..." : "Mark as Complete"}
                </Button>
              ) : (
                <Button variant="outline" disabled className="text-green-600 border-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed
                </Button>
              )}
              
              {nextLesson && (
                <Button 
                  onClick={() => loadLesson(nextLesson._id)}
                  className="ml-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Course Sidebar Component
function CourseSidebar({ course, currentLesson, onSelectLesson }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex justify-between text-sm mb-1">
          <span>Course Progress</span>
          <span className="font-medium">{Math.round(course.enrollment.progress)}%</span>
        </div>
        <Progress value={course.enrollment.progress} className="h-2" />
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          {course.modules.map((module, moduleIndex) => (
            <div key={module._id} className="mb-6">
              <div className="font-medium mb-2">
                {moduleIndex + 1}. {module.title}
              </div>
              <ul className="space-y-1">
                {module.lessons.map((lesson, lessonIndex) => {
                  const isActive = currentLesson?._id === lesson._id;
                  const isCompleted = course.enrollment?.completedLessons?.includes(lesson._id);
                  
                  return (
                    <li 
                      key={lesson._id}
                      className={`pl-6 py-2 relative rounded-md text-sm ${
                        isActive 
                          ? 'bg-muted font-medium' 
                          : isCompleted 
                          ? 'text-muted-foreground' 
                          : ''
                      }`}
                    >
                      <button
                        onClick={() => onSelectLesson(lesson._id)}
                        className="flex items-start w-full text-left"
                      >
                        <span className="absolute left-0 top-2">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : lesson.type === 'video' ? (
                            <PlayCircle className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </span>
                        <span>
                          {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Quiz Content Component
function QuizContent({ lesson, onComplete, isCompleted }) {
  const [answers, setAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  
  const handleAnswerChange = (questionIndex, answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all questions are answered
    if (answers.length !== lesson.content.questions.length) {
      toast.error("Please answer all questions");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await axios.post(`/lessons/${lesson._id}/quiz`, { answers });
      setResults(response.data);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isCompleted || results) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <h3 className="font-medium">Quiz Completed</h3>
          </div>
          {results && (
            <div className="mt-2">
              <p className="font-medium">Your Score: {Math.round(results.score)}%</p>
              <p className="text-sm text-muted-foreground mt-1">
                You got {results.results.filter(r => r.isCorrect).length} out of {results.results.length} questions correct
              </p>
            </div>
          )}
        </div>
        
        {results && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Quiz Results</h3>
            {results.results.map((result, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-md border ${
                  result.isCorrect 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <p className="font-medium mb-2">Question {index + 1}: {lesson.content.questions[index].question}</p>
                <div className="ml-6 space-y-1">
                  {lesson.content.questions[index].options.map((option, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center ${
                        i === result.userAnswer 
                          ? result.isCorrect 
                            ? 'text-green-700 dark:text-green-400' 
                            : 'text-red-700 dark:text-red-400'
                          : i === lesson.content.questions[index].correctOption
                          ? 'text-green-700 dark:text-green-400'
                          : ''
                      }`}
                    >
                      {i === result.userAnswer ? (
                        result.isCorrect ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <X className="h-4 w-4 mr-2" />
                        )
                      ) : i === lesson.content.questions[index].correctOption ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <div className="w-4 h-4 mr-2" />
                      )}
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {lesson.content.questions.map((question, qIndex) => (
          <div key={qIndex} className="space-y-4">
            <h3 className="font-medium">Question {qIndex + 1}: {question.question}</h3>
            <div className="ml-6 space-y-2">
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`q${qIndex}-o${oIndex}`}
                    name={`question-${qIndex}`}
                    checked={answers[qIndex] === oIndex}
                    onChange={() => handleAnswerChange(qIndex, oIndex)}
                    className="h-4 w-4 text-primary"
                  />
                  <label htmlFor={`q${qIndex}-o${oIndex}`}>{option}</label>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <Button type="submit" disabled={isSubmitting || answers.length !== lesson.content.questions.length}>
          {isSubmitting ? "Submitting..." : "Submit Quiz"}
        </Button>
      </form>
    </div>
  );
}

// Assignment Content Component
function AssignmentContent({ lesson, courseId, onComplete, isCompleted }) {
  const [submission, setSubmission] = useState("");
  const [submissionType, setSubmissionType] = useState(lesson.content.submissionType || "text");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(isCompleted);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!submission) {
      toast.error("Please provide a submission");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await axios.post(`/lessons/${lesson._id}/assignment`, { 
        submission, 
        submissionType 
      });
      
      toast.success("Assignment submitted successfully");
      setSubmitted(true);
      onComplete();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <h3 className="font-medium">Assignment Submitted</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Your submission has been recorded. Continue with the course.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="prose prose-sm sm:prose max-w-none mb-6">
        <div dangerouslySetInnerHTML={{ __html: lesson.content.instructions }} />
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {submissionType === "text" && (
          <div className="space-y-2">
            <Label htmlFor="submission">Your Answer</Label>
            <Textarea
              id="submission"
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[200px]"
              required
            />
          </div>
        )}
        
        {submissionType === "link" && (
          <div className="space-y-2">
            <Label htmlFor="submission-link">Submission Link</Label>
            <Input
              id="submission-link"
              type="url"
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              placeholder="https://example.com/your-submission"
              required
            />
            <p className="text-sm text-muted-foreground">
              Provide a link to your completed assignment (Google Drive, GitHub, etc.)
            </p>
          </div>
        )}
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Assignment"}
        </Button>
      </form>
    </div>
  );
}