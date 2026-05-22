/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co http://127.0.0.1:* https://worldcup-api-jryd.onrender.com; img-src 'self' data:;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;