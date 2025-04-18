// src/app/admin/reports/page.jsx
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { Download, Briefcase, BookOpen, Users, DollarSign } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function AdminReportsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState(null)
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      // In a real app, you would fetch from an API
      // For now, let's use example data
      setTimeout(() => {
        setReports({
          totalRevenue: 1256000,
          totalUsers: 8750,
          totalCourses: 350,
          totalEnrollments: 12500,
          
          monthlyRevenue: [
            { month: "Jan", revenue: 85000, enrollments: 850 },
            { month: "Feb", revenue: 95000, enrollments: 920 },
            { month: "Mar", revenue: 120000, enrollments: 1100 },
            { month: "Apr", revenue: 105000, enrollments: 980 },
            { month: "May", revenue: 130000, enrollments: 1150 },
            { month: "Jun", revenue: 140000, enrollments: 1200 }
          ],
          
          categoryDistribution: [
            { name: "Development", courses: 120, students: 4500 },
            { name: "Business", courses: 80, students: 3200 },
            { name: "Design", courses: 65, students: 2800 },
            { name: "Marketing", courses: 45, students: 1500 },
            { name: "Other", courses: 40, students: 750 }
          ],
          
          topCourses: [
            { title: "Complete Web Development Bootcamp", students: 945, revenue: 142000 },
            { title: "The Ultimate MySQL Bootcamp", students: 838, revenue: 125700 },
            { title: "Modern React with Redux", students: 756, revenue: 113400 },
            { title: "Python for Data Science and ML", students: 712, revenue: 106800 },
            { title: "The Complete JavaScript Course", students: 689, revenue: 103350 }
          ]
        })
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast.error("Failed to load report data")
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Platform Reports</h1>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">₹{reports.totalRevenue.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{reports.totalUsers.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{reports.totalCourses.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 text-muted-foreground mr-2" />
                <div className="text-2xl font-bold">{reports.totalEnrollments.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Revenue and Enrollment Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Revenue & Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={reports.monthlyRevenue}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke="#0088FE" />
                  <YAxis yAxisId="right" orientation="right" stroke="#00C49F" />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Enrollments'
                  ]} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue" 
                    stroke="#0088FE" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="enrollments" 
                    name="Enrollments" 
                    stroke="#00C49F" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reports.categoryDistribution}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="courses" name="Courses" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Student Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reports.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="students"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {reports.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} students`, 'Enrolled']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Top Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.topCourses.map((course, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.students.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{course.revenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}