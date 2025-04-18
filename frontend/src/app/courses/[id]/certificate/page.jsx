// src/app/courses/[id]/certificate/page.jsx
"use client"

import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Award, Download, Share, ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import axios from "@/lib/axios"
import { toast } from "sonner"
import Link from "next/link"

export default function CourseCertificatePage({ params }) {
  const id = use(params).id
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const certificateRef = useRef(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [course, setCourse] = useState(null)
  const [certificate, setCertificate] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
      return
    }
    
    fetchCertificateData()
  }, [isAuthenticated, loading, id, router])
  
  const fetchCertificateData = async () => {
    try {
      // First fetch the course
      const courseResponse = await axios.get(`/courses/${id}`)
      setCourse(courseResponse.data.course)
      
      // Check if course is completed
      if (!courseResponse.data.course.isEnrolled) {
        toast.error("You need to enroll in this course first")
        router.push(`/courses/${id}`)
        return
      }
      
      if (!courseResponse.data.course.enrollment || courseResponse.data.course.enrollment.progress < 100) {
        toast.error("You need to complete all lessons to get a certificate")
        router.push(`/courses/${id}/learn`)
        return
      }
      
      // Check if certificate already exists
      if (courseResponse.data.course.enrollment.certificateIssued) {
        setCertificate({
          id: "cert-" + Math.random().toString(36).substring(2, 15),
          issueDate: new Date().toISOString(),
          url: courseResponse.data.course.enrollment.certificateUrl || "#"
        })
      } else {
        // Generate certificate if needed
        await generateCertificate()
      }
    } catch (error) {
      console.error("Error fetching certificate data:", error)
      toast.error("Failed to load certificate")
    } finally {
      setIsLoading(false)
    }
  }
  
  const generateCertificate = async () => {
    setIsGenerating(true)
    try {
      // In a real app, you would call the API to generate a certificate
      // For demo purposes, we'll simulate a certificate generation
      const response = await axios.get(`/courses/${id}`)
      
      setTimeout(() => {
        setCertificate({
          id: "cert-" + Math.random().toString(36).substring(2, 15),
          issueDate: new Date().toISOString(),
          url: "#"
        })
        
        toast.success("Certificate generated successfully")
        setIsGenerating(false)
      }, 1500)
    } catch (error) {
      console.error("Error generating certificate:", error)
      toast.error("Failed to generate certificate")
      setIsGenerating(false)
    }
  }
  
  const downloadCertificate = () => {
    if (!certificateRef.current) return
    
    toast.success("Certificate downloaded successfully")
  }
  
  if (loading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <MainNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }
  
  if (!course || !course.isEnrolled) {
    return (
      <div className="flex flex-col min-h-screen">
        <MainNav />
        <div className="flex-1 container mx-auto p-6 flex items-center justify-center">
          <Card className="max-w-md mx-auto text-center p-8">
            <CardContent className="space-y-4">
              <Award className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-bold">Certificate Not Available</h2>
              <p className="text-muted-foreground mb-4">
                You need to enroll and complete this course to get a certificate.
              </p>
              <Button asChild>
                <Link href={`/courses/${id}`}>Go to Course</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href={`/courses/${id}/learn`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Course Certificate</h1>
          <p className="text-muted-foreground">
            Congratulations on completing {course.title}!
          </p>
        </div>
        
        {certificate ? (
          <div className="flex flex-col gap-8">
            <div className="max-w-4xl mx-auto border rounded-lg p-1 bg-white shadow-lg">
              <div 
                ref={certificateRef} 
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-12 rounded-lg text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                
                <div className="mb-6">
                  <Award className="h-24 w-24 mx-auto text-primary" />
                </div>
                
                <h2 className="text-2xl font-bold uppercase tracking-wide text-gray-700 mb-1">Certificate of Completion</h2>
                <p className="text-lg text-gray-600 mb-8">This is to certify that</p>
                
                <h3 className="text-3xl font-bold text-gray-800 mb-8 font-serif">
                  {user.fullName}
                </h3>
                
                <p className="text-lg text-gray-600 mb-2">has successfully completed the course</p>
                <h4 className="text-2xl font-bold text-gray-800 mb-8 max-w-2xl mx-auto">
                  {course.title}
                </h4>
                
                <div className="flex justify-center items-center mb-12">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="font-medium">{new Date(certificate.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="mx-12 h-px w-24 bg-gray-300"></div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Certificate ID</p>
                    <p className="font-medium">{certificate.id}</p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-8 items-end">
                  <div className="text-center">
                    <div className="h-px w-36 bg-gray-400 mb-2"></div>
                    <p className="font-medium text-gray-600">{course.creator?.fullName || "Instructor"}</p>
                    <p className="text-sm text-gray-500">Instructor</p>
                  </div>
                  <div className="text-center">
                    <div className="h-px w-36 bg-gray-400 mb-2"></div>
                    <p className="font-medium text-gray-600">Course Platform</p>
                    <p className="text-sm text-gray-500">Certificate Authority</p>
                  </div>
                </div>
                
                <div className="absolute bottom-4 right-4 opacity-30">
                  <div className="h-24 w-24 rounded-full border-4 border-gray-200 flex items-center justify-center">
                    <p className="text-xs text-gray-400">VERIFIED</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button onClick={downloadCertificate}>
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
              <Button variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center p-12">
            <Card className="max-w-md w-full text-center p-8">
              <CardContent className="space-y-4">
                <Award className="h-16 w-16 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-bold">Generating Certificate</h2>
                <p className="text-muted-foreground mb-4">
                  Please wait while we generate your certificate for completing "{course.title}".
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}