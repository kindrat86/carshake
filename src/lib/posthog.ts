import posthog from 'posthog-js';

const POSTHOG_KEY = 'phc_rqGdTxPYCBweGDWJErO1F6owtrbgY4TEYH0tGpHFBSp';

let initialized = false;

export const initPostHog = () => {
  if (initialized || typeof window === 'undefined') return;
  posthog.init(POSTHOG_KEY, {
    api_host: 'https://us.i.posthog.com',
    ui_host: 'https://us.posthog.com',
    capture_pageview: true,
    persistence: 'localStorage+cookie',
    autocapture: true,
    session_recording: { maskAllInputs: false },
  });
  initialized = true;
};

export const track = (event: string, properties?: Record<string, any>) => {
  if (!initialized) initPostHog();
  posthog.capture(event, properties);
};

export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (!initialized) initPostHog();
  posthog.identify(userId, traits);
};

export default posthog;
