import { UserRole } from '@domain/constants/user';

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  role?: UserRole;
  createdAt: string;
  updatedAt: string;
}
