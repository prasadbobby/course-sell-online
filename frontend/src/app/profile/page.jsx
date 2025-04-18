"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import axios from "@/lib/axios"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { Upload, User, Mail, Key } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ProfilePage() {
  const { user, isAuthenticated, loading, updateProfile } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef(null)
  
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    socialLinks: {
      website: user?.socialLinks?.website || "",
      youtube: user?.socialLinks?.youtube || "",
      linkedin: user?.socialLinks?.linkedin || "",
      twitter: user?.socialLinks?.twitter || ""
    }
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  if (!isAuthenticated) {
    router.push("/login")
    return null
  }
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData({
      ...profileData,
      [name]: value
    })
  }
  
  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target
    setProfileData({
      ...profileData,
      socialLinks: {
        ...profileData.socialLinks,
        [name]: value
      }
    })
  }
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value
    })
  }
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    
    try {
      await updateProfile({
        fullName: profileData.fullName,
        bio: profileData.bio,
        socialLinks: profileData.socialLinks
      })
      
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match")
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }
    
    setIsUpdating(true)
    
    try {
      // Implement password change
      await axios.put("/users/me/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      toast.success("Password updated successfully")
      
      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    } catch (error) {
      console.error("Error updating password:", error)
      toast.error(error.response?.data?.message || "Failed to update password")
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleProfileImageClick = () => {
    fileInputRef.current.click()
  }
  
  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or WebP)")
      return
    }
    
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      console.log('Creating form data with file:', file.name, file.type, file.size)
      
      // Upload profile image
      const response = await axios.post("/users/me/profile-image", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('Upload response:', response.data)
      
      toast.success("Profile image updated successfully")
      
      // Update the user in auth context 
      if (response.data.user && response.data.user.profileImage) {
        // Use updateProfile from auth context instead of undefined updateUserWithNewImage
        updateProfile({
          ...user,
          profileImage: response.data.user.profileImage
        });
      }
    } catch (error) {
      console.error("Error uploading profile image:", error)
      
      // More robust error logging
      if (error.response) {
        console.error("Error response data:", error.response.data)
        console.error("Error response status:", error.response.status)
      } else if (error.request) {
        console.error("No response received:", error.request)
      } else {
        console.error("Error message:", error.message)
      }
      
      toast.error("Failed to upload profile image")
    } finally {
      setIsUploading(false)
    }
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="flex-1 container mx-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and account settings
            </p>
          </div>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="password">Password & Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details and public profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Image */}
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div 
                      className="relative h-24 w-24 rounded-full overflow-hidden cursor-pointer" 
                      onClick={handleProfileImageClick}
                    >
                      <Image
                        src={user?.profileImage || "https://placehold.co/96"}
                        alt={user?.fullName || "User"}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Upload className="h-5 w-5 text-white" />
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleProfileImageChange}
                        accept="image/jpeg, image/png, image/webp"
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{user?.fullName}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {user?.email}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleProfileImageClick}
                        disabled={isUploading}
                      >
                        {isUploading ? "Uploading..." : "Change Profile Picture"}
                      </Button>
                    </div>
                  </div>

                  
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Label htmlFor="fullName">Full Name</Label>
                      </div>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleProfileChange}
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Label htmlFor="email">Email Address</Label>
                      </div>
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your email address cannot be changed
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        placeholder="Tell us about yourself"
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <Label>Social Links</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="website" className="text-xs">Website</Label>
                          <Input
                            id="website"
                            name="website"
                            type="url"
                            value={profileData.socialLinks.website}
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
                            value={profileData.socialLinks.youtube}
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
                            value={profileData.socialLinks.linkedin}
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
                            value={profileData.socialLinks.twitter}
                            onChange={handleSocialLinkChange}
                            placeholder="https://twitter.com/yourhandle"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Password & Security</CardTitle>
                  <CardDescription>
                    Update your password and manage security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Label htmlFor="currentPassword">Current Password</Label>
                      </div>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        minLength={6}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        minLength={6}
                        required
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  )
}