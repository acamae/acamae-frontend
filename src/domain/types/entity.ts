/**
 * Base entity interface
 * All domain entities should extend this interface
 * @template T - The type of the ID property
 */
export interface Entity<T = string> {
  id: T;
  createdAt?: Date;
  updatedAt?: Date;
}
