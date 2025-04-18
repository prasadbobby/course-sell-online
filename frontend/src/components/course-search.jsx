// frontend/src/components/course-search.jsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function CourseSearch({ className, placeholder = "Search courses..." }) {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/courses?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className={className}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-10 pr-12"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button 
          type="submit" 
          size="sm" 
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
        >
          Search
        </Button>
      </div>
    </form>
  );
}