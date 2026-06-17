function withoutTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function configuredValue(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > 0 ? trimmed : null;
}

module.exports = function handler(_request, response) {
  response.setHeader("Cache-Control", "no-store");

  const browserKey = configuredValue(process.env.PUBLIC_CANARY_API_KEY);
  const serverKey = configuredValue(process.env.CANARY_API_KEY);
  const safeBrowserKey = browserKey && browserKey !== serverKey ? browserKey : null;

  response.status(200).json({
    service: "vanity",
    environment:
      process.env.PUBLIC_CANARY_ENVIRONMENT ||
      process.env.VERCEL_ENV ||
      "production",
    endpoint: withoutTrailingSlash(
      process.env.PUBLIC_CANARY_ENDPOINT ||
        process.env.CANARY_ENDPOINT ||
        "https://canary-obs.fly.dev",
    ),
    apiKey: safeBrowserKey,
  });
};
