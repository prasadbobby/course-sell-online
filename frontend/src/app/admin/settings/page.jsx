// src/app/admin/settings/page.jsx
"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { 
  Settings, 
  Globe, 
  DollarSign, 
  Mail, 
  Save,
  Server
} from "lucide-react"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Course Platform",
    siteDescription: "A comprehensive online learning platform",
    contactEmail: "support@courseplatform.com",
    enableRegistration: true,
    maintenanceMode: false
  })
  
  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    currency: "INR",
    platformFeePercentage: 20,
    minimumCoursePrice: 499,
    razorpayKeyId: "rzp_test_******",
    razorpayKeySecret: "********"
  })
  
  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.example.com",
    smtpPort: 587,
    smtpUsername: "notifications@courseplatform.com",
    smtpPassword: "********",
    emailFromName: "Course Platform",
    emailFromAddress: "notifications@courseplatform.com"
  })
  
  const handleGeneralSettingsChange = (e) => {
    const { name, value } = e.target
    setGeneralSettings({
      ...generalSettings,
      [name]: value
    })
  }
  
  const handlePaymentSettingsChange = (e) => {
    const { name, value } = e.target
    setPaymentSettings({
      ...paymentSettings,
      [name]: value
    })
  }
  
  const handleEmailSettingsChange = (e) => {
    const { name, value } = e.target
    setEmailSettings({
      ...emailSettings,
      [name]: value
    })
  }
  
  const handleToggleChange = (name, value) => {
    setGeneralSettings({
      ...generalSettings,
      [name]: value
    })
  }
  
  const saveSettings = (type) => {
    setIsSaving(true)
    
    // Simulate API call
    setTimeout(() => {
      toast.success(`${type} settings saved successfully`)
      setIsSaving(false)
    }, 1000)
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Platform Settings</h1>
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure your platform's basic settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        id="siteName"
                        name="siteName"
                        value={generalSettings.siteName}
                        onChange={handleGeneralSettingsChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        value={generalSettings.contactEmail}
                        onChange={handleGeneralSettingsChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    name="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={handleGeneralSettingsChange}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">System Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableRegistration">User Registration</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow new users to register on the platform
                        </p>
                      </div>
                      <Switch
                        id="enableRegistration"
                        checked={generalSettings.enableRegistration}
                        onCheckedChange={(value) => handleToggleChange("enableRegistration", value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Put the platform in maintenance mode (only admins can access)
                        </p>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        checked={generalSettings.maintenanceMode}
                        onCheckedChange={(value) => handleToggleChange("maintenanceMode", value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => saveSettings("General")} 
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Settings"}
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Configure payment processors and financial settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        id="currency"
                        name="currency"
                        value={paymentSettings.currency}
                        onChange={handlePaymentSettingsChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platformFeePercentage">Platform Fee (%)</Label>
                    <Input
                      id="platformFeePercentage"
                      name="platformFeePercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={paymentSettings.platformFeePercentage}
                      onChange={handlePaymentSettingsChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumCoursePrice">Minimum Course Price</Label>
                    <Input
                      id="minimumCoursePrice"
                      name="minimumCoursePrice"
                      type="number"
                      min="0"
                      value={paymentSettings.minimumCoursePrice}
                      onChange={handlePaymentSettingsChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-medium">Razorpay Integration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="razorpayKeyId">API Key ID</Label>
                      <Input
                        id="razorpayKeyId"
                        name="razorpayKeyId"
                        value={paymentSettings.razorpayKeyId}
                        onChange={handlePaymentSettingsChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="razorpayKeySecret">API Key Secret</Label>
                      <Input
                        id="razorpayKeySecret"
                        name="razorpayKeySecret"
                        type="password"
                        value={paymentSettings.razorpayKeySecret}
                        onChange={handlePaymentSettingsChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => saveSettings("Payment")} 
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Settings"}
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Configure SMTP settings for sending emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
              // src/app/admin/settings/page.jsx (continued)
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <div className="flex items-center">
                      <Server className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        id="smtpHost"
                        name="smtpHost"
                        value={emailSettings.smtpHost}
                        onChange={handleEmailSettingsChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      name="smtpPort"
                      type="number"
                      value={emailSettings.smtpPort}
                      onChange={handleEmailSettingsChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input
                      id="smtpUsername"
                      name="smtpUsername"
                      value={emailSettings.smtpUsername}
                      onChange={handleEmailSettingsChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      name="smtpPassword"
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={handleEmailSettingsChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-medium">Email Identity</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="emailFromName">From Name</Label>
                      <Input
                        id="emailFromName"
                        name="emailFromName"
                        value={emailSettings.emailFromName}
                        onChange={handleEmailSettingsChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailFromAddress">From Email Address</Label>
                      <Input
                        id="emailFromAddress"
                        name="emailFromAddress"
                        type="email"
                        value={emailSettings.emailFromAddress}
                        onChange={handleEmailSettingsChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => saveSettings("Email")} 
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Settings"}
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}