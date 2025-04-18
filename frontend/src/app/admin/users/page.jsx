// src/app/admin/users/page.jsx
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Filter, UserCheck, UserX } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import axios from "@/lib/axios"
import { toast } from "sonner"
import Image from "next/image"

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  
  useEffect(() => {
    fetchUsers()
  }, [roleFilter])
  
  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (roleFilter !== "all") {
        params.append("role", roleFilter)
      }
      if (searchQuery) {
        params.append("search", searchQuery)
      }
      
      const response = await axios.get(`/admin/users?${params.toString()}`)
      setUsers(response.data.users || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
      // Use dummy data for demonstration
      setUsers([
        {
          _id: "1",
          fullName: "John Doe",
          email: "john@example.com",
          role: "student",
          createdAt: "2023-01-15",
          profileImage: ""
        },
        {
          _id: "2",
          fullName: "Jane Smith",
          email: "jane@example.com",
          role: "creator",
          creatorStatus: "approved",
          createdAt: "2023-02-10",
          profileImage: ""
        },
        {
          _id: "3",
          fullName: "Alex Johnson",
          email: "alex@example.com",
          role: "creator",
          creatorStatus: "pending",
          createdAt: "2023-03-05",
          profileImage: ""
        },
        {
          _id: "4",
          fullName: "Admin User",
          email: "admin@example.com",
          role: "admin",
          createdAt: "2023-01-01",
          profileImage: ""
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers()
  }
  
const updateUser = async (action) => {
  if (!selectedUser) return
  
  setIsUpdating(true)
  try {
    let updateData = {}
    if (action === "approve-creator") {
      updateData = { creatorStatus: "approved" } // Only update creatorStatus field
    } else if (action === "reject-creator") {
      updateData = { creatorStatus: "rejected" } // Only update creatorStatus field
    } else if (action === "make-admin") {
      updateData = { role: "admin" }
    } else if (action === "remove-admin") {
      updateData = { role: "student" }
    }
    
    console.log("Updating user with data:", updateData);
    await axios.put(`/admin/users/${selectedUser._id}`, updateData)
    
    // Update the local state to reflect changes
    setUsers(users.map(u => 
      u._id === selectedUser._id 
        ? { ...u, ...updateData } 
        : u
    ))
    
    toast.success("User updated successfully")
    setSelectedUser(null)
    
    // Refresh the users list to ensure we have the latest data
    fetchUsers()
  } catch (error) {
    console.error("Error updating user:", error)
    toast.error("Failed to update user")
  } finally {
    setIsUpdating(false)
  }
}
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or email"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>
          
          <div className="flex items-center gap-2">
            <Select 
              value={roleFilter} 
              onValueChange={(value) => setRoleFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
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
        
        {/* Users Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-muted">
                          {user.profileImage ? (
                            <Image
                              src={user.profileImage}
                              alt={user.fullName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-xs font-medium">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{user.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={
                        user.role === "admin" 
                          ? "default" 
                          : user.role === "creator" 
                            ? "secondary" 
                            : "outline"
                      }>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === "creator" && user.creatorStatus ? (
                        <Badge variant={
                          user.creatorStatus === "approved" 
                            ? "outline" 
                            : user.creatorStatus === "pending" 
                              ? "secondary" 
                              : "destructive"
                        }>
                          {user.creatorStatus.charAt(0).toUpperCase() + user.creatorStatus.slice(1)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">No users found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* User Management Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
            <DialogDescription>
              Update user role and permissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted">
                  {selectedUser.profileImage ? (
                    <Image
                      src={selectedUser.profileImage}
                      alt={selectedUser.fullName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-lg font-medium">
                      {selectedUser.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{selectedUser.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Current Role</p>
                  <Badge variant="outline">
                    {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                  </Badge>
                </div>
                
                {selectedUser.role === "creator" && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Creator Status</p>
                    <Badge variant={
                      selectedUser.creatorStatus === "approved" 
                        ? "outline" 
                        : selectedUser.creatorStatus === "pending" 
                          ? "secondary" 
                          : "destructive"
                    }>
                      {selectedUser.creatorStatus}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="pt-4 space-y-2">
                <p className="text-sm font-medium">Available Actions</p>
                
                {selectedUser.role === "creator" && selectedUser.creatorStatus === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateUser("approve-creator")}
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Approve Creator
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateUser("reject-creator")}
                      disabled={isUpdating}
                      className="flex-1"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Reject Creator
                    </Button>
                  </div>
                )}
                
                {selectedUser.role !== "admin" && (
                  <Button
                    onClick={() => updateUser("make-admin")}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    Make Admin
                  </Button>
                )}
                
                {selectedUser.role === "admin" && selectedUser._id !== user._id && (
                  <Button
                    variant="destructive"
                    onClick={() => updateUser("remove-admin")}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    Remove Admin Rights
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedUser(null)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}