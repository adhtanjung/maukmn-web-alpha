// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === "development";

Sentry.init({
	dsn: "https://d76898708bc8f72ab54dc8bda03fbb66@o4510691744088064.ingest.us.sentry.io/4510691744284672",

	// Set to true to see Sentry initialization logs in console (remove in production)
	// debug: true,

	// Add optional integrations for additional features
	// Disable Session Replay in development (CPU-heavy)
	integrations: [
		...(isDev ? [] : [Sentry.replayIntegration()]),
		Sentry.consoleLoggingIntegration({
			levels: ["log", "info", "warn", "error", "debug"],
		}),
	],

	// Reduce tracing overhead in development
	tracesSampleRate: isDev ? 0.1 : 1,

	// Enable logs to be sent to Sentry
	enableLogs: true,

	// Disable replay sampling in development
	replaysSessionSampleRate: isDev ? 0 : 0.1,
	replaysOnErrorSampleRate: isDev ? 0 : 1.0,

	// Enable sending user PII (Personally Identifiable Information)
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
	sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
