const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createPayload,
  installCanaryObserver,
  loadConfig,
  redact,
  reportToCanary,
} = require("../canary-observer");

test("redact strips common credentials and query strings", () => {
  const input = [
    "email phaedrus@example.com",
    "Bearer abc.def.ghi",
    ["sk", "live", "abcdefghijklmnopqrstuvwxyz1234567890"].join("_"),
    "https://example.test/path?token=secret",
    "/local/path?api_key=secret",
    "abcdefghijklmnopqrstuvwxyz1234567890ABCDEF",
  ].join(" ");

  const output = redact(input);

  assert.equal(output.includes("phaedrus@example.com"), false);
  assert.equal(output.includes("abc.def.ghi"), false);
  assert.equal(output.includes("secret"), false);
  assert.equal(output.includes("abcdefghijklmnopqrstuvwxyz1234567890"), false);
  assert.match(output, /\[redacted-email\]/);
  assert.match(output, /\[redacted-key\]/);
  assert.match(output, /\[redacted-query\]/);
});

test("createPayload keeps the vanity service contract and scrubs page context", () => {
  const payload = createPayload(
    { service: "vanity", environment: "production" },
    { error: new Error("boom for user@example.com") },
    {
      location: { href: "https://www.phaedrus.io/?token=secret" },
      navigator: { userAgent: "test-agent" },
    },
  );

  assert.equal(payload.service, "vanity");
  assert.equal(payload.environment, "production");
  assert.equal(payload.error_class, "Error");
  assert.equal(payload.message, "boom for [redacted-email]");
  assert.equal(payload.context.page_url, "https://www.phaedrus.io/?[redacted-query]");
});

test("createPayload preserves ErrorEvent messages when error is absent", () => {
  const payload = createPayload(
    { service: "vanity", environment: "production" },
    { message: "script boom" },
    {
      location: { href: "https://www.phaedrus.io/" },
      navigator: { userAgent: "test-agent" },
    },
  );

  assert.equal(payload.message, "script boom");
  assert.equal(payload.error_class, "Error");
});

test("loadConfig ignores missing browser keys", async () => {
  const result = await loadConfig(async () => ({
    ok: true,
    async json() {
      return { endpoint: "https://canary.example.test", apiKey: "" };
    },
  }));

  assert.equal(result, null);
});

test("reportToCanary posts to the errors endpoint", async () => {
  const calls = [];
  const ok = await reportToCanary(
    { endpoint: "https://canary.example.test/", apiKey: "public-key" },
    { service: "vanity", message: "hello" },
    async (url, options) => {
      calls.push({ url, options });
      return { ok: true };
    },
  );

  assert.equal(ok, true);
  assert.equal(calls[0].url, "https://canary.example.test/api/v1/errors");
  assert.equal(calls[0].options.method, "POST");
  assert.equal(calls[0].options.headers.Authorization, "Bearer public-key");
});

test("installCanaryObserver captures browser errors once", async () => {
  const listeners = new Map();
  const calls = [];
  const page = {
    location: { href: "https://www.phaedrus.io/" },
    navigator: { userAgent: "test-agent" },
    fetch: async (url, options) => {
      calls.push({ url, options });
      return { ok: true };
    },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
  };

  const installed = await installCanaryObserver({
    window: page,
    configPromise: Promise.resolve({
      service: "vanity",
      environment: "test",
      endpoint: "https://canary.example.test",
      apiKey: "public-key",
    }),
  });
  const secondInstall = await installCanaryObserver({ window: page });

  await listeners.get("error")({ error: new Error("vanity smoke") });

  assert.equal(installed, true);
  assert.equal(secondInstall, false);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://canary.example.test/api/v1/errors");
});
