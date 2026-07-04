const assert = require("node:assert/strict");
const test = require("node:test");

global.window = global;
require("../quotes");

test("quote pool entries are renderable quote and attribution pairs", () => {
  assert.ok(Array.isArray(window.QUOTES));
  assert.ok(window.QUOTES.length > 0);

  for (const entry of window.QUOTES) {
    assert.equal(entry.length, 2);
    assert.equal(typeof entry[0], "string");
    assert.equal(typeof entry[1], "string");
    assert.ok(entry[0].trim().length > 0);
    assert.ok(entry[1].trim().length > 0);
  }
});

test("attributions have balanced quotation marks", () => {
  for (const [quote, attribution] of window.QUOTES) {
    const marks = (attribution.match(/"/g) || []).length;
    assert.equal(
      marks % 2,
      0,
      `unbalanced quotation marks in attribution "${attribution}" (quote: ${quote.slice(0, 40)}...)`,
    );
  }
});

test("quote pool stays within the documented footer reserve", () => {
  const longest = window.QUOTES.reduce(
    (max, [quote, attribution]) =>
      quote.length > max.quote.length ? { quote, attribution } : max,
    { quote: "", attribution: "" },
  );

  assert.ok(
    longest.quote.length <= 250,
    `longest quote is ${longest.quote.length} chars (${longest.attribution}); bump .q-foot reserve before shipping`,
  );
});
