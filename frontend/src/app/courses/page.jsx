"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, X } from "lucide-react"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function CoursesPage() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("search") || ""
  const initialCategory = searchParams.get("category") || ""
  
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [level, setLevel] = useState("")
  const [priceFilter, setPriceFilter] = useState("")
  const [sortOption, setSortOption] = useState("newest")
  const [filtersVisible, setFiltersVisible] = useState(false)
  
  useEffect(() => {
    fetchCategories()
    fetchCourses()
  }, [initialSearch, initialCategory])
  

const fetchCategories = async () => {
    try {
      console.log('Fetching categories from:', process.env.NEXT_PUBLIC_API_URL);
      const response = await axios.get("/courses/categories");
      console.log('Categories response:', response.data);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      
      // Handle connection errors more gracefully
      if (error.message === 'Network Error') {
        toast.error("Cannot connect to server. Please ensure the backend is running.");
        setCategories([]); // Use empty array as fallback
      }
    }
  };
  
  const fetchCourses = async (page = 1) => {
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", page);
      
      if (searchQuery) params.append("search", searchQuery);
      if (category) params.append("category", category);
      if (level) params.append("level", level);
      if (priceFilter) params.append("price", priceFilter);
      if (sortOption) params.append("sort", sortOption);
      
      console.log('Fetching courses with params:', params.toString());
      const response = await axios.get(`/courses?${params.toString()}`);
      
      setCourses(response.data.courses || []);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
    } catch (error) {
      console.error("Error fetching courses:", error);
      
      if (error.message === 'Network Error') {
        toast.error("Cannot connect to server. Please check your connection.");
        setCourses([]);
      } else {
        toast.error("Failed to load courses");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleSearch = (e) => {
    e.preventDefault()
    fetchCourses(1)
  }
  
  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchCourses(page)
    window.scrollTo(0, 0)
  }
  
  const handleFilterChange = () => {
    setCurrentPage(1)
    fetchCourses(1)
  }
  
  const clearFilters = () => {
    setSearchQuery("")
    setCategory("")
    setLevel("")
    setPriceFilter("")
    setSortOption("newest")
    setCurrentPage(1)
    fetchCourses(1)
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <div className="container mx-auto p-4 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Explore Courses</h1>
            <p className="text-muted-foreground">
              Discover top-quality courses to advance your skills
            </p>
          </div>
          <Button 
            variant="outline"
            className="mt-4 md:mt-0 flex items-center md:hidden"
            onClick={() => setFiltersVisible(!filtersVisible)}
          >
            {filtersVisible ? <X className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
            {filtersVisible ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`md:w-1/4 space-y-6 ${filtersVisible ? 'block' : 'hidden'} md:block`}>
            <div className="bg-background rounded-lg border p-4">
              <h2 className="font-medium text-lg mb-4">Filter Courses</h2>
              
              <form onSubmit={handleSearch} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      type="search"
                      placeholder="Search courses..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(value) => {
                    setCategory(value)
                    handleFilterChange()
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={level} onValueChange={(value) => {
                    setLevel(value)
                    handleFilterChange()
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label>Price</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="all-prices" 
                        checked={priceFilter === ""}
                        onCheckedChange={() => {
                          setPriceFilter("")
                          handleFilterChange()
                        }}
                      />
                      <Label htmlFor="all-prices" className="font-normal">All Prices</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="free" 
                        checked={priceFilter === "free"}
                        onCheckedChange={() => {
                          setPriceFilter("free")
                          handleFilterChange()
                        }}
                      />
                      <Label htmlFor="free" className="font-normal">Free</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="paid" 
                        checked={priceFilter === "paid"}
                        onCheckedChange={() => {
                          setPriceFilter("paid")
                          handleFilterChange()
                        }}
                      />
                      <Label htmlFor="paid" className="font-normal">Paid</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select value={sortOption} onValueChange={(value) => {
                    setSortOption(value)
                    handleFilterChange()
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                  <Button type="submit" size="sm">Apply Filters</Button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Course List */}
          <div className="md:w-3/4">
            {isLoading ? (
              <div className="text-center py-12">Loading courses...</div>
            ) : courses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <Link 
                      href={`/courses/${course._id}`}
                      key={course._id}
                      className="group"
                    >
                      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                        <div className="relative h-40">
                          <Image
                            src={course.thumbnail || "https://placehold.co/800x450?text=Course+Thumbnail"}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {course.level && (
                            <div className="absolute top-2 left-2 bg-background/80 text-foreground text-xs py-1 px-2 rounded">
                              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-1">
                            By {course.creator?.fullName || "Instructor"}
                          </p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="text-yellow-500 mr-1">★</div>
                              <span>{course.rating?.average || "New"}</span>
                              {course.rating?.count > 0 && (
                                <span className="text-muted-foreground text-xs ml-1">
                                  ({course.rating.count})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <div className="text-sm font-medium">
                                {course.price === 0 ? (
                                  <span className="text-green-600">Free</span>
                                ) : (
                                  <span>₹{course.price}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationLink 
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="cursor-pointer"
                          >
                            Previous
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => handlePageChange(page)}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationLink 
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="cursor-pointer"
                          >
                            Next
                          </PaginationLink>
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}