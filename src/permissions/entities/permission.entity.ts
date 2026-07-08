import { Column, Entity, ManyToMany } from 'typeorm';
import { CustomBaseEntity } from 'src/common/entities/custom-base.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';

@Entity({ name: 'permissions' })
export class PermissionEntity extends CustomBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  action: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];
}
