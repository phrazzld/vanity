function configuredValue(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > 0 ? trimmed : null;
}

module.exports = function handler(_request, response) {
  const serverKey = configuredValue(process.env.CANARY_API_KEY);
  const browserKey = configuredValue(process.env.PUBLIC_CANARY_API_KEY);
  const serverConfigured = serverKey !== null;
  const browserConfigured = browserKey !== null;
  const distinctBrowserKey =
    browserConfigured && browserKey !== serverKey;
  const ok = serverConfigured && distinctBrowserKey;

  response.setHeader("Cache-Control", "no-store");
  response.status(200).json({
    status: ok ? "ok" : "degraded",
    service: "vanity",
    checks: {
      canary: ok ? "configured" : "missing",
      canaryServer: serverConfigured ? "configured" : "missing",
      canaryBrowser: distinctBrowserKey ? "configured" : "missing",
    },
    timestamp: new Date().toISOString(),
  });
};
