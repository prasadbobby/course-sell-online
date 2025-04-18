// src/app/dashboard/wishlist/page.jsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Trash2, ShoppingCart } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function WishlistPage() {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const response = await axios.get('/users/me/wishlist')
      setWishlist(response.data.wishlist || [])
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      // Use example data for now
      setWishlist([
        {
          _id: "1",
          title: "Complete React Development Course",
          thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450",
          price: 1999,
          creator: { fullName: "John Doe", profileImage: "" },
          level: "intermediate",
          rating: { average: 4.8, count: 240 }
        },
        {
          _id: "2",
          title: "Python for Data Science",
          thumbnail: "https://images.unsplash.com/photo-1526379879527-8559ecfd8bf7?w=800&h=450",
          price: 2499,
          creator: { fullName: "Jane Smith", profileImage: "" },
          level: "beginner",
          rating: { average: 4.7, count: 189 }
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (courseId) => {
    try {
      await axios.delete(`/users/me/wishlist/${courseId}`)
      setWishlist(wishlist.filter(course => course._id !== courseId))
      toast.success("Removed from wishlist")
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      toast.error("Failed to remove from wishlist")
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((course) => (
              <Card key={course._id} className="overflow-hidden">
                <div className="relative h-40">
                  <Image
                    src={course.thumbnail || "https://placehold.co/800x450?text=Course+Thumbnail"}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => removeFromWishlist(course._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-1 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    By {course.creator.fullName}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="text-yellow-500 mr-1">★</div>
                      <span>{course.rating.average}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({course.rating.count})
                      </span>
                    </div>
                    <span className="font-medium">₹{course.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/courses/${course._id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button className="flex-1">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Enroll
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-4">
              Save courses you're interested in to come back to them later.
            </p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}