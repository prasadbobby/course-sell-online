import Link from "next/link"
import Image from "next/image"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Users, 
  Award, 
  Monitor, 
  TrendingUp, 
  Briefcase, 
  Palette, 
  ShoppingBag,
  ArrowRight,
  CheckCircle
} from "lucide-react"

export default function Home() {
  // Sample categories for UI display
  const categories = [
    { 
      name: "Development", 
      icon: <Monitor className="h-6 w-6" />,
      courses: 1200,
      href: "/courses?category=development"
    },
    { 
      name: "Business", 
      icon: <Briefcase className="h-6 w-6" />,
      courses: 850,
      href: "/courses?category=business"
    },
    { 
      name: "Design", 
      icon: <Palette className="h-6 w-6" />,
      courses: 950,
      href: "/courses?category=design"
    },
    { 
      name: "Marketing", 
      icon: <TrendingUp className="h-6 w-6" />,
      courses: 650,
      href: "/courses?category=marketing"
    },
  ]

  // Sample featured courses for UI display
  const featuredCourses = [
    {
      id: 1,
      title: "Complete Web Development Bootcamp",
      instructor: "John Smith",
      price: 4999,
      rating: 4.8,
      students: 15840,
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&h=600&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Digital Marketing Masterclass",
      instructor: "Emma Johnson",
      price: 3999,
      rating: 4.7,
      students: 8425,
      image: "https://images.unsplash.com/photo-1567593810070-7a3d471af022?q=80&w=800&h=600&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "The Complete UI/UX Design Course",
      instructor: "Michael Chen",
      price: 5999,
      rating: 4.9,
      students: 12230,
      image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=800&h=600&auto=format&fit=crop"
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary/20 to-primary/5 py-20 md:py-28">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Unlock Your Potential With Our Expert-Led Courses
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Join millions of learners from around the world and access high-quality courses to take your skills to the next level.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link href="/courses">Explore Courses</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/become-instructor">Become an Instructor</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">15M+</span>
                  <span className="text-muted-foreground">Students</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">12K+</span>
                  <span className="text-muted-foreground">Courses</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">5K+</span>
                  <span className="text-muted-foreground">Instructors</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <Image 
                  src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=2070&auto=format&fit=crop" 
                  alt="Students learning online"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-background p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Certificate Included</p>
                    <p className="text-sm text-muted-foreground">For all completed courses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Explore Top Categories</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Browse through the most popular course categories and find the perfect learning path for your goals
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <Link 
                  key={index} 
                  href={category.href}
                  className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4 text-primary">
                    {category.icon}
                  </div>
                  <h3 className="font-medium text-lg mb-2">{category.name}</h3>
                  <p className="text-muted-foreground">{category.courses}+ courses</p>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button asChild variant="outline">
                <Link href="/courses" className="inline-flex items-center">
                  View All Categories
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Courses</h2>
                <p className="text-muted-foreground">
                  Handpicked courses by our team for you to get started
                </p>
              </div>
              <Link 
                href="/courses" 
                className="mt-4 md:mt-0 inline-flex items-center text-primary hover:underline"
              >
                View All Courses
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <Link 
                  href={`/courses/${course.id}`} 
                  key={course.id}
                  className="group bg-background rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      By {course.instructor}
                    </p>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <div className="text-yellow-500 mr-1">★</div>
                        <span>{course.rating}</span>
                        <span className="text-muted-foreground text-sm ml-1">
                          ({Math.floor(course.students / 1000)}k students)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-lg">₹{course.price}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We provide the best learning experience with features designed to help you succeed
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-background p-6 rounded-xl">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Quality Content</h3>
                <p className="text-muted-foreground">
                  Access high-quality courses created by industry experts and leading universities.
                </p>
              </div>
              
              <div className="bg-background p-6 rounded-xl">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Community Support</h3>
                <p className="text-muted-foreground">
                  Connect with other learners and instructors for support and networking.
                </p>
              </div>
              
              <div className="bg-background p-6 rounded-xl">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Certificates</h3>
                <p className="text-muted-foreground">
                  Earn recognized certificates upon course completion to showcase your skills.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Become Instructor Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-primary/5 rounded-2xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
                  <h2 className="text-3xl font-bold mb-4">
                    Become an Instructor
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Share your knowledge with millions of students around the world. Create engaging courses and earn revenue while making an impact.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Reach millions of students worldwide</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Build your professional network</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Earn revenue from course sales</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span>Access comprehensive teaching tools</span>
                    </li>
                  </ul>
                  <Button asChild size="lg">
                    <Link href="/become-instructor">Start Teaching Today</Link>
                  </Button>
                </div>
                <div className="md:w-1/2">
                  <div className="relative rounded-lg overflow-hidden shadow-xl">
                    <Image 
                      src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop" 
                      alt="Instructor teaching"
                      width={600}
                      height={400}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}