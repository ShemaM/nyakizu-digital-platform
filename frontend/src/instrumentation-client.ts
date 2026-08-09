// Next.js client-side instrumentation entry point — runs once in the
// browser before the app renders. Inactive unless NEXT_PUBLIC_SENTRY_DSN is
// set (no Sentry project has been created for this app yet); set it to
// start capturing frontend errors.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0,
    sendDefaultPii: false,
  });
}
