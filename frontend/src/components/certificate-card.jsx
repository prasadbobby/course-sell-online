// frontend/src/components/certificate-card.jsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"
import Image from "next/image"

export function CertificateCard({ certificate, course }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-40 bg-primary/10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Image 
                src="/certificate-badge.svg" 
                alt="Certificate" 
                width={80} 
                height={80} 
                className="mx-auto mb-2"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <CardTitle className="mb-2 text-lg">{course.title}</CardTitle>
        <p className="text-sm text-muted-foreground mb-4">
          Completed on {new Date(certificate.issueDate).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between p-6 pt-0">
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
      </CardFooter>
    </Card>
  );
}