/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    largePageDataBytes: 128 * 1000, // 128KB
  }
}

module.exports = nextConfig 