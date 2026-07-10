const { health } = require("../../lib/canary-contract");

function main() {
  return {
    statusCode: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(health()),
  };
}

module.exports = { main };
