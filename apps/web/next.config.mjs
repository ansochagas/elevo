/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@elevo/engine"],
  experimental: {
    serverActions: {
      // lotes de upload comprimidos; teto seguro abaixo do limite da Vercel (~4,5 MB)
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
