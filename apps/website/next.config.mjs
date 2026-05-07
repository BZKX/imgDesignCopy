import path from 'path';
import { fileURLToPath } from 'url';
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server bundle for Docker deploy (next-server + minimal node_modules)
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  // Point to monorepo root so Next.js file-tracing works correctly in pnpm workspaces
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // ESLint config is added in a later task; skip during build for now
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  // Suppress noisy Sentry CLI output in CI
  silent: !process.env.CI,
  // Upload source maps only when DSN is set (skip in local dev without env vars)
  sourcemaps: {
    disable: !process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  // Don't include the Sentry SDK in the edge runtime bundle for routes that don't need it
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: false,
});
