import type { NextConfig } from 'next';

// The portal is embedded as a page inside Finnegans GO, so only allow framing from there.
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://*.finneg.com" },
        ],
      },
    ];
  },
};

export default nextConfig;
