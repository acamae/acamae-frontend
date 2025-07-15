declare module 'scripts/test-db-prisma.js' {
  export function setupTestDatabase(): Promise<void>;
  export function cleanTestDatabase(): Promise<void>;
  export function resetTestDatabase(): Promise<void>;
}
