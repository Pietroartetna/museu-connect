export function canAccessAdministration(roles: readonly string[]): boolean {
  return roles.includes("admin");
}