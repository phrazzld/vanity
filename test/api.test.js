const assert = require("node:assert/strict");
const test = require("node:test");

const configHandler = require("../api/canary-config");
const healthHandler = require("../api/health");

function withEnv(env, fn) {
  const previous = { ...process.env };
  process.env = { ...previous, ...env };
  try {
    return fn();
  } finally {
    process.env = previous;
  }
}

function run(handler) {
  const headers = {};
  const response = {
    statusCode: undefined,
    body: undefined,
    setHeader(name, value) {
      headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  handler({}, response);
  return { headers, statusCode: response.statusCode, body: response.body };
}

test("health reports ok only when both Canary keys are configured", () => {
  withEnv(
    {
      CANARY_API_KEY: "server-key",
      PUBLIC_CANARY_API_KEY: "browser-key",
    },
    () => {
      const result = run(healthHandler);

      assert.equal(result.statusCode, 200);
      assert.equal(result.headers["Cache-Control"], "no-store");
      assert.equal(result.body.status, "ok");
      assert.equal(result.body.checks.canaryServer, "configured");
      assert.equal(result.body.checks.canaryBrowser, "configured");
    },
  );
});

test("health reports degraded without a browser ingest key", () => {
  withEnv(
    {
      CANARY_API_KEY: "server-key",
      PUBLIC_CANARY_API_KEY: "",
    },
    () => {
      const result = run(healthHandler);

      assert.equal(result.statusCode, 200);
      assert.equal(result.body.status, "degraded");
      assert.equal(result.body.checks.canary, "missing");
      assert.equal(result.body.checks.canaryServer, "configured");
      assert.equal(result.body.checks.canaryBrowser, "missing");
    },
  );
});

test("health and config treat whitespace-only browser keys as missing", () => {
  withEnv(
    {
      CANARY_API_KEY: "server-key",
      PUBLIC_CANARY_API_KEY: "   ",
    },
    () => {
      const health = run(healthHandler);
      const config = run(configHandler);

      assert.equal(health.body.status, "degraded");
      assert.equal(health.body.checks.canaryBrowser, "missing");
      assert.equal(config.body.apiKey, null);
    },
  );
});

test("health treats whitespace-only server keys as missing", () => {
  withEnv(
    {
      CANARY_API_KEY: "   ",
      PUBLIC_CANARY_API_KEY: "browser-key",
    },
    () => {
      const health = run(healthHandler);

      assert.equal(health.body.status, "degraded");
      assert.equal(health.body.checks.canaryServer, "missing");
      assert.equal(health.body.checks.canaryBrowser, "configured");
    },
  );
});

test("config exposes only the browser Canary key", () => {
  withEnv(
    {
      CANARY_API_KEY: "private-server-key",
      CANARY_ENDPOINT: "https://canary.example.test/",
      PUBLIC_CANARY_API_KEY: "public-browser-key",
      PUBLIC_CANARY_ENVIRONMENT: "preview",
    },
    () => {
      const result = run(configHandler);

      assert.equal(result.statusCode, 200);
      assert.equal(result.headers["Cache-Control"], "no-store");
      assert.deepEqual(result.body, {
        service: "vanity",
        environment: "preview",
        endpoint: "https://canary.example.test",
        apiKey: "public-browser-key",
      });
      assert.equal(JSON.stringify(result.body).includes("private-server-key"), false);
    },
  );
});

test("config refuses to expose a browser key that matches the server key", () => {
  withEnv(
    {
      CANARY_API_KEY: "same-key",
      PUBLIC_CANARY_API_KEY: "same-key",
    },
    () => {
      const result = run(configHandler);

      assert.equal(result.body.apiKey, null);
    },
  );
});
