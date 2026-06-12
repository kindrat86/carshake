let posthogModule: any = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

const POSTHOG_KEY = 'phc_lyZCgvTpicjLzAO3rY2GhxuX5WUc5jQjP8ZVwwJqauX';

const loadPostHog = async () => {
  if (!posthogModule) {
    const mod = await import('posthog-js');
    posthogModule = mod.default;
  }
  return posthogModule;
};

export const initPostHog = () => {
  if (initialized || typeof window === 'undefined') return;
  initPromise = loadPostHog().then((posthog) => {
    posthog.init(POSTHOG_KEY, {
      api_host: 'https://eu.i.posthog.com',
      ui_host: 'https://eu.posthog.com',
      capture_pageview: true,
      persistence: 'localStorage+cookie',
      autocapture: true,
      session_recording: { maskAllInputs: false },
    });
    initialized = true;
  });
};

const ensureInit = async () => {
  if (!initialized && !initPromise) initPostHog();
  if (initPromise) await initPromise;
};

export const track = async (event: string, properties?: Record<string, any>) => {
  await ensureInit();
  posthogModule?.capture(event, properties);
};

export const identifyUser = async (userId: string, traits?: Record<string, any>) => {
  await ensureInit();
  posthogModule?.identify(userId, traits);
};

export default { track, identifyUser, initPostHog };
