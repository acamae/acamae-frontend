import { UserRole } from '@domain/constants/user';
import { Entity } from '@domain/types/entity';

/**
 * User entity
 * Represents a user in the system
 */
export interface User extends Entity {
  username: string;
  email: string;
  password?: string; // Optional to not expose in responses
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isVerified?: boolean;
  verificationToken?: string;
  verificationExpiresAt?: Date;
  resetToken?: string;
  resetExpiresAt?: Date;
}
