import { SetMetadata } from '@nestjs/common';
import { UserRoles } from 'src/utils/enums';

export const hasRoles = (...hasRoles: UserRoles[]) =>
  SetMetadata('roles', hasRoles);
