const repo = "specforge"; // MUST match your repo name

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
}

module.exports = nextConfig
