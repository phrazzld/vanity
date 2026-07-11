const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("active delivery surfaces cannot recreate the retired Vercel project", () => {
  assert.equal(fs.existsSync(path.join(root, "vercel.json")), false);

  for (const relativePath of [
    "AGENTS.md",
    "README.md",
    "service/canary-contract.js",
  ]) {
    const source = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.doesNotMatch(source, /\bVercel\b|VERCEL_/);
  }
});
