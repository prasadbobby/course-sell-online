"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  CheckCircle2,
  Upload
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function CreatorOnboarding() {
  const { user, updateProfile } = useAuth()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    bio: user?.bio || "",
    experience: "",
    expertise: "",
    reason: "",
    socialLinks: {
      website: user?.socialLinks?.website || "",
      youtube: user?.socialLinks?.youtube || "",
      linkedin: user?.socialLinks?.linkedin || "",
      twitter: user?.socialLinks?.twitter || ""
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      socialLinks: {
        ...formData.socialLinks,
        [name]: value
      }
    })
  }
  


const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // First update the profile with bio and social links
      await updateProfile({
        bio: formData.bio,
        socialLinks: formData.socialLinks
      })
      
      // Check if user is already a creator (might just need status update)
      if (user.role === "creator" && user.creatorStatus === "pending") {
        // Just update the creator application details without changing role
        await axios.post("/users/update-creator-application", {
          experience: formData.experience,
          expertise: formData.expertise,
          reason: formData.reason
        })
      } else {
        // Normal creator application
        await axios.post("/users/become-creator", {
          experience: formData.experience,
          expertise: formData.expertise,
          reason: formData.reason
        })
      }
      
      toast.success("Your creator profile is now complete!")
      router.push('/creator/dashboard')
    } catch (error) {
      console.error("Error submitting creator info:", error)
      toast.error(error.response?.data?.message || "Failed to complete onboarding")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="flex-1 container mx-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Complete Your Creator Profile</h1>
            <p className="text-muted-foreground">
              Tell us more about yourself to help students know you better
            </p>
          </div>
          
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                Step {step} of 2
              </span>
              <span className="text-sm text-muted-foreground">
                {step === 1 ? "Basic Information" : "Creator Details"}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${(step / 2) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Tell us about yourself and your expertise
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself and your teaching experience"
                      rows={5}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      This will be displayed on your instructor profile
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Social Links (Optional)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-xs">Website</Label>
                        <Input
                          id="website"
                          name="website"
                          type="url"
                          value={formData.socialLinks.website}
                          onChange={handleSocialLinkChange}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="youtube" className="text-xs">YouTube</Label>
                        <Input
                          id="youtube"
                          name="youtube"
                          type="url"
                          value={formData.socialLinks.youtube}
                          onChange={handleSocialLinkChange}
                          placeholder="https://youtube.com/@yourchannel"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="text-xs">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          name="linkedin"
                          type="url"
                          value={formData.socialLinks.linkedin}
                          onChange={handleSocialLinkChange}
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter" className="text-xs">Twitter</Label>
                        <Input
                          id="twitter"
                          name="twitter"
                          type="url"
                          value={formData.socialLinks.twitter}
                          onChange={handleSocialLinkChange}
                          placeholder="https://twitter.com/yourhandle"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="button" onClick={() => setStep(2)}>
                    Continue
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Creator Details</CardTitle>
                  <CardDescription>
                    Share more about your teaching experience and goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Teaching Experience <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="Describe your teaching experience, including any formal or informal teaching roles"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expertise">Areas of Expertise <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="expertise"
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleChange}
                      placeholder="List your main areas of expertise and subjects you plan to teach"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reason">Why do you want to teach? <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Tell us why you want to become an instructor on our platform"
                      rows={3}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Complete Setup"}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </form>
          
          {/* Info Card */}
          <div className="mt-8">
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary">What happens after submission?</h3>
                    <p className="text-sm mt-1">
                      After completing your profile, our team will review your application. 
                      Most applications are reviewed within 2-3 business days. 
                      Once approved, you'll be able to create and publish courses on the platform.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}