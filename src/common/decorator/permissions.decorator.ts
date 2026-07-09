import { SetMetadata } from '@nestjs/common';

// Keep decorator available for future use but export symbol for consistency.
export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (permissions: string[] = []) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
