import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/shop", destination: "/", permanent: true },
      { source: "/shop/productos", destination: "/productos", permanent: true },
      { source: "/shop/productos/:id", destination: "/productos/:id", permanent: true },
      { source: "/shop/carrito", destination: "/carrito", permanent: true },
      { source: "/shop/checkout", destination: "/checkout", permanent: true },
      { source: "/shop/confirmacion", destination: "/confirmacion", permanent: true },
    ];
  },
};

export default nextConfig;
