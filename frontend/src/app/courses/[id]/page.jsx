"use client"

import { useState, useEffect,use} from "react"
import { useSearchParams } from "next/navigation" 
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  PlayCircle, 
  FileText, 
  Check, 
  Lock, 
  Clock, 
  BarChart, 
  Users, 
  Award,
  BookOpen,
  ListChecks,
  ShoppingCart
} from "lucide-react"
import axios from "@/lib/axios"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox";


export default function CourseDetailPage({ params }) {
    const id = use(params).id
    const searchParams = useSearchParams()
    const isCreatorPreview = searchParams.get('preview') === 'creator'
    
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()
    
    const [course, setCourse] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEnrolling, setIsEnrolling] = useState(false)
    
    useEffect(() => {
      fetchCourseDetails()
    }, [id, isCreatorPreview])
    
    const fetchCourseDetails = async () => {
      try {
        console.log("Fetching course with ID:", id);
        console.log("Is creator preview:", isCreatorPreview);
        
        let response;
        
        if (isCreatorPreview && isAuthenticated && user?.role === 'creator') {
          // Use the creator preview endpoint
          console.log("Fetching from creator preview endpoint");
          response = await axios.get(`/creator/courses/${id}/preview`);
        } else {
          // Use regular course endpoint
          console.log("Fetching from regular course endpoint");
          response = await axios.get(`/courses/${id}`);
        }
        
        console.log("Course data received:", response.data);
        
        // Make sure we handle enrollment status correctly
        if (response.data.course) {
          setCourse({
            ...response.data.course,
            isEnrolled: !!response.data.course.isEnrolled
          });
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        console.error("Response data:", error.response?.data);
        toast.error("Failed to load course details");
      } finally {
        setIsLoading(false);
      }
    };
    
  
  
  const enrollFreeCourse = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${id}`)
      return
    }
    
    setIsEnrolling(true)
    try {
      const response = await axios.post(`/courses/${id}/enroll`)
      toast.success("Successfully enrolled in the course")
      setCourse({
        ...course,
        isEnrolled: true,
        enrollment: response.data.enrollment
      })
    } catch (error) {
      console.error("Error enrolling:", error)
      toast.error(error.response?.data?.message || "Failed to enroll in the course")
    } finally {
      setIsEnrolling(false)
    }
  }
  
const initiatePayment = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${id}`);
      return;
    }
    
    setIsEnrolling(true);
    try {
      console.log("Creating payment order for course:", id);
      const response = await axios.post('/payments/create-order', {
        courseId: id
      });
      
      console.log("Payment order created:", response.data);
      
      // Initialize orderID and paymentId variables
      const orderId = response.data.order.id;
      const paymentId = response.data.payment.id;
      
      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: response.data.order.amount,
        currency: response.data.order.currency,
        name: "Course Platform",
        description: `Payment for ${course.title}`,
        order_id: orderId,
        handler: function(response) {
          verifyPayment(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature,
            paymentId
          );
        },
        prefill: {
          name: user.fullName,
          email: user.email
        },
        theme: {
          color: "#0066ff"
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Failed to initialize payment");
      setIsEnrolling(false);
    }
  };
  
  const verifyPayment = async (razorpayPaymentId, razorpayOrderId, razorpaySignature, paymentId) => {
    try {
      const response = await axios.post('/payments/verify', {
        paymentId,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature
      });
      
      toast.success("Payment successful! You're now enrolled.");
      setCourse({
        ...course,
        isEnrolled: true,
        enrollment: response.data.enrollment
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Payment verification failed");
    } finally {
      setIsEnrolling(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <MainNav />
        <div className="flex-1 container mx-auto p-4 flex items-center justify-center">
          <div>Loading course details...</div>
        </div>
        <Footer />
      </div>
    )
  }
  
  if (!course) {
    return (
      <div className="flex flex-col min-h-screen">
        <MainNav />
        <div className="flex-1 container mx-auto p-4 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
            <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      
      {/* Course Header */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto p-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Course Info */}
            <div className="md:w-2/3">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="outline" className="capitalize">{course.level}</Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              
              <p className="text-lg mb-6">{course.description}</p>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  <div className="text-yellow-500 mr-1">★</div>
                  <span className="font-medium">{course.rating?.average || "New"}</span>
                  {course.rating?.count > 0 && (
                    <span className="text-muted-foreground text-sm ml-1">
                      ({course.rating.count} ratings)
                    </span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{course.enrolledStudents} students</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{course.totalDuration} minutes</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Image
                      src={course.creator.profileImage || "https://placehold.co/100"}
                      alt={course.creator.fullName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-2">
                    <p className="font-medium">{course.creator.fullName}</p>
                    <p className="text-xs text-muted-foreground">Instructor</p>
                  </div>
                </div>
                
                <div className="ml-auto md:hidden">
                {!course.isEnrolled ? (
  course.price === 0 ? (
    <Button 
      className="w-full" 
      size="lg"
      onClick={enrollFreeCourse}
      disabled={isEnrolling}
    >
      {isEnrolling ? "Enrolling..." : "Enroll Now"}
    </Button>
  ) : (
    <Button 
      className="w-full" 
      size="lg"
      onClick={initiatePayment}
      disabled={isEnrolling}
    >
      {isEnrolling ? "Processing..." : (
        <span className="flex items-center">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Buy Now
        </span>
      )}
    </Button>
  )
) : (
  <Button asChild className="w-full" size="lg">
    <Link href={`/courses/${id}/learn`}>
      Continue Learning
    </Link>
  </Button>
)}

                </div>
              </div>
            </div>
            
            {/* Course Card */}
            <div className="md:w-1/3">
              <div className="bg-background rounded-lg border shadow-sm overflow-hidden sticky top-20">
                <div className="relative h-48 w-full">
                  <Image
                    src={course.thumbnail || "https://placehold.co/800x450?text=Course+Thumbnail"}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  {course.isEnrolled && course.enrollment && (
                    <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Your progress</span>
                        <span className="font-medium">{Math.round(course.enrollment.progress)}%</span>
                      </div>
                      <Progress value={course.enrollment.progress} className="h-2" />
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <div className="mb-4">
                    {course.discountPrice > 0 && 
                     course.discountValidUntil && 
                     new Date(course.discountValidUntil) > new Date() ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">₹{course.discountPrice}</span>
                        <span className="text-muted-foreground line-through">₹{course.price}</span>
                        <Badge variant="outline" className="ml-2 text-green-600">
                          Save {Math.round((1 - course.discountPrice / course.price) * 100)}%
                        </Badge>
                      </div>
                    ) : course.price === 0 ? (
                      <span className="text-2xl font-bold text-green-600">Free</span>
                    ) : (
                      <span className="text-2xl font-bold">₹{course.price}</span>
                    )}
                  </div>
                  
                  {!course.isEnrolled ? (
                    <div className="space-y-3">
                      {course.price === 0 ? (
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={enrollFreeCourse}
                          disabled={isEnrolling}
                        >
                          {isEnrolling ? "Enrolling..." : "Enroll Now"}
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={initiatePayment}
                          disabled={isEnrolling}
                        >
                          {isEnrolling ? "Processing..." : (
                            <span className="flex items-center">
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Buy Now
                            </span>
                          )}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button asChild className="w-full" size="lg">
                      <Link href={`/courses/${id}/learn`}>
                        Continue Learning
                      </Link>
                    </Button>
                  )}
                  
                  <div className="mt-6 space-y-4">
                    <div className="flex items-start gap-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Course Content</span>
                        <p className="text-sm text-muted-foreground">
                          {course.totalLessons} lessons • {course.totalDuration} minutes
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Award className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Certificate</span>
                        <p className="text-sm text-muted-foreground">
                          Earn a certificate upon completion
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <BarChart className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Skill Level</span>
                        <p className="text-sm text-muted-foreground capitalize">
                          {course.level}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Content */}
      <div className="container mx-auto p-4 py-8">
        <Tabs defaultValue="curriculum" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="curriculum" className="space-y-6">
            <h2 className="text-xl font-bold">Course Content</h2>
            <div className="text-sm text-muted-foreground mb-4">
              {course.totalLessons} lessons • {course.totalDuration} minutes total length
            </div>
            
            <Accordion type="multiple" className="space-y-4">
              {course.modules?.map((module, index) => (
                <AccordionItem
                  key={module._id}
                  value={module._id}
                  className="border rounded-lg"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="text-left">
                        <span className="font-medium">
                          {index + 1}. {module.title}
                        </span>
                        <div className="text-xs text-muted-foreground mt-1">
                          {module.lessons.length} lessons
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0">
                    {module.lessons.map((lesson, i) => (
                      <div
                        key={lesson._id}
                        className={`flex items-center justify-between p-4 border-t ${
                          course.enrollment?.completedLessons?.includes(lesson._id) 
                            ? "bg-muted/20" 
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {lesson.type === "video" ? (
                            <PlayCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                          ) : (
                            <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-medium">
                              {index + 1}.{i + 1} {lesson.title}
                            </div>
                            {lesson.type === "video" && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          {course.isEnrolled ? (
                            course.enrollment?.completedLessons?.includes(lesson._id) ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <Link 
                                href={`/courses/${id}/learn?lesson=${lesson._id}`}
                                className="text-sm text-primary hover:underline"
                              >
                                Start
                              </Link>
                            )
                          ) : lesson.isPreview ? (
                            <Badge variant="outline" className="text-xs">Preview</Badge>
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="space-y-6">
              <h2 className="text-xl font-bold">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.whatYouWillLearn?.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {course.requirements?.length > 0 && (
              <div className="space-y-4 border-t pt-6">
                <h2 className="text-xl font-bold">Requirements</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {course.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {course.description && (
              <div className="space-y-4 border-t pt-6">
                <h2 className="text-xl font-bold">Description</h2>
                <div className="whitespace-pre-line">
                  {course.description}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="instructor" className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="relative h-24 w-24 rounded-full overflow-hidden">
                <Image
                  src={course.creator.profileImage || "https://placehold.co/200"}
                  alt={course.creator.fullName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">{course.creator.fullName}</h2>
                <p className="text-muted-foreground">Instructor</p>
                
                {course.creator.bio && (
                  <p className="mt-4">{course.creator.bio}</p>
                )}
                
                {course.creator.socialLinks && Object.values(course.creator.socialLinks).some(link => link) && (
                  <div className="mt-4 flex items-center gap-4">
                    {course.creator.socialLinks.website && (
                      <Link 
                        href={course.creator.socialLinks.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Website
                      </Link>
                    )}
                    {course.creator.socialLinks.linkedin && (
                      <Link 
                        href={course.creator.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        LinkedIn
                      </Link>
                    )}
                    {course.creator.socialLinks.twitter && (
                      <Link 
                        href={course.creator.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Twitter
                      </Link>
                    )}
                    {course.creator.socialLinks.youtube && (
                      <Link 
                        href={course.creator.socialLinks.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        YouTube
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  )
}