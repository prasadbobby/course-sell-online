"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import {
  Users,
  BookOpen,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  User
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [pendingCourses, setPendingCourses] = useState([])
  const [pendingCreators, setPendingCreators] = useState([])
  const [pendingPayouts, setPendingPayouts] = useState([])
  
  // Active dialog state
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedCreator, setSelectedCreator] = useState(null)
  const [selectedPayout, setSelectedPayout] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
      return
    }
    
    if (isAuthenticated) {
      if (user.role !== "admin") {
        router.push("/dashboard")
        return
      }
      
      fetchAnalytics()
      fetchPendingCourses()
      fetchPendingCreators()
      fetchPendingPayouts()
    }
  }, [isAuthenticated, loading, user, router])
  
  const fetchAnalytics = async () => {
    try {
      const response = await axios.get("/admin/analytics")
      setAnalytics(response.data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast.error("Failed to load analytics data")
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchPendingCourses = async () => {
    try {
      const response = await axios.get("/admin/courses?isApproved=false&isPublished=true")
      setPendingCourses(response.data.courses)
    } catch (error) {
      console.error("Error fetching pending courses:", error)
    }
  }
  
  const fetchPendingCreators = async () => {
    try {
      const response = await axios.get("/admin/users?role=creator&creatorStatus=pending")
      setPendingCreators(response.data.users)
    } catch (error) {
      console.error("Error fetching pending creators:", error)
    }
  }
  
  const fetchPendingPayouts = async () => {
    // In a real implementation, there would be an endpoint for pending payouts
    // This is a placeholder for demonstration
    setPendingPayouts([])
  }
  
  const approveCourse = async (approved) => {
    if (!selectedCourse) return
    
    setIsProcessing(true)
    try {
      await axios.put(`/admin/courses/${selectedCourse._id}/approve`, {
        isApproved: approved
      })
      
      // Update the pending courses list
      setPendingCourses(pendingCourses.filter(course => course._id !== selectedCourse._id))
      
      toast.success(`Course ${approved ? 'approved' : 'rejected'} successfully`)
      setSelectedCourse(null)
    } catch (error) {
      console.error("Error updating course:", error)
      toast.error("Failed to update course status")
    } finally {
      setIsProcessing(false)
    }
  }
  
  const approveCreator = async (approved) => {
    if (!selectedCreator) return
    
    setIsProcessing(true)
    try {
      await axios.put(`/admin/users/${selectedCreator._id}`, {
        creatorStatus: approved ? 'approved' : 'rejected'
      })
      
      // Update the pending creators list
      setPendingCreators(pendingCreators.filter(creator => creator._id !== selectedCreator._id))
      
      toast.success(`Creator ${approved ? 'approved' : 'rejected'} successfully`)
      setSelectedCreator(null)
    } catch (error) {
      console.error("Error updating creator:", error)
      toast.error("Failed to update creator status")
    } finally {
      setIsProcessing(false)
    }
  }
  
  const processPayout = async () => {
    if (!selectedPayout) return
    
    setIsProcessing(true)
    try {
      await axios.post("/admin/payouts", {
        creatorId: selectedPayout.creatorId
      })
      
      // Update the pending payouts list
      setPendingPayouts(pendingPayouts.filter(payout => payout.creatorId !== selectedPayout.creatorId))
      
      toast.success("Payout processed successfully")
      setSelectedPayout(null)
    } catch (error) {
      console.error("Error processing payout:", error)
      toast.error("Failed to process payout")
    } finally {
      setIsProcessing(false)
    }
  }
  
  if (loading || (isAuthenticated && user.role !== "admin")) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage the platform and monitor key metrics
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.users.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analytics?.users.students || 0} students, {analytics?.users.creators || 0} creators
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.courses.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {analytics?.courses.approved || 0} published, {analytics?.courses.pending || 0} pending
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{analytics?.revenue.total.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                ₹{analytics?.revenue.platform.toLocaleString() || 0} platform fees
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.enrollments || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total course enrollments
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <h2 className="text-xl font-semibold">Platform Overview</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {analytics?.monthlyRevenue ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analytics.monthlyRevenue}
                          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`₹${value}`, 'Amount']}
                          />
                          <Legend />
                          <Bar 
                            dataKey="revenue" 
                            name="Total Revenue" 
                            fill="#0088FE" 
                          />
                          <Bar 
                            dataKey="platformRevenue" 
                            name="Platform Revenue" 
                            fill="#00C49F" 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Loading chart data...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* User Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {analytics?.users ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Students', value: analytics.users.students },
                              { name: 'Creators', value: analytics.users.creators },
                              { name: 'Admins', value: analytics.users.total - analytics.users.students - analytics.users.creators }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: 'Students', value: analytics.users.students },
                              { name: 'Creators', value: analytics.users.creators },
                              { name: 'Admins', value: analytics.users.total - analytics.users.students - analytics.users.creators }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Users']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Loading chart data...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Pending Approvals */}
            <h2 className="text-xl font-semibold mt-8">Pending Approvals</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pending Courses */}
              <Card>
                <CardHeader>
                  <CardTitle>Courses Pending Review</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingCourses.length > 0 ? (
                    <div className="space-y-4">
                      {pendingCourses.slice(0, 3).map((course) => (
                        <div key={course._id} className="flex items-start space-x-4">
                          <div className="relative h-16 w-16 rounded overflow-hidden">
                            <Image
                              src={course.thumbnail || "https://via.placeholder.com/64"}
                              alt={course.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{course.title}</p>
                            <p className="text-sm text-muted-foreground">
                              by {course.creator?.fullName || "Unknown Creator"}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedCourse(course)}
                              >
                                Review
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {pendingCourses.length > 3 && (
                        <div className="mt-4 text-center">
                          <Button asChild variant="link">
                            <Link href="/admin/courses?filter=pending">
                              View all {pendingCourses.length} pending courses
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="font-medium">No pending courses</p>
                      <p className="text-sm text-muted-foreground">
                        All courses have been reviewed
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Pending Creators */}
              <Card>
                <CardHeader>
                  <CardTitle>Creator Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingCreators.length > 0 ? (
                    <div className="space-y-4">
                      {pendingCreators.slice(0, 3).map((creator) => (
                        <div key={creator._id} className="flex items-start space-x-4">
                          <div className="relative h-12 w-12 rounded-full overflow-hidden">
                            <Image
                              src={creator.profileImage || "https://via.placeholder.com/48"}
                              alt={creator.fullName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{creator.fullName}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {creator.email}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedCreator(creator)}
                              >
                                Review
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {pendingCreators.length > 3 && (
                        <div className="mt-4 text-center">
                          <Button asChild variant="link">
                            <Link href="/admin/users?role=creator&creatorStatus=pending">
                              View all {pendingCreators.length} pending applications
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="font-medium">No pending applications</p>
                      <p className="text-sm text-muted-foreground">
                        All creator applications have been reviewed
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage Courses</h2>
              <div className="flex items-center space-x-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="draft">Drafts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingCourses.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="relative h-10 w-10 rounded overflow-hidden">
                              <Image
                                src={course.thumbnail || "https://via.placeholder.com/40"}
                                alt={course.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="font-medium max-w-[200px] truncate">
                              {course.title}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {course.creator?.fullName || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {course.enrolledStudents || 0}
                        </TableCell>
                        <TableCell>
                          ₹{course.price}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedCourse(course)}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {pendingCourses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-muted-foreground">No courses to display</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage Users</h2>
              <div className="flex items-center space-x-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="creator">Creators</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingCreators.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="relative h-10 w-10 rounded-full overflow-hidden">
                              <Image
                                src={user.profileImage || "https://via.placeholder.com/40"}
                                alt={user.fullName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="font-medium">
                              {user.fullName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Pending Approval
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedCreator(user)}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {pendingCreators.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-muted-foreground">No users to display</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="finance" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Financial Overview</h2>
              <div className="flex items-center space-x-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Financial data not available</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Course Review Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Course</DialogTitle>
            <DialogDescription>
              Review the course details before approving or rejecting
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourse && (
            <div className="space-y-4 py-4">
              <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-4">
                <Image
                  src={selectedCourse.thumbnail || "https://via.placeholder.com/800x450"}
                  alt={selectedCourse.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div>
                <h3 className="font-medium text-lg">{selectedCourse.title}</h3>
                <p className="text-sm text-muted-foreground">
                  by {selectedCourse.creator?.fullName || "Unknown Creator"}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedCourse.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Level</p>
                  <p className="font-medium capitalize">{selectedCourse.level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">₹{selectedCourse.price}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Modules</p>
                  <p className="font-medium">{selectedCourse.modules?.length || 0}</p>
                </div>
              </div>
              
              <div>
                <p className="text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{selectedCourse.description}</p>
              </div>
              
              <div className="pt-4">
                <Button asChild variant="outline" className="mr-2">
                  <Link href={`/courses/${selectedCourse._id}`} target="_blank">
                    Preview Course
                  </Link>
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={() => approveCourse(false)}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Reject"}
            </Button>
            <Button 
              onClick={() => approveCourse(true)}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Creator Review Dialog */}
      <Dialog open={!!selectedCreator} onOpenChange={(open) => !open && setSelectedCreator(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Creator Application</DialogTitle>
            <DialogDescription>
              Review the creator's details before approving or rejecting
            </DialogDescription>
          </DialogHeader>
          
          {selectedCreator && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <div className="relative h-20 w-20 rounded-full overflow-hidden">
                  <Image
                    src={selectedCreator.profileImage || "https://via.placeholder.com/80"}
                    alt={selectedCreator.fullName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{selectedCreator.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCreator.email}</p>
                </div>
              </div>
              
              {selectedCreator.bio && (
                <div>
                  <p className="text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm">{selectedCreator.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Joined Platform</p>
                  <p className="font-medium">{new Date(selectedCreator.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Applied On</p>
                  <p className="font-medium">{new Date(selectedCreator.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={() => approveCreator(false)}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Reject"}
            </Button>
            <Button 
              onClick={() => approveCreator(true)}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}