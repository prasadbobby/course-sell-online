/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'course-platform-bucket.s3.ap-south-1.amazonaws.com',
      'example.com',
      'randomuser.me',
      'images.unsplash.com',
      'via.placeholder.com',
    ]
  }
}

module.exports = nextConfig