import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './users/entities/role.entity';
import { Repository } from 'typeorm';
import { UserRoles } from './utils/enums';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}
  async onModuleInit() {
    try {
      //Add roles if not exist
      const roles = await this.rolesRepository.find();
      if (!roles.length) {
        const adminRole = new Role(UserRoles.ADMIN);
        await adminRole.save();
        const userRole = new Role(UserRoles.USER);
        await userRole.save();
        const placeAdminRole = new Role(UserRoles.PLACE_ADMIN);
        await placeAdminRole.save();
        const riderRole = new Role(UserRoles.COURIER);
        await riderRole.save();
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
