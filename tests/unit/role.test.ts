import { describe, expect, it } from "vitest";
import { can, type Permission, type Role } from "@/types/role";

const ALL_PERMISSIONS: Permission[] = [
  "user:create",
  "user:read",
  "user:update",
  "user:reset_password",
  "user:delete",
  "kelas:create",
  "kelas:read",
  "kelas:update",
  "kelas:share",
  "guru:directory",
  "attempt:create",
  "attempt:submit",
  "attempt:read_own",
  "attempt:read_all",
  "attempt:preview",
];

// Mirrors the ADR 0007 permission matrix.
const EXPECTED: Record<Role, Permission[]> = {
  super_admin: [
    "user:create",
    "user:read",
    "user:update",
    "user:reset_password",
    "user:delete",
    "kelas:create",
    "kelas:read",
    "kelas:update",
    "kelas:share",
    "guru:directory",
    "attempt:read_all",
    "attempt:preview",
  ],
  admin: [
    "user:create",
    "user:read",
    "user:update",
    "user:reset_password",
    "user:delete",
    "kelas:read",
    "kelas:share",
    "guru:directory",
    "attempt:read_all",
    "attempt:preview",
  ],
  murid: ["attempt:create", "attempt:submit", "attempt:read_own"],
};

describe("can() permission matrix", () => {
  const roles = Object.keys(EXPECTED) as Role[];

  for (const role of roles) {
    describe(role, () => {
      for (const permission of ALL_PERMISSIONS) {
        const expected = EXPECTED[role].includes(permission);
        it(`grants ${permission} when expected to`, () => {
          expect(can(role, permission)).toBe(expected);
        });
      }
    });
  }
});
