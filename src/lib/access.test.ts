import { test } from "node:test";
import assert from "node:assert/strict";
import { canAccessAdministration } from "./access";

test("only an administrator can access the reserved area", () => {
  assert.equal(canAccessAdministration(["admin"]), true);
  assert.equal(canAccessAdministration(["socio"]), false);
  assert.equal(canAccessAdministration([]), false);
});