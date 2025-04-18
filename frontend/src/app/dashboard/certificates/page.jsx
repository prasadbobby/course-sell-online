// src/app/dashboard/certificates/page.jsx
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Download, Eye } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function CertificatesPage() {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      // In a real app, you would fetch from an API
      // For now, let's use dummy data
      setTimeout(() => {
        setCertificates([
          {
            id: 1,
            courseTitle: "Complete Web Development Bootcamp",
            issueDate: "2023-04-15",
            url: "#"
          },
          {
            id: 2,
            courseTitle: "Advanced JavaScript Mastery",
            issueDate: "2023-06-22",
            url: "#"
          }
        ])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching certificates:", error)
      toast.error("Failed to load certificates")
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Certificates</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <Card key={certificate.id}>
                <CardHeader className="p-0">
                  <div className="relative h-40 bg-primary/10 flex items-center justify-center">
                    <Award className="h-16 w-16 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="mb-2 text-lg">{certificate.courseTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-4">
                    Completed on {new Date(certificate.issueDate).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a href={certificate.url} target="_blank" rel="noopener noreferrer">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </a>
                    </Button>
                    <Button asChild size="sm">
                      <a href={certificate.url} download>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No certificates yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete courses to earn certificates.
            </p>
            <Button asChild>
              <a href="/courses">Browse Courses</a>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}