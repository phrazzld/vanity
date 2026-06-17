(function canaryObserver(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  root.VanityCanary = api;
  api.installCanaryObserver();
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  const DEFAULT_CONFIG_PATH = "/api/canary-config";
  const OBSERVER_VERSION = "vanity-static-v1";

  const REDACTION_RULES = [
    [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]"],
    [/\bBearer\s+[A-Za-z0-9._~+/=-]+\b/g, "Bearer [redacted-token]"],
    [/\bsk_(?:live|test)_[A-Za-z0-9_]+\b/g, "[redacted-key]"],
    [
      /https?:\/\/[^\s"'<>?]+(?:\?[^'"<>\s]*)/g,
      (match) => match.replace(/\?.*$/, "?[redacted-query]"),
    ],
    [
      /(^|[\s"'(])([/?#][^\s"'<>]*\?[^'"<>\s]*)/g,
      (_match, prefix, path) => `${prefix}${path.replace(/\?.*$/, "?[redacted-query]")}`,
    ],
    [/\b[A-Za-z0-9_-]{32,}\b/g, "[redacted-token]"],
  ];

  function asText(value) {
    if (value instanceof Error) return value.message || value.name;
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  function redact(value) {
    return REDACTION_RULES.reduce(
      (text, [pattern, replacement]) => text.replace(pattern, replacement),
      asText(value),
    );
  }

  function normalizeError(input) {
    const reason = input?.error || input?.reason;
    const sourceError =
      reason instanceof Error ? reason : input instanceof Error ? input : null;
    const messageSource = reason || input?.message || input;
    const message = redact(asText(messageSource) || "Unhandled browser error");
    const name = sourceError ? sourceError.name || "Error" : "Error";
    const stack = sourceError?.stack ? redact(sourceError.stack) : undefined;

    return { name, message, stack };
  }

  function createPayload(config, input, page) {
    const error = normalizeError(input);
    const location = page?.location?.href || "";
    const userAgent = page?.navigator?.userAgent || "";

    return {
      service: config.service || "vanity",
      environment: config.environment || "production",
      severity: "error",
      error_class: error.name,
      message: error.message,
      stack: error.stack,
      source: "browser",
      context: {
        observer: OBSERVER_VERSION,
        page_url: redact(location),
        user_agent: redact(userAgent),
      },
    };
  }

  async function loadConfig(fetchImpl = fetch, configPath = DEFAULT_CONFIG_PATH) {
    const response = await fetchImpl(configPath, {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!response.ok) return null;

    const config = await response.json();
    if (!config?.apiKey || !config?.endpoint) return null;

    return {
      service: config.service || "vanity",
      environment: config.environment || "production",
      endpoint: String(config.endpoint).replace(/\/+$/, ""),
      apiKey: config.apiKey,
    };
  }

  async function reportToCanary(config, payload, fetchImpl = fetch) {
    if (!config?.apiKey || !config?.endpoint) return false;
    const endpoint = String(config.endpoint).replace(/\/+$/, "");

    const response = await fetchImpl(`${endpoint}/api/v1/errors`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    return response.ok;
  }

  async function installCanaryObserver(options = {}) {
    const page = options.window || window;
    if (page.__vanityCanaryObserverInstalled) return false;
    page.__vanityCanaryObserverInstalled = true;

    const fetchImpl = options.fetch || page.fetch.bind(page);
    const configPromise = options.configPromise || loadConfig(fetchImpl);

    const capture = async (event) => {
      try {
        const config = await configPromise;
        if (!config) return;
        await reportToCanary(config, createPayload(config, event, page), fetchImpl);
      } catch {
        // Observability must never break the page it observes.
      }
    };

    page.addEventListener("error", capture);
    page.addEventListener("unhandledrejection", capture);
    return true;
  }

  return {
    createPayload,
    installCanaryObserver,
    loadConfig,
    redact,
    reportToCanary,
  };
});
