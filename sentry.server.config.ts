// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: "https://d76898708bc8f72ab54dc8bda03fbb66@o4510691744088064.ingest.us.sentry.io/4510691744284672",

	// Set to true to see Sentry initialization logs in console (remove in production)
	// debug: true,

	// Add integrations
	integrations: [
		// Capture console.log, console.error, etc. and send to Sentry Logs
		Sentry.consoleLoggingIntegration({
			levels: ["log", "info", "warn", "error", "debug"],
		}),
	],

	// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
	tracesSampleRate: 1,

	// Enable logs to be sent to Sentry
	enableLogs: true,

	// Enable sending user PII (Personally Identifiable Information)
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
	sendDefaultPii: true,
});
