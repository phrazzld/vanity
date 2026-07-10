const http = require("node:http");
const { config, health } = require("./canary-contract");

function json(response, statusCode, body, includeBody = true) {
  const encoded = JSON.stringify(body);
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(encoded),
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(includeBody ? encoded : undefined);
}

function handler(request, response) {
  const method = request.method || "GET";
  const includeBody = method !== "HEAD";
  if (method !== "GET" && method !== "HEAD") {
    json(response, 405, { error: "method_not_allowed" }, includeBody);
    return;
  }

  const path = new URL(request.url || "/", "http://localhost").pathname;
  if (path === "/api/canary-config" || path === "/canary-config") {
    json(response, 200, config(), includeBody);
    return;
  }
  if (path === "/api/health" || path === "/health") {
    json(response, 200, health(), includeBody);
    return;
  }
  json(response, 404, { error: "not_found" }, includeBody);
}

if (require.main === module) {
  const port = Number.parseInt(process.env.PORT || "8080", 10);
  http.createServer(handler).listen(port, "0.0.0.0");
}

module.exports = { handler };
