const test = require("node:test");
const assert = require("node:assert");
const { add, greet } = require("./app");

test("add works", () => {
  assert.strictEqual(add(2, 3), 5);
});

test("greet works", () => {
  assert.strictEqual(greet("Alex"), "Hello, Alex!");
});