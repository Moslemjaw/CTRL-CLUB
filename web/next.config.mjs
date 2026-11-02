/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Goes in the service worker's URL, so each deploy installs a new worker.
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now()),
  },
  async headers() {
    return [{ source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] }];
  },
};

export default nextConfig;
