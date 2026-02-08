import { withSentryConfig } from "@sentry/nextjs";
import withPWA from "next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		unoptimized: process.env.NODE_ENV === "development",
		remotePatterns: [
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "pub-94c66bef4ac64685ae28b358df265e7d.r2.dev",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "assets.maukmn.com",
			},
			{
				protocol: "https",
				hostname: "maukemana-backend-743021038514.asia-southeast2.run.app",
			},
			{
				protocol: "https",
				hostname: "img.clerk.com",
			},
			{
				protocol: "http",
				hostname: "localhost",
			},
		],
	},
};

const withPWAConfig = withPWA({
	dest: "public",
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === "development",
});

export default withSentryConfig(withPWAConfig(nextConfig), {
	// For all available options, see:
	// https://www.npmjs.com/package/@sentry/webpack-plugin#options

	org: "maukmn",

	project: "javascript-nextjs",

	// Only print logs for uploading source maps in CI
	silent: !process.env.CI,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	tunnelRoute: "/monitoring",

	webpack: {
		// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
		// See the following for more information:
		// https://docs.sentry.io/product/crons/
		// https://vercel.com/docs/cron-jobs
		automaticVercelMonitors: true,

		// NOTE: removeDebugLogging was removed because it was stripping Sentry logging statements
		// from the bundle, preventing errors and logs from being recorded.
		// Only enable treeshake.removeDebugLogging in production if you explicitly don't want logs.
	},
});
