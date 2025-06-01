import { ApiPromise } from '@domain/types/apiSchema';
import { Entity } from '@domain/types/entity';

/**
 * Generic repository interface
 * This interface defines the standard operations to be performed on a model
 * @template T - The entity type this repository handles
 */
export interface Repository<T extends Entity<unknown>> {
  findAll(): ApiPromise<T[]>;
  findById(id: string): ApiPromise<T | null>;
  save(entity: T): ApiPromise<T>;
  delete(id: string): ApiPromise<void>;
}
