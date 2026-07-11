function configuredValue(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > 0 ? trimmed : null;
}

function withoutTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function config(environment = process.env) {
  const browserKey = configuredValue(environment.PUBLIC_CANARY_API_KEY);
  const serverKey = configuredValue(environment.CANARY_API_KEY);

  return {
    service: "vanity",
    environment: environment.PUBLIC_CANARY_ENVIRONMENT || "production",
    endpoint: withoutTrailingSlash(
      environment.PUBLIC_CANARY_ENDPOINT ||
        environment.CANARY_ENDPOINT ||
        "https://canary.mistystep.io",
    ),
    apiKey: browserKey && browserKey !== serverKey ? browserKey : null,
  };
}

function health(environment = process.env, now = new Date()) {
  const browserKey = configuredValue(environment.PUBLIC_CANARY_API_KEY);
  const serverKey = configuredValue(environment.CANARY_API_KEY);
  const serverConfigured = serverKey !== null;
  const distinctBrowserKey = browserKey !== null && browserKey !== serverKey;
  const ok = serverConfigured && distinctBrowserKey;

  return {
    status: ok ? "ok" : "degraded",
    service: "vanity",
    checks: {
      canary: ok ? "configured" : "missing",
      canaryServer: serverConfigured ? "configured" : "missing",
      canaryBrowser: distinctBrowserKey ? "configured" : "missing",
    },
    timestamp: now.toISOString(),
  };
}

module.exports = { config, health };
