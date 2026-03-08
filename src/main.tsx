import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { initPostHog } from "./lib/posthog";

// Defer PostHog to after first paint
if (typeof requestIdleCallback === 'function') {
  requestIdleCallback(() => initPostHog());
} else {
  setTimeout(() => initPostHog(), 2000);
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
