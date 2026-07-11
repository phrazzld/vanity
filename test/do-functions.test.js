const assert = require("node:assert/strict");
const test = require("node:test");

const { once } = require("node:events");
const http = require("node:http");

const { handler } = require("../service/server");

async function withEnv(env, fn) {
  const previous = { ...process.env };
  process.env = { ...previous, ...env };
  try {
    return await fn();
  } finally {
    process.env = previous;
  }
}

async function request(path, method = "GET") {
  const server = http.createServer(handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}${path}`, { method });
    const body = method === "HEAD" ? "" : await response.text();
    return { body, headers: response.headers, status: response.status };
  } finally {
    server.close();
    await once(server, "close");
  }
}

test("DigitalOcean Canary config matches the browser contract without exposing the server key", async () => {
  await withEnv(
    {
      CANARY_API_KEY: "private-server-key",
      CANARY_ENDPOINT: "https://canary.example.test/",
      PUBLIC_CANARY_API_KEY: "public-browser-key",
      PUBLIC_CANARY_ENVIRONMENT: "production",
    },
    async () => {
      const result = await request("/api/canary-config");

      assert.equal(result.status, 200);
      assert.equal(result.headers.get("cache-control"), "no-store");
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

test("DigitalOcean health reports the same Canary readiness contract", async () => {
  await withEnv(
    {
      CANARY_API_KEY: "private-server-key",
      PUBLIC_CANARY_API_KEY: "public-browser-key",
    },
    async () => {
      const result = await request("/api/health");
      const body = JSON.parse(result.body);

      assert.equal(result.status, 200);
      assert.equal(result.headers.get("cache-control"), "no-store");
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

test("DigitalOcean service refuses to publish a server-equivalent browser key", async () => {
  await withEnv(
    {
      CANARY_API_KEY: "same-key",
      PUBLIC_CANARY_API_KEY: "same-key",
    },
    async () => {
      const config = JSON.parse((await request("/api/canary-config")).body);
      const status = JSON.parse((await request("/api/health")).body);

      assert.equal(config.apiKey, null);
      assert.equal(status.status, "degraded");
      assert.equal(status.checks.canaryBrowser, "missing");
    },
  );
});

test("DigitalOcean defaults ignore retired Vercel environment hints", async () => {
  await withEnv(
    {
      CANARY_ENDPOINT: "",
      PUBLIC_CANARY_ENDPOINT: "",
      PUBLIC_CANARY_ENVIRONMENT: "",
      VERCEL_ENV: "preview",
    },
    async () => {
      const config = JSON.parse((await request("/api/canary-config")).body);

      assert.equal(config.environment, "production");
      assert.equal(config.endpoint, "https://canary.mistystep.io");
    },
  );
});

test("DigitalOcean service rejects unrelated routes and write methods", async () => {
  assert.equal((await request("/api/missing")).status, 404);
  assert.equal((await request("/api/canary-config", "POST")).status, 405);
});
