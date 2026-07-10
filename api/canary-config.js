const { config } = require("../lib/canary-contract");

module.exports = function handler(_request, response) {
  response.setHeader("Cache-Control", "no-store");

  response.status(200).json(config());
};
