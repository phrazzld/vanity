const assert = require("node:assert/strict");
const test = require("node:test");

const canaryConfig = require("../packages/default/canary-config");
const health = require("../packages/default/health");

function withEnv(env, fn) {
  const previous = { ...process.env };
  process.env = { ...previous, ...env };
  try {
    return fn();
  } finally {
    process.env = previous;
  }
}

test("DigitalOcean Canary config matches the browser contract without exposing the server key", () => {
  withEnv(
    {
      CANARY_API_KEY: "private-server-key",
      CANARY_ENDPOINT: "https://canary.example.test/",
      PUBLIC_CANARY_API_KEY: "public-browser-key",
      PUBLIC_CANARY_ENVIRONMENT: "production",
    },
    () => {
      const result = canaryConfig.main();

      assert.equal(result.statusCode, 200);
      assert.equal(result.headers["Cache-Control"], "no-store");
      assert.deepEqual(JSON.parse(result.body), {
        service: "vanity",
        environment: "production",
        endpoint: "https://canary.example.test",
        apiKey: "public-browser-key",
      });
      assert.equal(result.body.includes("private-server-key"), false);
    },
  );
});

test("DigitalOcean health reports the same Canary readiness contract", () => {
  withEnv(
    {
      CANARY_API_KEY: "private-server-key",
      PUBLIC_CANARY_API_KEY: "public-browser-key",
    },
    () => {
      const result = health.main();
      const body = JSON.parse(result.body);

      assert.equal(result.statusCode, 200);
      assert.equal(result.headers["Cache-Control"], "no-store");
      assert.equal(body.status, "ok");
      assert.deepEqual(body.checks, {
        canary: "configured",
        canaryServer: "configured",
        canaryBrowser: "configured",
      });
      assert.match(body.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    },
  );
});

test("DigitalOcean functions refuse to publish a server-equivalent browser key", () => {
  withEnv(
    {
      CANARY_API_KEY: "same-key",
      PUBLIC_CANARY_API_KEY: "same-key",
    },
    () => {
      const config = JSON.parse(canaryConfig.main().body);
      const status = JSON.parse(health.main().body);

      assert.equal(config.apiKey, null);
      assert.equal(status.status, "degraded");
      assert.equal(status.checks.canaryBrowser, "missing");
    },
  );
});
