export type Role = "super_admin" | "admin" | "murid";

export type Permission =
  | "user:create"
  | "user:read"
  | "user:update"
  | "user:reset_password"
  | "user:delete"
  | "kelas:create"
  | "kelas:read"
  | "kelas:update"
  | "kelas:share"
  | "guru:directory"
  | "attempt:create"
  | "attempt:submit"
  | "attempt:read_own"
  | "attempt:read_all"
  | "attempt:preview";

// Mirrors the ADR 0007 permission matrix. Drives UI visibility only.
// The backend is the enforcement boundary.
const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  super_admin: new Set([
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
  ]),
  admin: new Set([
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
  ]),
  murid: new Set(["attempt:create", "attempt:submit", "attempt:read_own"]),
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}
