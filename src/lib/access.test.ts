import { test, expect } from "bun:test";
import { canAccessAdministration } from "./access";

test("only an administrator can access the reserved area", () => {
  expect(canAccessAdministration(["admin"])).toBe(true);
  expect(canAccessAdministration(["socio"])).toBe(false);
  expect(canAccessAdministration([])).toBe(false);
});