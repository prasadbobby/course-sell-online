// src/app/creator/earnings/page.jsx
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
  ResponsiveContainer
} from "recharts"
import { DollarSign, Download, Filter } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function CreatorEarningsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [earnings, setEarnings] = useState(null)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    fetchEarnings()
  }, [])

  // src/app/creator/earnings/page.jsx (continued)
  const fetchEarnings = async () => {
    try {
      const response = await axios.get('/creator/earnings')
      
      // If API fails, use example data
      if (!response.data) {
        setEarnings({
          totalEarnings: 345600,
          pendingPayout: 42000,
          lastPayout: { amount: 56000, date: "2023-05-15" },
          monthlyEarnings: [
            { month: "Jan", earnings: 15000 },
            { month: "Feb", earnings: 18500 },
            { month: "Mar", earnings: 22000 },
            { month: "Apr", earnings: 19800 },
            { month: "May", earnings: 25400 },
            { month: "Jun", earnings: 32000 }
          ],
          earningsPerCourse: [
            { courseTitle: "React Masterclass", earnings: 142000 },
            { courseTitle: "Node.js Essentials", earnings: 86000 },
            { courseTitle: "Full-Stack Development", earnings: 56000 },
            { courseTitle: "JavaScript Basics", earnings: 42600 },
            { courseTitle: "CSS Animations", earnings: 19000 }
          ]
        })
        
        setTransactions([
          { id: "TRX001", date: "2023-06-15", type: "Payout", amount: 56000, status: "Completed" },
          { id: "TRX002", date: "2023-06-10", type: "Course Sale", amount: 2000, status: "Completed" },
          { id: "TRX003", date: "2023-06-05", type: "Course Sale", amount: 1500, status: "Completed" },
          { id: "TRX004", date: "2023-06-01", type: "Course Sale", amount: 999, status: "Completed" },
          { id: "TRX005", date: "2023-05-28", type: "Course Sale", amount: 1999, status: "Completed" }
        ])
      } else {
        setEarnings(response.data)
        // In a real app, you would fetch transactions separately or process from earnings data
      }
    } catch (error) {
      console.error("Error fetching earnings:", error)
      toast.error("Failed to load earnings data")
      
      // Use example data if API fails
      setEarnings({
        totalEarnings: 345600,
        pendingPayout: 42000,
        lastPayout: { amount: 56000, date: "2023-05-15" },
        monthlyEarnings: [
          { month: "Jan", earnings: 15000 },
          { month: "Feb", earnings: 18500 },
          { month: "Mar", earnings: 22000 },
          { month: "Apr", earnings: 19800 },
          { month: "May", earnings: 25400 },
          { month: "Jun", earnings: 32000 }
        ],
        earningsPerCourse: [
          { courseTitle: "React Masterclass", earnings: 142000 },
          { courseTitle: "Node.js Essentials", earnings: 86000 },
          { courseTitle: "Full-Stack Development", earnings: 56000 },
          { courseTitle: "JavaScript Basics", earnings: 42600 },
          { courseTitle: "CSS Animations", earnings: 19000 }
        ]
      })
      
      setTransactions([
        { id: "TRX001", date: "2023-06-15", type: "Payout", amount: 56000, status: "Completed" },
        { id: "TRX002", date: "2023-06-10", type: "Course Sale", amount: 2000, status: "Completed" },
        { id: "TRX003", date: "2023-06-05", type: "Course Sale", amount: 1500, status: "Completed" },
        { id: "TRX004", date: "2023-06-01", type: "Course Sale", amount: 999, status: "Completed" },
        { id: "TRX005", date: "2023-05-28", type: "Course Sale", amount: 1999, status: "Completed" }
      ])
    } finally {
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
        <h1 className="text-3xl font-bold mb-6">Earnings Dashboard</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{earnings.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime earnings
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{earnings.pendingPayout.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Available for withdrawal
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Last Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{earnings.lastPayout.amount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                On {new Date(earnings.lastPayout.date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Monthly Earnings Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={earnings.monthlyEarnings}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value}`, 'Earnings']} />
                  <Legend />
                  <Bar dataKey="earnings" name="Earnings" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Earnings per Course */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Earnings per Course</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Total Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.earningsPerCourse.map((course) => (
                  <TableRow key={course.courseTitle}>
                    <TableCell className="font-medium">{course.courseTitle}</TableCell>
                    <TableCell className="text-right">₹{course.earnings.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Transaction History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transaction History</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell className="text-right">₹{transaction.amount.toLocaleString()}</TableCell>
                    <TableCell>{transaction.status}</TableCell>
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
