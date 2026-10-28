/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */

  async headers() {
    return [
      {
        // Applies to every route.
        source: "/:path*",
        headers: [
          // Prevents the site from being embedded in a foreign <iframe>
          // (clickjacking protection).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Stops browsers from MIME-sniffing a response away from its
          // declared Content-Type.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Don't leak the full referring URL (with query params) to
          // third-party destinations.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Force HTTPS for a year, including subdomains.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Deny access to browser APIs this site never uses.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Staging only: keep *.vercel.app out of Google's index. The live
        // custom domain doesn't match, so it stays indexable. Don't block
        // this host in robots.txt, or Google can't crawl to see the noindex.
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

module.exports = nextConfig;
