/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  transpilePackages: ["@libsql/client"],
};

module.exports = nextConfig;

