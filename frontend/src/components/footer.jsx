import Link from "next/link"
import { BookOpen, Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center font-bold text-xl mb-4">
              <BookOpen className="mr-2 h-6 w-6" />
              <span>Course Platform</span>
            </Link>
            <p className="text-muted-foreground mb-4">
              Transform your life through education. Access thousands of courses from industry experts and universities.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4">Discover</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/courses" className="text-muted-foreground hover:text-primary">
                  All Courses
                </Link>
              </li>
              <li>
                <Link href="/courses?category=development" className="text-muted-foreground hover:text-primary">
                  Development
                </Link>
              </li>
              <li>
                <Link href="/courses?category=business" className="text-muted-foreground hover:text-primary">
                  Business
                </Link>
              </li>
              <li>
                <Link href="/courses?category=design" className="text-muted-foreground hover:text-primary">
                  Design
                </Link>
              </li>
              <li>
                <Link href="/courses?category=marketing" className="text-muted-foreground hover:text-primary">
                  Marketing
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-primary">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-muted-foreground hover:text-primary">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/become-instructor" className="text-muted-foreground hover:text-primary">
                  Become an Instructor
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Course Platform. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
              Privacy
            </Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}